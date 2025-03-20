// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Simplify the publicPath logic
const isProduction = process.env.NODE_ENV === 'production';
const publicPath = ''; // Use empty string for relative paths in all environments


module.exports = {
  mode: isProduction ? 'production' : 'development',
  target: 'web',
  // 1) The main entry for JS
  entry: {
    main: './main.js'
  },

  // 2) Where Webpack puts the bundle
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    publicPath: publicPath,
    clean: true
  },

  devtool: 'source-map',

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
        // Make sure this path is correct and partials are being copied
        { 
          from: './partials', 
          to: 'partials',
          globOptions: {
            ignore: ['**/.DS_Store']
          }
        },
        // Other patterns remain the same
        { from: 'rsc/', to: 'rsc/' },
        { from: 'style.css', to: 'style.css' },
        { from: 'css/', to: 'css/' },
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
