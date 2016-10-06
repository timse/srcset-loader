var sharp = require('sharp');
var sizeOf = require('image-size');
var loaderUtils = require('loader-utils');


function resizeImage(content, width) {
  return new Promise(function (resolve, reject) {
    const source = sizeOf(content);

    // dont scale up images, let the browser do that
    // and btw. wtf stop trying to fool me :P
    if (source.width < width) {
      return resolve(content);
    }

    const resizedImage = sharp(content)
      .resize(width)
      .toBuffer();

    resolve(resizedImage);
  });
};

module.exports = function (content) {
  this.cacheable && this.cacheable();
  const callback = this.async();

  var query = loaderUtils.parseQuery(this.query);
  const size = parseInt(query.size, 10);
  var that = this;
  resizeImage(content, size).then(function(buffer){
    callback(null, buffer);
  }, function(err){
    callback(err);
  });
};

module.exports.raw = true;