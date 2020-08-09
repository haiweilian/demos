const webpack = require("./lib/webpack");
const options = require("./webpack.config");

new webpack(options).run();
