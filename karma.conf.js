const path = require('path');


module.exports = (config) => {
  config.set({
    basePath: '',

    browsers: ['Chromium'],

    frameworks: ['mocha'],

    files: [
      'src/**/*.spec.js',
    ],

    exclude: [
      'node_modules',
    ],

    preprocessors: {
      'src/**/*.spec.js': ['webpack', 'sourcemap'],
    },

    reporters: ['mocha', 'coverage'],

    coverageReporter: {
      reporters: [
        { type: 'text-summary' },
        { type: 'html', dir: path.resolve(__dirname, 'coverage') },
      ],
    },

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          {
            test: /\.js$/,
            loader: 'babel',
            exclude: path.join(__dirname, 'node_modules'),
            query: {
              presets: ['es2015', 'react', 'stage-0'],
              plugins: [
                ['istanbul', { exclude: ['**/*.spec.js'] }],
              ],
            },
          },
          { test: /\.json$/, loader: 'json-loader' },
        ],
      },
    },

    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only',
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity,
  });
};
