import DataUri from 'datauri';
import imageSize from 'image-size';
import getPixels from 'get-pixels';
import { parseQuery, resizeImage } from './util';

function bufferToDataUri(type, buffer) {
  return new DataUri().format(type, buffer).content;
}

function getPixelsAsync(shrinkedImageBuffer, type) {
  return new Promise((resolve, reject) => {
    getPixels(shrinkedImageBuffer, type, (err, pixels) => {
      if (err) {
        return reject(err);
      }

      return resolve([
        pixels.data[0],
        pixels.data[1],
        pixels.data[2],
        pixels.data[3],
      ]);
    });
  });
}

function getColor(buffer, imageType) {
  const type = `image/${imageType}`;

  return resizeImage(buffer, 2, 2)
    .then((shrinkedImageBuffer) => getPixelsAsync(shrinkedImageBuffer, type))
    .then(color => {
      color[3] = Math.round(color[3] / 255 * 1000) / 1000;
      return color;
    });
}

function createPlaceholder(content, options) {
  const { size: width, lightweight } = options;

  let size;
  let placeholderUrl;
  return resizeImage(content, width)
    .then((resizedBuffer) => {
      size = imageSize(resizedBuffer);
      const imageUrl = bufferToDataUri(`.${size.type}`, resizedBuffer);

      if (lightweight) {
        return imageUrl;
      }

      const blurredImage = (
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${size.width} ${size.height}">
          <filter id="x">
            <feGaussianBlur stdDeviation="1" />
          </filter>
          <image width="100%" height="100%" xlink:href="${imageUrl}" filter="url(#x)"/>
        </svg>`
      );

      return bufferToDataUri('.svg', new Buffer(blurredImage, 'utf8'));
    })
    .then((url) => {
      placeholderUrl = url;

      return getColor(content, size.type);
    })
    .then((color) => {
    
      // Use the size of the unresized image to calculate the exact ratio
      const originalContentSize = imageSize(content);
    
      return {
        color,
        url: placeholderUrl,
        ratio: (originalContentSize.width / originalContentSize.height),
      };
    });
}

/**
 * Query: lightweight (bool), size (?number)
 */
module.exports = function placeholderLoader(content) {
  if (this.cacheable) {
    this.cacheable();
  }

  const callback = this.async();

  const options = parseQuery(this.query);

  options.size = Number(options.size);
  if (!options.size || Number.isNaN(options.size)) {
    options.size = 20;
  }

  createPlaceholder(content, options)
    .then((placeholder) => {
      callback(null, `module.exports = ${JSON.stringify(placeholder)}`);
    }, callback);
};

module.exports.raw = true;
