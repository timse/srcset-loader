'use strict';
var path = require('path');

module.exports = {
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [{
      test: /.*\.(jpe?g|png|gif|svg)$/,
      loaders: [
        'file?hash=sha512&digest=hex&name=[name]_plain_image_loaded.[ext]',
        'image-webpack?optimizationLevel=7&interlaced=false',
      ]
    }]
  }
};
