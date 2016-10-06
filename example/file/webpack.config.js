'use strict';
const path = require('path');
const config = require('../webpack.common.config');

config.entry = path.join(__dirname, 'example.js');
config.output = {
  path: path.join(__dirname, 'build'),
  filename: 'main.js',
  publicPath: '/build/'
};
config.module.loaders.push({
  test: /.*\.(jpe?g|png)\?srcset/,
  loaders: [
    '../../index.js',
    'file?hash=sha512&digest=hex&name=[hash].[ext]',
    'image-webpack?optimizationLevel=7&interlaced=false',
  ]
});

module.exports = config;