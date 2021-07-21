require("dotenv").config({ path: "../frontend/.env" });

const argv_opts = {
  string: ["device"],
  default: { device: "COM12" }, //"/dev/ttyACM0"
};
const argv = require("minimist")(process.argv.slice(2), argv_opts);

const VERSION = "gm65_backend v1.0"; //May 13, 2021
const port = process.env.GM65_BACKEND_PORT;
const timeout = process.env.GM65_GET_CODE_TIMEOUT * 1000; //sec to ms

const log4js = require("log4js");
const logger = log4js.getLogger(VERSION);
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");

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

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.text());
app.use(log4js.connectLogger(logger, { level: "trace" }));

http.createServer(app).listen(port, "localhost", () => {
  logger.info(VERSION + " listening on port " + port);
});

app.get("/version", (req, res) => {
  res.send(VERSION);
});

let reader;
let timer;
let setIntervalObj;
let scaning = false;
let scanOK = false;
app.get("/code", (req, res) => {
  reader = require("./gm65.js")(argv.device, logger, {
    onScan: (code) => {
      logger.info("code: ", code);
      res.send(code);
      reader.close();
      scanOK = true;
      //clearTimeout(timer);
      clearInterval(setIntervalObj);
    },
  });
  scaning = true;
  scanOK = false;
  reader.trigger();

  /* timer = setTimeout(() => {
    reader.close();
    logger.error("time out, reader close");
    res.sendStatus(408);
  }, timeout);*/
  setIntervalObj = setInterval(function () {
    if (!scaning) {
      clearInterval(setIntervalObj);
      res.sendStatus(500);
    }
  }, 50);
});

app.post("/close", (req, res) => {
  //if (timer) clearTimeout(timer);
  if (!scanOK) reader.close();
  scaning = false;
  res.sendStatus(200);
});

app.post("/scanDisable", (req, res) => {
  console.log("scan 1Sec");
  if (!scanOK) reader.scanDisable();
  res.sendStatus(200);
});
