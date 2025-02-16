const path = require('path');

module.exports = {
  // Entry point of your application
  entry: './main.js', // Adjust if needed
  
  // Output bundling config
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  
  // Set the mode to 'development' or 'production'
  mode: process.env.NODE_ENV || 'development',
  
  // Module rules configuration
  module: {
    rules: [
      {
        test: /\.js$/, // Transpile ES6+ code using Babel
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i, // Handling images
        type: 'asset/resource',
      },
    ],
  },
  
  // Webpack dev server configuration
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
  },
};