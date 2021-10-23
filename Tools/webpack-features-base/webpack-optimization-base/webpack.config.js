const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DllReferencePlugin = require("webpack/lib/DllReferencePlugin");
const AddAssetHtmlPlugin = require("add-asset-html-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  mode: "development",
  // mode: "production",
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  // 转换文件
  module: {
    rules: [
      {
        // 用正则去匹配要用该 loader 转换的 CSS 文件
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"],
      },
      {
        // 解析文件
        test: /\.jpg$/,
        use: ["file-loader"],
      },
      {
        // 解析文件
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
  // 扩展功能
  plugins: [
    new MiniCssExtractPlugin({
      filename: "bundle.css",
    }),
    new DllReferencePlugin({
      manifest: require("./dist/react.manifest.json"),
    }),
    new HtmlWebpackPlugin({
      publicPath: "./",
      template: "./index.html",
    }),
    new AddAssetHtmlPlugin({
      publicPath: "./",
      filepath: path.resolve(__dirname, "./dist/*.dll.js"),
    }),
    new BundleAnalyzerPlugin(),
  ],
  // 本地服务
  devServer: {
    hot: true,
    inline: true,
    host: "localhost",
    port: 8080,
    open: true,
  },
};
