const path = require("path");

module.exports = {
  target: "node",
  mode: "development",
  devtool: "none",
  entry: "./index.js",
  output: {
    path: path.join(__dirname, "build"),
    filename: "bundle.js",
  },
};
