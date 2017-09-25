# `srcset`-loader for webpack 2
[![Build Status](https://travis-ci.org/timse/srcset-loader.svg?branch=master)](https://travis-ci.org/timse/srcset-loader)

A super flexible and easily chainable (with other loaders like `file-loader` or `image-webpack-loader`) srcset loader for webpack 2.

Its purpose is to automatically resize your images to the requested dimension*s* and return those as an srcSet.

## Installation

`npm i -D srcset-loader`

## Usage

There are basically two parts to configure, one part is the loader itself, the other part is the images you want to have a `srcset` for.
Instead of specifying the loader inline, you specify which images should be loaded with the `srcset-loader` in your webpack config,
then specify the sizes for the `srcset` on the resource itself.

e.g. your config could have a loader specified like this, notice the `?sizes` at the end of the resource match

```javascript
const webpackConfig = {
  // Only showing relevant parts.
  module: {
    rules: [{
      // match image files
      test: /\.(jpe?g|png|svg|gif)$/,

      // match one of the loader's main parameters (sizes and placeholder)
      resourceQuery: /[?&](sizes|placeholder)(=|&|\[|$)/,

      use: [
        'srcset-loader',

        // any other loader
        'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
        'image-webpack-loader?optimizationLevel=7&interlaced=false',
      ],
    }],
  },

  // ...
};
```

and a resource request could look like this:

```javascript
import image from './image.jpeg?sizes=200w+800w';
```

This allows us to separate the configuration of the loader, and the specification of the image sizes of the `srcset`.
This also allows us to use the same loaders we use for *normal* image requests (e.g. optimizers like `webpack-image-loader` or the `file-loader`).
Basically all this loader does is creating multiple requests for each `srcset` image and let known and well tested loaders do the heavy lifting.

### Why is the `srcset` loader before the other loaders

Its actually very important that you add the `srcset-loader` before all the other loaders, as the `srcset-loader` uses
webpack's *pitch* mechanism to split your import request into multiple import request which will all use the loaders
specified after `srcset-loader`.

Simplified it works something like this:

```javascript
// webpack gets this request
const someSrcSet = require('./someImage.jpg?sizes=800w+500w+200w');

//----------------------------------------

// the srcset loader gets this *single* request that actually looks something like this:
const someSrcSet = require('srcset-loader!url-loader!image-webpack-loader!./someImage.jpg?sizes=800w+500w+200w');

// and splits it up into *three* requests looking more like this:
const someSrcSet = [
  require('url-loader!image-webpack-loader!srcset-loader/resize!./someImage.jpg?size=800'),
  require('url-loader!image-webpack-loader!srcset-loader/resize!./someImage.jpg?size=500'),
  require('url-loader!image-webpack-loader!srcset-loader/resize!./someImage.jpg?size=200'),
];
```

Thats all :), simple and robust.

### Can I use `srcset`-loader inline?
Yes you can, but why? Seriously why? Please write an issue.

## `srcset-loader` options

### `sizes`

`sizes` is the main feature of the srcset-loader, you use this option to specify the different image sizes you wish to import.

You can either specify the different sizes as a standard array (`?sizes[]=100w&sizes[]=200w`) or using the less verbose, srcset-specific, syntax (`?sizes=100w+200w`)

The sizes values must follow the format `<number>w` (where w stands for width), or the string `default` (not resized). `<density>x` is not a supported format.

### `lightweight`

This will remove any property that can be computed at runtime in order to reduce the size of the bundle.

### `placeholder`

`placeholder` will generate and inline a tiny placeholder which you can display while the full-sized image loads.

You can specify the size of the placeholder as the value of the option (e.g. `placeholder=12`). By default, the size is 20px (width).

## Results of an image loaded with srcset-loader

An image imported with the `srcset-loader` returns an Object which contains the following properties:

### `srcSet: string`

This property contains the string to use as the value of `HTMLImageElement`'s `srcset` (i.e. `<img srcset="..."/>`).

e.g.

```javascript
import image from './image.jpeg?sizes=200w+800w';
// image.srcSet => 'xxxx.jpeg 200w,xxxx.jpeg 800w'
```

*Note: This key is not available if `lightweight` is specified in either the Loader options or the resource query.*

### `sources: object`

The `sources` object is a map where the keys are the requested sizes of the image and the values are the URLs to those images.

e.g.

```javascript
import image from './image.jpeg?sizes=200w+800w';

/*
image.sources => {
  '200w': 'xxx.jpg',
  '800w': 'xxx.jpg',
}
*/
```

### `placeholder`

Only available if the option `placeholder` is present in either the loader configuration or the resource query.

This will generate an object with these keys:
 - `url`:
    - if the `lightweight` option is present, a tiny version of the image, encoded in base64.
    - otherwise, that tiny image but wrapped inside a SVG which applies a blur filter on the image.
 - `color`: an array containing the rgba color representing the most ubiquitous color of the image. `[r, g, b, a]`
 - `ratio`: the width to height ratio of the image.

e.g.

```js
import image from './image.jpeg?sizes=200w+800w&placeholder';
/*
image.placeholder => {
  url: 'data:image/svg+xml;base64,...',
  color: [198, 123, 87, 1],
  ratio: 1.587302
}
*/
```

check the placeholder example for a possible use case.

*Note: You can use `placeholder` on its own, without specifying `sizes`.*
