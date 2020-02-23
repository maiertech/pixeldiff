# pixeldiff

Capture screenshot of a website and compare with benchmark screenshot.

## Endpoints

- `POST https://pixeldiff.maier.tech/api`
- `GET https://pixeldiff.maier.tech/api`

## Parameters

| Parameter         | Required | Description                                                                                                                                                           |
| :---------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`             | yes      | Take screenshot of this URL and compare it with benchmark image.                                                                                                      |
| `benchmarkImgUrl` | yes      | Download PNG benchmark image from this URL.                                                                                                                           |
| `device`          | yes      | Device name from [Puppeteer's `DeviceDescriptors` module](https://github.com/GoogleChrome/puppeteer/blob/master/lib/DeviceDescriptors.js), e.g. `iPhone X landscape`. |

## Example requests

| Parameter         | Value                                |
| :---------------- | :----------------------------------- |
| `url`             | `https://www.google.com/`            |
| `benchmarkImgUrl` | `https://example.com/screenshot.png` |
| `device`          | `iPhone X`                           |

```
curl --request GET \
 --url 'https://pixeldiff.maier.tech/api?url=https%3A%2F%2Fwww.google.com%2F&benchmarkImgUrl=https%3A%2F%2Fexample.com%2Fscreenshot.png&device=iPhone%20X'
```

```
curl --request POST \
 --url https://pixeldiff.maier.tech/api \
 --header 'content-type: application/json' \
 --data '{
     "url": "https://www.google.com/",
     "benchmarkImgUrl": "https://example.com/screenshot.png",
     "device": "iPhone X"
   }'
```

## Response

`GET` request return a diff image in PNG format. `POST` requests return a diff object with the following properties:

| Property     | Type      | Description                                                                                                                                                                                                                                                                                    |
| :----------- | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `diff`       | `boolean` | `true` when there is a difference between the screenshot and the benchmark image.                                                                                                                                                                                                              |
| `diffImgUrl` | `string`  | A `POST` request does not return a diff image. In most scenarios all you need to know is whether or not there is a difference. The `diffImgUrl` is a URL for a `GET` request with which you can compute the diff image if you need it for manual review. You can copy this URL into a browser. |

## Errors

For status codes `400` and `500` it returns an array of error objects. The array length is normally one. In case of validation errors the array can have length greater than one. Each error object has the following properties:

- `param` (optional): Request parameter for which the error occured.
- `value` (optional): Value of the request parameter for which the error occured.
- `message` (required): Error message.

## Running the Pixeldiff API locally

Run

```
yarn run dev
```

to launch the API locally at

```
http://localhost:3000
```

(or any other path such as http://localhost:3000/api) using [micro-dev](https://github.com/zeit/micro-dev). In order to debug the lambda, run `yarn run dev:inspect`.

You can also use `now dev` to launch the lambda locally by running `npx now dev`. This emulates Zeit Now's production environment, but you loose your ability to debug.
