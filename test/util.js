import fs from 'fs';
import path from 'path';
import MemoryFs from 'memory-fs';
import webpack from 'webpack';
import jsdom from 'jsdom';
import { merge } from 'lodash';

export const ROOT_DIR = path.resolve(__dirname);
const BUNDLE = 'bundle.js';

const BASE_CONFIG = {
  entry: path.join(ROOT_DIR, 'main.js'),
  output: {
    filename: BUNDLE,
    path: ROOT_DIR,
  },
  resolveLoader: {
    alias: {
      'srcset-loader': path.resolve(__dirname, '../src/index'),
    },
  },
};

Object.freeze(BASE_CONFIG);

export function makeCompiler({ rule, files }) {
  const webpackConfig = merge({}, BASE_CONFIG, {
    module: {
      rules: [rule],
    },
  });

  const compiler = webpack(webpackConfig);

  const memoryFs = new MemoryFs();

  // Tell webpack to use our in-memory FS
  compiler.inputFileSystem = memoryFs;
  compiler.outputFileSystem = memoryFs;
  compiler.resolvers.normal.fileSystem = memoryFs;
  compiler.resolvers.context.fileSystem = memoryFs;

  ['readFileSync', 'statSync'].forEach((fn) => {
    // Preserve the reference to original function
    const memoryMethod = memoryFs[fn];

    compiler.inputFileSystem[fn] = function bridgeMethod(...args) {
      const filePath = args[0];

      // Fallback to real FS if file is not in the memoryFS
      if (memoryFs.existsSync(filePath)) {
        return memoryMethod.call(memoryFs, ...args);
      }

      return fs[fn].call(fs, ...args);
    };
  });

  for (const fileName of Object.keys(files)) {
    const filePath = path.join(ROOT_DIR, fileName);

    memoryFs.mkdirpSync(path.dirname(filePath));
    memoryFs.writeFileSync(filePath, files[fileName]);
  }

  return compiler;
}

const JSDOM_HTML = `
<!DOCTYPE html>
<html>
  <head></head>
  <body></body>
</html>
`;

export function runTest(compiler, assert) {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.compilation.errors.length) {
        reject(err || new Error(stats.compilation.errors));
        return;
      }

      const bundleJs = stats.compilation.assets[BUNDLE].source();

      jsdom.env({
        html: JSDOM_HTML,
        src: [bundleJs],
        virtualConsole: jsdom.createVirtualConsole().sendTo(console),
        done(err2, window) {
          if (err2) {
            reject(err2);
            return;
          }

          const result = assert(window);

          function cleanUp() {
            window.close();
            resolve();
          }

          if (result && result.then) {
            result.then(cleanUp);
          } else {
            cleanUp();
          }
        },
      });
    });
  });
}
