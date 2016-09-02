// Karma configuration
// Generated on Fri Sep 02 2016 12:50:01 GMT+0200 (CEST)

var path = require('path');


module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],

    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'src/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          {
            test: /\.js$/,
            loader: 'babel',
            exclude: path.resolve(__dirname, 'node_modules'),
            query: {
              presets: ['es2015', 'react', 'stage-0'],
              plugins: [
                'transform-react-remove-prop-types'
              ]
            }
          },
          {
            test: /\.json$/,
            loader: 'json',
          }
        ]
      },
      externals: {
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
      }
    },

    webpackServer: {
      noInfo: true,
      stats: 'errors-only',
    },

    preprocessors: {
      'src/**/*.js': ['webpack', 'sourcemap']
    },

    plugins: [
      'karma-chrome-launcher',
      'karma-coverage',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-sourcemap-loader',
      'karma-webpack',
    ],

    browsers: ['Chromium'],

    resolveLoader: {
      root: path.join(__dirname, 'node_modules')
    },

    reporters: ['mocha'],

    coverageReporter: {
      dir : 'coverage/',
      reporters: [
        { type: 'lcov', subdir: 'lcov' },
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' },
      ]
    },

    port: 9876,
    colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: false,
    concurrency: Infinity
  })
}
