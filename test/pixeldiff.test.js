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
    expect.assertions(6);

    // Test GET request.
    try {
      await axios.get(localhost, {
        params: {
          url: 'invalid',
          benchmarkImgUrl: 'https://example.com/screenshot.png',
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
          param: 'url',
          value: 'invalid',
        },
      ]);
    }

    // Test POST request.
    try {
      await axios.post(localhost, {
        url: 'invalid',
        benchmarkImgUrl: 'https://example.com/screenshot.png',
        device: 'iPhone X',
      });
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
    expect.assertions(6);

    // Test GET request.
    try {
      await axios.get(localhost, {
        params: {
          url: 'https://example.com',
          benchmarkImgUrl: 'https://example.com/screenshot.png',
          device: 'invalid',
        },
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
      await axios.post(localhost, {
        url: 'https://example.com',
        benchmarkImgUrl: 'https://example.com/screenshot.png',
        device: 'invalid',
      });
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
});
