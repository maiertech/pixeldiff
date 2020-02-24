const http = require('http');

const listen = require('test-listen');
const axios = require('axios');

const pixeldiff = require('../api/pixeldiff');

let server;
let localhost;

describe('pixeldiff API', () => {
  beforeAll(async () => {
    server = http.createServer(pixeldiff);
    localhost = await listen(server);
  });

  // Workaround for https://github.com/facebook/jest/issues/8554.
  afterAll(done => {
    server.close(() => {
      setTimeout(done, 100);
    });
  });

  // Most tests would jest/no-try-expect if it was on:
  // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-try-expect.md
  // The suggested alternative with rejects.toThrow does not work.
  // Tests with expect in catch block need to use expect.assertions to ensure they do not accidentally pass.

  it('invalid url param', async () => {
    const params = {
      url: 'invalid',
      benchmarkImgUrl: 'https://example.com/screenshot.png',
      device: 'iPhone X',
    };

    expect.assertions(6);

    // Test GET request.
    try {
      await axios.get(localhost, { params });
    } catch ({ response }) {
      expect(response.status).toStrictEqual(422);
      expect(response.data.errors).toHaveLength(1);
      expect(response.data.errors).toStrictEqual([
        {
          location: 'query',
          msg: 'Invalid URL',
          param: 'url',
          value: 'invalid',
        },
      ]);
    }

    // Test POST request.
    try {
      await axios.post(localhost, params);
    } catch ({ response }) {
      expect(response.status).toStrictEqual(422);
      expect(response.data.errors).toHaveLength(1);
      expect(response.data.errors).toStrictEqual([
        {
          location: 'body',
          msg: 'Invalid URL',
          param: 'url',
          value: 'invalid',
        },
      ]);
    }
  });

  it('invalid benchmarkImgUrl param', async () => {
    expect.assertions(6);

    // Test GET request.
    try {
      await axios.get(localhost, {
        params: {
          url: 'https://example.com',
          benchmarkImgUrl: 'invalid',
          device: 'iPhone X',
        },
      });
    } catch ({ response }) {
      expect(response.status).toStrictEqual(422);
      expect(response.data.errors).toHaveLength(1);
      expect(response.data.errors).toStrictEqual([
        {
          location: 'query',
          msg: 'Invalid URL',
          param: 'benchmarkImgUrl',
          value: 'invalid',
        },
      ]);
    }

    // Test POST request.
    try {
      await axios.post(localhost, {
        url: 'https://example.com',
        benchmarkImgUrl: 'invalid',
        device: 'iPhone X',
      });
    } catch ({ response }) {
      expect(response.status).toStrictEqual(422);
      expect(response.data.errors).toHaveLength(1);
      expect(response.data.errors).toStrictEqual([
        {
          location: 'body',
          msg: 'Invalid URL',
          param: 'benchmarkImgUrl',
          value: 'invalid',
        },
      ]);
    }
  });

  it('invalid device param', async () => {
    const params = {
      url: 'https://example.com',
      benchmarkImgUrl: 'https://example.com/screenshot.png',
      device: 'invalid',
    };

    expect.assertions(6);

    // Test GET request.
    try {
      await axios.get(localhost, {
        params,
      });
    } catch ({ response }) {
      expect(response.status).toStrictEqual(422);
      expect(response.data.errors).toHaveLength(1);
      expect(response.data.errors).toStrictEqual([
        {
          location: 'query',
          msg: 'Invalid device',
          param: 'device',
          value: 'invalid',
        },
      ]);
    }

    // Test POST request.
    try {
      await axios.post(localhost, params);
    } catch ({ response }) {
      expect(response.status).toStrictEqual(422);
      expect(response.data.errors).toHaveLength(1);
      expect(response.data.errors).toStrictEqual([
        {
          location: 'body',
          msg: 'Invalid device',
          param: 'device',
          value: 'invalid',
        },
      ]);
    }
  });

  it('comparison that results in a diff', async () => {
    // Test POST request only.
    const params = {
      benchmarkImgUrl: 'https://screenshots.maier.tech/header/iphone-x.png',
      url: 'https://www.google.com',
      device: 'iPhone X',
    };
    const response = await axios.post(localhost, params);
    expect(response.data).toStrictEqual({
      diff: true,
      diffImgUrl: `${localhost}/?url=https%3A%2F%2Fwww.google.com&benchmarkImgUrl=https%3A%2F%2Fscreenshots.maier.tech%2Fheader%2Fiphone-x.png&device=iPhone%20X`,
    });
  });
});
