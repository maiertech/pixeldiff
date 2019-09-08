const querystring = require('querystring');
const validator = require('validator');
const { devices } = require('puppeteer-core');
const axios = require('axios');
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;

module.exports = async (request, response) => {
  let url;
  let benchmarkImgUrl;
  let device;

  switch (request.method) {
    case 'GET':
      url = request.query.url || '';
      benchmarkImgUrl = request.query.benchmarkImgUrl || '';
      device = request.query.device || '';
      break;
    case 'POST':
      url = request.body.url || '';
      benchmarkImgUrl = request.body.benchmarkImgUrl || '';
      device = request.body.device || '';
      break;
    default:
      // This branch should never be executed.
      // Routes in now.json need to be configured to accept GET and POST only.
      response.status(400);
      response.json({
        message: `${request.method} method not supported.`,
      });
      return;
  }

  // Validate request parameters.
  const validations = [
    {
      param: 'url',
      value: url,
      message: 'Invalid URL.',
      validate: () =>
        validator.isURL(url, {
          protocols: ['http', 'https'],
          require_protocol: true,
        }),
    },
    {
      param: 'benchmarkImgUrl',
      value: benchmarkImgUrl,
      message: 'Invalid URL.',
      validate: () =>
        validator.isURL(benchmarkImgUrl, {
          protocols: ['http', 'https'],
          require_protocol: true,
        }),
    },
    {
      param: 'device',
      value: device,
      message: 'Invalid device.',
      validate: () => devices[device],
    },
  ];

  // Every failed validation is converted into an error message.
  const errors = validations
    .filter(validation => !validation.validate())
    .map(({ param, value, message }) => ({ param, value, message }));
  if (errors.length !== 0) {
    response.status(400);
    response.json(errors);
    return;
  }

  // Capture screenshot.
  // Must use try catch syntax instead of adding .catch().
  // Otherwise it is not possible to exit from lambda.
  let captureResponse;
  try {
    captureResponse = await axios.post(
      'https://capture.maier.tech/api',
      {
        url,
        device,
      },
      {
        responseType: 'arraybuffer',
      }
    );
  } catch (error) {
    // Return status 400 because url was probably bad.
    response.status(400);
    response.json([
      {
        param: 'url',
        value: url,
        message: `Failed to capture screenshot: ${error.message}`,
      },
    ]);
    return;
  }

  let screenshotImg;
  try {
    screenshotImg = PNG.sync.read(captureResponse.data);
  } catch (error) {
    // Return status 500 because if something fails here we cannot blame the params.
    response.status(500);
    response.json([
      {
        param: 'url',
        value: url,
        message: `Failed to read screenshot image: ${error.message}`,
      },
    ]);
    return;
  }

  // Download benchmark image.
  // Must use try catch syntax instead of adding .catch().
  // Otherwise it is not possible to exit from lambda.
  let downloadResponse;
  try {
    downloadResponse = await axios.get(benchmarkImgUrl, {
      responseType: 'arraybuffer',
    });
  } catch (error) {
    // Return status 400 because benchmarkImgUrl was probably bad.
    response.status(400);
    response.json([
      {
        param: 'benchmarkImgUrl',
        value: benchmarkImgUrl,
        message: `Failed to download benchmark image: ${error.message}`,
      },
    ]);
    return;
  }

  let benchmarkImg;
  try {
    benchmarkImg = PNG.sync.read(downloadResponse.data);
  } catch (error) {
    // Return status 400 because download was probably not a valid PNG file.
    response.status(400);
    response.json([
      {
        param: 'benchmarkImgUrl',
        value: benchmarkImgUrl,
        message: `Failed to read benchmark image: ${error.message}`,
      },
    ]);
    return;
  }

  // Default: do not create diff image.
  let diffImg = { data: null };

  // GET request returns diff image.
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
    // Return status 500 because if comparison erros out, we probably cannot blame params.
    response.status(500);
    response.send([
      {
        message: `Failed to compare screenshot with benchmark image: ${error.message}`,
      },
    ]);
    return;
  }

  // For GET requests return diff image.
  if (request.method === 'GET') {
    response.setHeader('Content-Type', 'image/png');
    response.status(200);
    response.send(PNG.sync.write(diffImg));
    return;
  }

  // For POST requests return comparison result (diff) and URL to retrieve diff image (diffImgUrl).
  response.status(200);
  response.json({
    diff: mismatchedPixels > 0,
    diffImgUrl: `https://pixeldiff.maier.tech/api?${querystring.stringify({
      url,
      benchmarkImgUrl,
      device,
    })}`,
  });
};
