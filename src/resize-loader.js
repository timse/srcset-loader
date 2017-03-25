import { resizeImage, parseQuery } from './util';

module.exports = function resizeLoader(content) {
  if (this.cacheable) {
    this.cacheable();
  }

  const callback = this.async();

  const query = parseQuery(this.query);
  const size = parseInt(query.size, 10);

  resizeImage(content, size).then((buffer) => {
    callback(null, buffer);
  }, (err) => {
    callback(err);
  });
};

module.exports.raw = true;
