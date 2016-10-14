const sharp = require('sharp');
const sizeOf = require('image-size');
const loaderUtils = require('loader-utils');


function resizeImage(content, width) {
  const source = sizeOf(content);

  // dont scale up images, let the browser do that
  // and btw. wtf stop trying to fool me :P
  if (source.width < width) {
    return Promise.resolve(content);
  }

  return sharp(content).resize(width).toBuffer();
}

module.exports = function resizeLoader(content) {
  if (this.cacheable) {
    this.cacheable();
  }
  const callback = this.async();

  const query = loaderUtils.parseQuery(this.query);
  const size = parseInt(query.size, 10);

  resizeImage(content, size).then((buffer) => {
    callback(null, buffer);
  }, (err) => {
    callback(err);
  });
};

module.exports.raw = true;
