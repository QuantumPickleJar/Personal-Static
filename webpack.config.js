const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    main: './main.js', // your main entry
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    publicPath: '/',
    clean: true
  },
  plugins: [
    // Generates dist/index.html from your src/index.html
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      chunks: ['main'], // which entry chunk(s) to include
    }),
    // Generates dist/projects.html from your src/projects.html
    new HtmlWebpackPlugin({
      template: './projects.html',
      filename: 'projects.html',
      chunks: ['main'], // or a separate chunk if you want
    }),
    // If you have contact.html, do the same:
    new HtmlWebpackPlugin({
      template: './contact.html',
      filename: 'contact.html',
      chunks: ['main'],
    }),

    // Copy partials, JSON, etc. so they appear in dist/ as well
    new CopyWebpackPlugin({
      patterns: [
        { from: 'partials/', to: 'partials/' },
        { from: 'rsc/', to: 'rsc/' },
        { from: 'style.css', to: 'style.css' },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 9000,
    hot: true,
    open: true,
  },
};
