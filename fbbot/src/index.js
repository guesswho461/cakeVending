const express = require("express");
const app = express();
const http = require("http");
const https = require("https");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
const config = require("../../config");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(morgan("dev"));

app.get("/version", (req, res) => {
  res.send(config.serverVersion);
});

let lastText = "initial";

app.post("/module/offline", (req, res) => {
  lastText = req.body;
  res.sendStatus(200);
});

http.createServer(app).listen(config.serverPort, () => {
  console.log("cake vending server listening on port " + config.serverPort);
});

module.exports = async function App(context) {
  if (context.event.isText) {
    if (context.event.text === "show offline") {
      await context.sendText(lastText);
    } else {
      await context.sendText("welcome to cake vending fb bot");
    }
  }
};
