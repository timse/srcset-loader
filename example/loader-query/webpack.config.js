'use strict';
var path = require('path');

module.exports = {
  entry: path.join(__dirname, 'example.js'),
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'main.js',
    publicPath: '/build/'
  },
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      [
        {
          test: /whale.jpeg/,
          loaders: [
            '../../index.js?sizes=200w+800w',
            'file?hash=sha512&digest=hex&name=[hash].[ext]',
          ]
        },
        {
          test: /.*\.(jpe?g|png|gif|svg)$/,
          loaders: [
            'file?hash=sha512&digest=hex&name=[name]_plain_image_loaded.[ext]',
            'image-webpack?optimizationLevel=7&interlaced=false',
          ]
        }
      ]
    ]
  }
};
