const path = require('path');

module.exports = {
  entry: {
    hobodiet: './src/hobodiet.ts',
    nightcap: './src/nightcap.ts',
  },
  mode: 'development',
  devtool: false,
  output: {
    path: path.resolve(__dirname, 'build', 'scripts', 'bean-daily'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        // Include ts, tsx, js, and jsx files.
        test: /\.(ts|js)x?$/,
        // exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [],
  externals: {
    kolmafia: 'commonjs kolmafia',
  },
};
