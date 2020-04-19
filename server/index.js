const express = require("express");
const app = express();
const http = require("http");
const https = require("https");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
const config = require("../config");
const { SlackOAuthClient } = require("messaging-api-slack");

const slackClient = SlackOAuthClient.connect(
  "xoxb-1082926328692-1089407482497-XJENYGhYIJQrZRndVDGrk1aZ"
);

const https_options = {
  key: fs.readFileSync("./ssl_files/server_private_key.pem"),
  ca: [fs.readFileSync("./ssl_files/cert.pem")],
  cert: fs.readFileSync("./ssl_files/server_cert.pem"),
};

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(morgan("dev"));

app.get("/version", (req, res) => {
  res.send(config.serverVersion);
});

app.post("/module/offline", (req, res) => {
  slackClient.postMessage("#statusreport", req.body);
  res.sendStatus(200);
});

http.createServer(app).listen(config.serverPort, () => {
  console.log("cake vending server listening on port " + config.serverPort);
});

// https.createServer(https_options, app).listen(config.serverPort, () => {
//   console.log("cake vending server listening on port " + config.serverPort);
// });
