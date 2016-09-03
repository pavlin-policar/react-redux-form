var path = require('path');


module.exports = {
  devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: [/node_modules/, /tests/],
        query: {
          presets: ['es2015', 'react', 'stage-0'],
          plugins: [],
        }
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
    ]
  }
};
