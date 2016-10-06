# `srcset`-loader for webpack
A super flexible and easily chainable (with other loaders like `file-loader` or `image-webpack-loader`) srcset loader for webpack

## Installation

`npm i -D srcset-loader`

## `srcset`-object

An image required with the `srcset-loader` returns an Object containing two keys:

### `srcSet`-string

The `srcSet`-string to be used in `<img srcset="..."/>`

e.g.

```js
  const someSrcSet = require('./someImage.jpg?srcset&size[]=800w&size[]=500w&size[]=200w');
  // someSrcSet.srcSet => 'xxxx.jpg 800w, xxxx.jpg 500w, xxxx.jpg 200w'
```

### `sources`-Object

The `sources`-Object with urls to all images contained in the `srcSet`

e.g.

```js
  const someSrcSet = require('./someImage.jpg?srcset&size[]=800w&size[]=500w&size[]=200w');
  /* 
  someSrcSet.sources => {
    '800w': 'xxx.jpg',
    '500w': 'xxx.jpg',
    '200w': 'xxx.jpg'
  }
  */
```

## Usage

There are basically two parts to configure, one part is the loader itself, the other part is the images you want to have a `srcset` for.
Instead of specifying the loader inline, you specify which images should be loaded with the `srcset-loader` in your webpack config,
then specify the sizes for the `srcset` on the resource itself.

e.g. your config could have a loader specified like this, notice the `?srcset` at the end of the resource match

```js
config.module.loaders.push({
  test: /.*\.(jpe?g|png)\?srcset/,
  loaders: [
    'srcset',
    'file?hash=sha512&digest=hex&name=[hash].[ext]',
    'image-webpack?optimizationLevel=7&interlaced=false',
  ]
});
```

and a resource request could look like this:

```js
var srcSet = require('../some-image.jpeg?srcset&sizes[]=200w&sizes[]=800w');
```

This allows us to seperate the configuration of the loader and the specification of the sizes of the `srcset`. 
This also allows us to use the same loaders we use for *normal* image requests (e.g. optimizers like `webpack-image-loader` or the `file-loader`).
Basically all this loader does is creating multiple requests for each `srcset` image and let known and well tested loaders do the heavy lifting.

### Adding `srcset-loader` to the webpack config

Most likely you will use a mixture of `file`/`url-loader` and `srcset-loader` therefore it makes sense to add a certain identifier to the `test` of the `srcset-loader`.
In the example above `?srcset` is added to every request that should be handled by the `srcset-loader`, any image request without this match will be handled like a plain old image.
The `srcset-loader` then relies on and profits from other well known and tested loaders e.g. the `file-loader`. This also means it can only be used in conjunction with them as it wont emit files by itself. (see the `simple` example).

Lets assume you already have the following config for loading images:

```js
{
  test: /\.(png|jpg|gif|svg)$/,
  loader: 'url-loader?limit=' + (3 * 1024) + '&name=[hash].[ext]!image-webpack?bypassOnDebug&optimizationLevel=7'
},
```

adding the `srcset-loader` is as simple as:

 ```js
const imageLoader = 'url-loader?limit=' + (3 * 1024) + '&name=[hash].[ext]!image-webpack?bypassOnDebug&optimizationLevel=7';
// ...
{
  test: /\.(png|jpg|gif|svg)$/,
  loader: imageLoader
},
{
  test: /\.(png|jpg|gif|svg)\?srcset/,
  loader: 'srcset' + imageLoader
},
```

Thats it. You only configure how images should be loaded once. All images, including those created for the `srcset` will go through the same process.
No inline-loaders or config in the code required. No differences in image quality either.

#### Why is the `srcset` loader before the other loaders
Its actually very important that you add the `srcset-loader` before all the other loaders, as the `srcset-loader` uses webpacks *pitch* mechanism to split requests up and pipe them through your specified loaders.
Simplified it works something like this:

```js
// webpack gets this request
const someSrcSet = require('./someImage.jpg?srcset&size[]=800w&size[]=500w&size[]=200w');

//----------------------------------------

// the srcset loader gets this *single* request that actually looks something like this:
const someSrcSet = require('srcset-loader!url-loader!image-webpack-loader!./someImage.jpg?srcset&size[]=800w&size[]=500w&size[]=200w');

// and splits it up into *three* requests looking more like this:
const someSrcSet = [
  require('url-loader!image-webpack-loader!./resize!./someImage.jpg?size[]=800'),
  require('url-loader!image-webpack-loader!./resize!./someImage.jpg?size[]=500'),
  require('url-loader!image-webpack-loader!./resize!./someImage.jpg?size[]=200'),
];
```

Thats all :), simple and robust.

#### Can I use `srcset`-loader inline?
Yes you can, but why? Seriously why? Please write an issue.

### Specifying desired `srcset` dimensions
Once you setup the `srcset`-loader in the webpack config you can require your images and specify the sized you want

e.g.

```jsx
const someSrcSet = require('./someImage.jpg?srcset&size[]=800w&size[]=400w&size[]=200w');
//...
return (<img srcSet={someSrcSet.srcSet} src={someSrcSet.sources['800w']} sizes="(min-width: 1200px) 70vw, (min-width: 800px) 50vw, 200px" />);
```