require("dotenv").config({ path: "../frontend/.env" });

const VERSION = "main_backend v2.0"; //May 13, 2021
const port = process.env.MAIN_BACKEND_PORT;

const log4js = require("log4js");
const logger = log4js.getLogger(VERSION);
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const fs = require("fs");
const exec = require("child_process").exec;
const jwt = require("express-jwt");
const sqlite3 = require("sqlite3").verbose();
const os = require("os");
const axios = require("axios");
const util = require("util");
const { stringify } = require("comment-json");

log4js.configure({
  appenders: {
    file: {
      type: "dateFile",
      filename: "log/cakeVending.log",
      maxLogSize: 2000000, // 1 MB
      backups: 5,
      category: "normal",
    },
    out: {
      type: "stdout",
    },
  },
  categories: {
    default: { appenders: ["file", "out"], level: "debug" },
  },
});

const machineInfo = {
  name: process.env.NAME,
  ver: VERSION,
  connect2Cloud: process.env.CONNECT_2_CLOUD === "true" ? true : false,
};

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.text());
app.use(log4js.connectLogger(logger, { level: "info" }));

http.createServer(app).listen(port, () => {
  logger.info(stringify(machineInfo) + " listening on port " + port);
});

app.get(
  "/version",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
    algorithms: ["HS256"],
  }),
  (req, res) => {
    res.send(machineInfo.ver);
  }
);
