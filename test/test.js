import { describe, it } from 'mocha';
import chai from 'chai';
import dirtyChai from 'dirty-chai';
import spies from 'chai-spies';
import { makeCompiler, runTest } from './util';

chai.use(spies);
chai.use(dirtyChai);

const expect = chai.expect;

const FILE_TYPES = /\.(jpe?g|png|gif|svg)$/i;
const WHALE_IMG = './resources/whale.jpeg';
const TOR_IMG = './resources/tor-portrait.jpeg';

// matches the format
// ((<path>( <size>)?)(,|$))+
const SRC_SET_FORMAT = /^((?:[a-z0-9A-Z]+?\.(?:jpe?g|svg|png|gif))(?: \d+[wx])?(,|$))+/;
const FILE_FORMAT = /^[a-z0-9A-Z]+?\.(?:jpe?g|svg|png|gif)/;

describe('Resource Query', () => {
  const RULE = {
    test: FILE_TYPES,
    use: [
      'srcset-loader',
      'file-loader',
    ],
  };

  it('none: returns the image without processing it and no placeholder', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${WHALE_IMG}');`,
      },
      rule: RULE,
    });

    return runTest(compiler, (window) => {
      expect(window.img).to.be.a('string');
    });
  });

  it('?placeholder: returns the image without processing it, and a placeholder', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${WHALE_IMG}?placeholder');`,
      },
      rule: RULE,
    });

    return runTest(compiler, (window) => {
      const img = window.img;

      expect(img).to.be.an('object');

      // no size specified, return image with size default
      expect(Object.keys(img.sources)).to.deep.equal(['default']);

      validateImgGeneric(img);
      validatePlaceholder(img.placeholder);
    });
  });

  it('?placeholder: returns the correct ratio for a landscape image', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${WHALE_IMG}?placeholder');`,
      },
      rule: RULE,
    });

    return runTest(compiler, (window) => {
      const img = window.img;

      expect(img.placeholder.ratio).to.be.above(1, 'Aspect ratio for a landscape image should be greater than 1');
    });
  });

  it('?placeholder: returns the correct ratio for a portrait image', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${TOR_IMG}?placeholder');`,
      },
      rule: RULE,
    });

    return runTest(compiler, (window) => {
      const img = window.img;

      expect(img.placeholder.ratio).to.be.above(0, 'Aspect ratio for a portrait image should be greater than 0');
      expect(img.placeholder.ratio).to.be.below(1, 'Aspect ratio for a portrait image should be less than 1');
    });
  });

  it('?sizes: returns the resized images, and no placeholder', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${WHALE_IMG}?sizes[]=200w&sizes[]=300w');`,
      },
      rule: RULE,
    });

    return runTest(compiler, (window) => {
      const img = window.img;

      expect(img).to.be.an('object');
      expect(Object.keys(img.sources)).to.deep.equal(['200w', '300w']);

      validateImgGeneric(img);
      expect(img.placeholder).to.be.undefined();
    });
  });

  it('?sizes: accepts the alternate syntax a+b+c', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${WHALE_IMG}?sizes=200w+300w');`,
      },
      rule: RULE,
    });

    return runTest(compiler, (window) => {
      const img = window.img;

      expect(img).to.be.an('object');
      expect(Object.keys(img.sources)).to.deep.equal(['200w', '300w']);

      validateImgGeneric(img);
      expect(img.placeholder).to.be.undefined();
    });
  });

  it('?sizes: size "default" returns the default image, untouched', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${WHALE_IMG}?sizes=200w+300w+default');`,
      },
      rule: RULE,
    });

    return runTest(compiler, (window) => {
      const img = window.img;

      expect(img).to.be.an('object');
      expect(Object.keys(img.sources)).to.deep.equal(['200w', '300w', 'default']);

      validateImgGeneric(img);
      expect(img.placeholder).to.be.undefined();
    });
  });

  it('?sizes&placeholder: returns both the resized images, and a placeholder', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${WHALE_IMG}?sizes=200w+300w&placeholder');`,
      },
      rule: RULE,
    });

    return runTest(compiler, (window) => {
      const img = window.img;

      expect(img).to.be.an('object');
      expect(Object.keys(img.sources)).to.deep.equal(['200w', '300w']);

      validateImgGeneric(img);
      validatePlaceholder(img.placeholder);
    });
  });

  it('?lightweight: only returns data which cannot be built during runtime', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${WHALE_IMG}?placeholder&sizes=200w+300w&lightweight');`,
      },
      rule: RULE,
    });

    return runTest(compiler, (window) => {
      const img = window.img;

      expect(img).to.be.an('object');

      // no size specified, return image with size default
      expect(Object.keys(img.sources)).to.deep.equal(['200w', '300w']);

      validateImgGeneric(img, true);
      validatePlaceholder(img.placeholder, true);
    });
  });

  it('?placeholder=[width]: accepts the placeholder size as value', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${WHALE_IMG}?placeholder=12&lightweight');`,
      },
      rule: RULE,
    });

    return runTest(compiler, (window) => {
      const img = window.img;

      expect(img).to.be.an('object');

      // no size specified, return image with size default
      expect(Object.keys(img.sources)).to.deep.equal(['default']);

      validateImgGeneric(img, true);
      validatePlaceholder(img.placeholder, true);

      return new Promise((resolve, reject) => {
        const imgTag = window.Image();
        imgTag.onload = function onLoad() {
          console.log(imgTag.naturalWidth);
          console.log(imgTag.naturalHeight);

          console.log(imgTag);
          resolve();
        };

        imgTag.onerror = function onError(e) {
          reject(e);
        };

        imgTag.src = img.placeholder.url;
      });
    });
  }).timeout(10000);
});

function validateImgGeneric(img, lightweight = false) {
  if (lightweight) {
    expect(img.srcSet).to.be.undefined();
  } else {
    expect(img.srcSet).to.match(SRC_SET_FORMAT, 'Invalid srcSet syntax');
  }

  for (const size of Object.keys(img.sources)) {
    expect(img.sources[size]).to.match(FILE_FORMAT, 'Invalid URL');
  }
}

function validatePlaceholder(placeholder, lightweight = false) {
  expect(placeholder.url).to.be.a('string');
  expect(placeholder.ratio).to.be.above(0, 'Ratio should be a float greater than zero');
  expect(placeholder.color).to.be.an('array', 'Color should be an array of 4 numbers.');

  expect(placeholder.color.length).to.equal(4, 'Color should be an array of 4 numbers.');

  for (let i = 0; i < 3; i++) {
    const channel = placeholder.color[i];
    expect(channel).to.be.a('number');
    expect(Number.isSafeInteger(channel)).to.equal(true, 'Not integer');
    expect(channel).to.be.within(0, 255);
  }

  expect(placeholder.color[3]).to.be.a('number');
  expect(placeholder.color[3]).to.be.within(0, 1, 'Alpha channel should be a float [0, 1]');

  if (lightweight) {
    expect(placeholder.url.startsWith('data:image/jpeg;base64,')).to.be.true('lightweight placeholders should not return the SVG wrapper.');
  } else {
    expect(placeholder.url.startsWith('data:image/svg+xml;base64,')).to.be.true('non-lightweight placeholders should return the SVG wrapper.');
  }
}
