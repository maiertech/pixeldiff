const pixeldiff = require('../api/pixeldiff');

test('invalid url param', () => {
  const params = {
    url: 'invalid',
    benchmarkImgUrl: 'https://example.com/screenshot.png',
    device: 'iPhone X',
  };
  let request;
  const response = { json: jest.fn(), status: jest.fn() };

  // Mock GET request.
  request = {
    method: 'GET',
    query: params,
  };
  pixeldiff(request, response);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(400);
  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith([
    {
      param: 'url',
      value: 'invalid',
      message: 'Invalid URL.',
    },
  ]);

  response.json.mockClear();
  response.status.mockClear();

  // Mock POST request.
  request = {
    method: 'GET',
    query: params,
  };
  pixeldiff(request, response);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(400);
  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith([
    {
      param: 'url',
      value: 'invalid',
      message: 'Invalid URL.',
    },
  ]);
});

test('invalid benchmarkImgUrl param', () => {
  const params = {
    url: 'https://example.com',
    benchmarkImgUrl: 'invalid',
    device: 'iPhone X',
  };
  let request;
  const response = { json: jest.fn(), status: jest.fn() };

  // Mock GET request.
  request = {
    method: 'GET',
    query: params,
  };
  pixeldiff(request, response);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(400);
  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith([
    {
      param: 'benchmarkImgUrl',
      value: 'invalid',
      message: 'Invalid URL.',
    },
  ]);

  response.json.mockClear();
  response.status.mockClear();

  // Mock POST request.
  request = {
    method: 'POST',
    body: params,
  };
  pixeldiff(request, response);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(400);
  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith([
    {
      param: 'benchmarkImgUrl',
      value: 'invalid',
      message: 'Invalid URL.',
    },
  ]);
});

test('invalid device param', () => {
  const params = {
    url: 'https://example.com',
    benchmarkImgUrl: 'https://example.com/screenshot.png',
    device: 'invalid',
  };
  let request;
  const response = { json: jest.fn(), status: jest.fn() };

  // Mock GET request.
  request = {
    method: 'GET',
    query: params,
  };
  pixeldiff(request, response);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(400);
  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith([
    {
      param: 'device',
      value: 'invalid',
      message: 'Invalid device.',
    },
  ]);

  response.json.mockClear();
  response.status.mockClear();

  // Mock POST request.
  request = {
    method: 'POST',
    body: params,
  };
  pixeldiff(request, response);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(400);
  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith([
    {
      param: 'device',
      value: 'invalid',
      message: 'Invalid device.',
    },
  ]);
});
