require("babel-polyfill");
const { merge } = require("webpack-merge");
const webpack = require("webpack");
const common = require("./webpack.common.js");
const path = require("path");
module.exports = merge(common, {
  entry: ["babel-polyfill", "./src/main.js"],

  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
});
