'use strict';

const path = require('path');

module.exports = {
  resolve: {
    alias: {
      'srcset-loader/runtime': path.resolve(__dirname, '../runtime.js'),
    },
  },
  resolveLoader: {
    alias: {
      'srcset-loader': path.resolve(__dirname, '../'),
    },
  },
  output: {
    filename: 'main.js',
    publicPath: '/build/',
  },
  module: {
    rules: [{
      test: /\.(jpe?g|png|gif|svg)$/,
      use: [{
        loader: 'file-loader',
        options: {
          hash: 'sha512',
          digest: 'hex',
          name: '[name]_plain_image_loaded.[ext]',
        },
      }, {
        loader: 'image-webpack-loader',
        options: {
          mozjpeg: {
            quality: 65,
          },
          pngquant: {
            quality: '65-90',
            speed: 4,
          },
          svgo: {
            plugins: [{
              removeViewBox: false,
            }, {
              removeEmptyAttrs: false,
            }],
          },
        },
      }],
    }]
  },
};
