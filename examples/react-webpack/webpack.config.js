const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = async () => {
  const { CodeSweeperWebpackPlugin } = await import('../../dist/plugins/webpack.js');
  
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      new CodeSweeperWebpackPlugin({ 
        // Your configuration options here
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3000,
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
  };
};