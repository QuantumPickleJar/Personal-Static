// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'web',
  // 1) The main entry for your JS
  entry: {
    main: './main.js' // Make sure this file is at project root or adjust path
  },

  // 2) Where Webpack puts the bundle
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    publicPath: '/', // This is fine if you serve from root locally.
    clean: true
  },

  // 3) Plugins
  plugins: [
    // Turn index.html into dist/index.html, injecting the script
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      chunks: ['main']
    }),
    // Turn projects.html into dist/projects.html
    new HtmlWebpackPlugin({
      template: './projects.html',
      filename: 'projects.html',
      chunks: ['main']
    }),
    // Turn resources.html into dist/resources.html
    new HtmlWebpackPlugin({
      template: './resources.html',
      filename: 'resources.html',
      chunks: ['main']
    }),

    // Copy static assets/folders into dist
    new CopyWebpackPlugin({
      patterns: [
        { from: 'partials/', to: 'partials/' },
        { from: 'rsc/', to: 'rsc/' },
        { from: 'style.css', to: 'style.css' },
        { from: 'css/', to: 'css/' },
        // Important: copy modules folder so we can fetch('modules/img-carousel.html')
        { from: 'htmlModules/', to: 'htmlModules/' }
      ],
    }),
  ],

  // 4) Dev server
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 9000,
    hot: false,
    open: true,
  },
};
