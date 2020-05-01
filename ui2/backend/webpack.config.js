// webpack.config.js
const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  target: "node",
  mode: "development", // 設定開發模式就不會 minify
  devtool: "none", // 編譯後的程式碼不會有 eval 這樣的用法
  entry: "./index.js", // 在 index 檔案後的 .js 副檔名是可選的
  output: {
    path: path.join(__dirname, "build"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.(env|pem|svg|png)$/,
        use: [{ loader: "file-loader" }],
      },
    ],
  }, // node: {
  //   net: "empty",
  //   tls: "empty",
  //   fs: "empty",
  //   child_process: "empty",
  // },
  externals: [nodeExternals()],
};
