# pixeldiff

Capture website screenshot and compare with benchmark screenshot.

## Endpoints

- `GET /pixeldiff`
- `POST /pixeldiff`

## Parameters

`GET` and `POST` requests use the same parameters:

- `url` (required): Take screenshot of this URL and compare it with benchmark image.
- `benchmarkImgUrl` (required): Download PNG benchmark image from this URL.
- `device` (required): Device name from [Puppeteer's `DeviceDescriptors` module](https://github.com/GoogleChrome/puppeteer/blob/master/lib/DeviceDescriptors.js), e.g. `iPhone X landscape`.

## Example Requests

### GET

```
curl --request GET \
  --url 'https://api.maier.tech/pixeldiff?url=https%3A%2F%2Fexample.com%2Flogin&benchmarkImgUrl=https%3A%2F%2Fscreenshots.example.com%2Flogin%2Fiphone-x&device=iPhone%20X'
```

### POST

```
curl --request POST \
 --url https://api.maiertech.tech/pixeldiff \
 --header 'content-type: application/json' \
 --data '{
     "url": "https://example.com/login",
     "benchmarkImgUrl": "https://screenshots.example.com/login/iphone-x",
     "device": "iPhone X"
   }'
```

## Response

### GET

Returns a diff image in PNG format.

### POST

Returns a diff object with the following properties:

- `diff` (`boolean`): `true` when there is a difference between the screenshot and the benchmark screenshot.
- `diffImgUrl` (`string`): URL at which the diff image can be retrieved. Corresponds to a `GET` request. The diff image is not stored anywhere but is calculated every time this URL is sent as `GET` request. This URL can be copied into a browser.

### Errors

For status codes `400` and `500` it returns an array of error objects. The array length is normally one. In case of validation errors the array can have length greater than one. Each error object has the following properties:

- `param` (optional): Request parameter for which the error occured.
- `value` (optional): Value of the request parameter for which the error occured.
- `message` (required): Error message.
