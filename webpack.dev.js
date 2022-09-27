require("babel-polyfill");
const { merge } = require("webpack-merge");
const webpack = require("webpack");
const common = require("./webpack.common.js");
const path = require("path");
module.exports = merge(common, {
  entry: ["babel-polyfill", "./src/main.js"],

  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    host: "localhost",
    port: "3000",
    static: {
      directory: path.join(__dirname, "public"),
      watch: true,
    },
    hot: true,
    proxy: {
      "/imu": {
        target: "http://localhost:8080/imu",
        changeOrigin: true,
        pathRewrite: {
          "^/imu": "",
        },
      },
      "/imuws": {
        target: "ws://localhost:8080/imuws",
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          "^/imuws": "",
        },
      },
    },
    historyApiFallback: {
      rewrites: [{ from: /^\/$/, to: "/" }],
    },
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
});
