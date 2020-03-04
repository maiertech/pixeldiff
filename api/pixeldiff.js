const querystring = require('querystring');

const express = require('express');
const { check, validationResult } = require('express-validator');
const { devices } = require('puppeteer-core');
const axios = require('axios');
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;

const app = express();

app.use(express.json());

// Validations.
const validations = [
  check('url')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
    })
    .withMessage('Invalid URL'),
  check('benchmarkImgUrl')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
    })
    .withMessage('Invalid URL'),
  check('device')
    .custom(device => devices[device])
    .withMessage('Invalid device'),
];

// Restrict methods to GET and POST on Zeit Now.
app.all('*', validations, async (request, response, next) => {
  next(new Error('This is a rogue error'));
  // Validate params.
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  // Read params.
  const url = request.body.url || request.query.url;
  const benchmarkImgUrl =
    request.body.benchmarkImgUrl || request.query.benchmarkImgUrl;
  const device = request.body.device || request.query.device;

  // Step 1: capture screenshot.
  const captureResponse = await axios
    .post(
      'https://capture.maier.tech/api',
      {
        url,
        device,
      },
      {
        responseType: 'arraybuffer',
      }
    )
    .catch(error =>
      next(new Error(`Failed to capture screenshot: ${error.message}`))
    );

  // Step 2: read screenshot image as PNG.
  let screenshotImg;
  try {
    screenshotImg = PNG.sync.read(captureResponse.data);
  } catch (error) {
    return next(new Error(`Failed to read screenshot image: ${error.message}`));
  }

  // Step 3: download benchmark image.
  const downloadResponse = await axios
    .get(benchmarkImgUrl, {
      responseType: 'arraybuffer',
    })
    .catch(error =>
      next(new Error(`Failed to download benchmark image: ${error.message}`))
    );

  // Step 4: read benchmark image as PNG.
  let benchmarkImg;
  try {
    benchmarkImg = PNG.sync.read(downloadResponse.data);
  } catch (error) {
    return next(new Error(`Failed to read benchmark image: ${error.message}`));
  }

  // Step 5: compute diff between screenshot image and benchmark image.

  // Default: do not create diff image.
  let diffImg = { data: null };

  // Only for GET request return diff image.
  if (request.method === 'GET') {
    // Diff image needs to have same size as benchmark image.
    diffImg = new PNG({
      width: benchmarkImg.width,
      height: benchmarkImg.height,
    });
  }

  let mismatchedPixels;

  // Compare screenshot with benchmark image.
  try {
    mismatchedPixels = pixelmatch(
      screenshotImg.data,
      benchmarkImg.data,
      diffImg.data,
      benchmarkImg.width,
      benchmarkImg.height,
      {
        threshold: 0.1,
      }
    );
  } catch (error) {
    return next(
      new Error(
        `Failed to compare screenshot image with benchmark image: ${error.message}`
      )
    );
  }

  // For GET requests return diff image.
  if (request.method === 'GET') {
    response.setHeader('Content-Type', 'image/png');
    response.status(200);
    return response.send(PNG.sync.write(diffImg));
  }

  // For POST requests return comparison result (diff) and URL to retrieve diff image (diffImgUrl).
  response.status(200);
  return response.json({
    diff: mismatchedPixels > 0,
    // On Zeit Now request is forwarded from where SSL is terminated.
    // Look at x-forwarded-* first and then at alternatives.
    diffImgUrl: `${request.headers['x-forwarded-proto'] ||
      request.protocol}://${request.headers['x-forwarded-host'] ||
      request.headers.host}${request.path}?${querystring.stringify({
      url,
      benchmarkImgUrl,
      device,
    })}`,
  });
});

module.exports = app;
