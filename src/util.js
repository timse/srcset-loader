import loaderUtils from 'loader-utils';
import sharp from 'sharp';
import sizeOf from 'image-size';

export function parseQuery(query) {
  if (!query) {
    return {};
  }

  if (typeof query === 'string') {
    return loaderUtils.parseQuery(query);
  }

  return query;
}

export function resizeImage(content, width, height) {
  const source = sizeOf(content);

  // dont scale up images, let the browser do that
  // and btw. wtf stop trying to fool me :P
  if (source.width < width) {
    return Promise.resolve(content);
  }

  return sharp(content).resize(width, height).toBuffer();
}
