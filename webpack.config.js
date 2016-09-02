var path = require('path');


module.exports = {
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
};
