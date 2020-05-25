const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
      filename: 'index.js',
      libraryTarget: 'umd'
    },
    plugins: [
      new LodashModuleReplacementPlugin({
        currying: true,
        paths: true,
        cloning: true
      })
    ],
    externals : [
      {
        react: {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react'
        }
      }
    ],
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader',
          ],
        }
      ]
    }
};
