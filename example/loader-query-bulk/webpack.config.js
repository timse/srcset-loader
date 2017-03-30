'use strict';

const path = require('path');
const config = require('../webpack.common.config');

config.entry = path.join(__dirname, 'example.js');
config.output.path = path.join(__dirname, 'build');

config.module.rules.unshift({
  test: /\/images\/.*\.(jpe?g|png|gif|svg)$/,
  loader: 'srcset-loader',
  options: {
    sizes: ['200w', '800w'],
  },
});

module.exports = config;
