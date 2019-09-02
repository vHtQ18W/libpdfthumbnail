const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 5000
  },
  entry: {
    'main': path.join(__dirname, 'src', 'index.js')
  },
  mode: 'development',
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'pdf',
      template: 'src/index.html'
    })
    ]
};
