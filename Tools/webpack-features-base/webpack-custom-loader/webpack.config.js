const path = require("path");
const htmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    index: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
  },
  mode: "development",
  // loader的加载路径
  resolveLoader: {
    // modules: ["node_modules"],
    modules: ["./loader"],
  },
  module: {
    rules: [
      {
        test: /\.less/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
      {
        test: /\.js/,
        use: [
          {
            loader: "test-loader",
            options: {
              name: "传递参数",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
    }),
  ],
};
