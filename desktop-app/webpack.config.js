const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  devtool: argv.mode === 'production' ? 'source-map' : 'eval-source-map',
  
  entry: './src/index.jsx',
  
  output: {
    path: path.resolve(__dirname, 'renderer'),
    filename: 'renderer.js',
    publicPath: './'
  },
  
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              ['@babel/plugin-transform-runtime'],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource'
      }
    ]
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body'
    })
  ],
  
  devServer: {
    static: {
      directory: path.join(__dirname, 'renderer'),
    },
    compress: true,
    port: 3001,
    hot: true,
    historyApiFallback: true
  },
  
  target: 'electron-renderer'
});
