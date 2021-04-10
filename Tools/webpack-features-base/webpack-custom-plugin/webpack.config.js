const path = require("path");
const htmlWebpackPlugin = require("html-webpack-plugin");
const textWebpackPlugin = require("./plugins/text-webpack-plugin");

module.exports = {
  entry: {
    index: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.less/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
    }),
    new textWebpackPlugin({
      name: "textWebpackPlugin",
    }),
  ],
};
