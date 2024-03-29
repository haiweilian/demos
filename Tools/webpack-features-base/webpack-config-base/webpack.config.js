const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    filename: "bundle-[contenthash].js",
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
      filename: "bundle-[contenthash].css",
    }),
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
