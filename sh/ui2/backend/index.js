require("dotenv").config();

const version = "cakeVendingBackend v1.3";

const log4js = require("log4js");
log4js.configure({
  appenders: {
    file: {
      type: "dateFile",
      filename: "log/cakeBackend.log",
      maxLogSize: 1000000, // 1 MB
      backups: 5,
      category: "normal",
    },
    out: {
      type: "stdout",
    },
  },
  categories: {
    default: { appenders: ["file", "out"], level: "trace" },
  },
});
const logger = log4js.getLogger("cake");

const express = require("express");
const app = express();
const http = require("http");
const https = require("https");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const exec = require("child_process").exec;
const mqtt = require("mqtt");
const jwt = require("express-jwt");
const sqlite3 = require("sqlite3").verbose();
const os = require("os");
const axios = require("axios");

const mqttOpt = {
  port: process.env.MACHINE_LOCAL_MQTT_BROKER_PORT,
  clientId: version,
};

const httpsOptions = {
  key: fs.readFileSync("./ssl_files/server_private_key.pem"),
  ca: [fs.readFileSync("./ssl_files/cert.pem")],
  cert: fs.readFileSync("./ssl_files/server_cert.pem"),
};

const checkModuleAliveInterval = 10 * 60 * 1000; //ms
const maxModuleDeadCnt = 0;
const maxMachTemp = 70;

let bucketAliveMsg = "bucketAliveMsg";
let lastBucketAliveMsg = "lastBucketAliveMsg";
let bucketDeadCnt = 0;

let ovenAliveMsg = "ovenAliveMsg";
let lastOvenAliveMsg = "lastOvenAliveMsg";
let ovenDeadCnt = 0;

let robotAliveMsg = "robotAliveMsg";
let lastRobotAliveMsg = "lastRobotAliveMsg";
let robotDeadCnt = 0;

let latchAliveMsg = "latchAliveMsg";
let lastLatchAliveMsg = "lastLatchAliveMsg";
let latchDeadCnt = 0;

const mqttClient = mqtt.connect("mqtt://localhost", mqttOpt);

const iNameList = os.networkInterfaces();

logger.info(version + " started");

let db = new sqlite3.Database("mydatebase.db", function (err) {
  if (err) throw err;
});

// db.serialize(function () {
//   //db.run 如果 Staff 資料表不存在，那就建立 Staff 資料表
//   db.run("CREATE TABLE IF NOT EXISTS  Stuff (thing TEXT)");
//   let stmt = db.prepare("INSERT INTO Stuff VALUES (?)");

//   //寫進10筆資料
//   for (var i = 0; i < 10; i++) {
//     stmt.run("staff_number" + i);
//   }

//   stmt.finalize();

//   db.each("SELECT rowid AS id, thing FROM Stuff", function (err, row) {
//     //log 出所有的資料
//     logger.trace(row.id + ": " + row.thing);
//   });
// });

db.close();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(log4js.connectLogger(logger, { level: "info" }));

app.get(
  "/version",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    res.send(version);
  }
);

app.post(
  "/recipe/start/original",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    // exec("node /home/pi/recipe/original.js", function (err, stdout, stderr) {
    exec("python /home/pi/recipe/test.py", function (err, stdout, stderr) {
      if (err !== null) {
        res.sendStatus(500);
        logger.error(stderr);
      } else {
        res.sendStatus(200);
        logger.trace(stdout);
      }
    });
  }
);

app.get(
  "/ad/playList",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    let readDir = fs.readdirSync("/home/pi/ad");
    res.send(readDir);
  }
);

app.post(
  "/stop/oven/heating",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    res.sendStatus(200);
  }
);

app.post(
  "/machine/alive",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    res.send(res.body);
  }
);

app.post(
  "/coin/enable",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    mqttClient.publish("coin/cmd/enable", "true");
    res.sendStatus(200);
  }
);

app.post(
  "/coin/disable",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    mqttClient.publish("coin/cmd/enable", "false");
    res.sendStatus(200);
  }
);

// http.createServer(app).listen(process.env.MACHINE_BACKEND_PORT, () => {
//   logger.info(
//     version + " listening on port " + process.env.MACHINE_BACKEND_PORT
//   );
// });

https
  .createServer(httpsOptions, app)
  .listen(process.env.MACHINE_BACKEND_PORT, () => {
    logger.info(
      version + " listening on port " + process.env.MACHINE_BACKEND_PORT
    );
  });

// http
//   .createServer(app)
//   .listen(process.env.MACHINE_BACKEND_PORT, "localhost", () => {
//     logger.info(
//       "localhost " +
//         version +
//         " listening on port " +
//         process.env.MACHINE_BACKEND_PORT
//     );
//   });

// https
//   .createServer(httpsOptions, app)
//   .listen(process.env.MACHINE_BACKEND_PORT, iNameList.tun0[0].address, () => {
//     logger.info(
//       iNameList.tun0[0].address +
//         " " +
//         version +
//         " listening on port " +
//         process.env.MACHINE_BACKEND_PORT
//     );
//   });

const postWebAPI = (url, payload) => {
  axios({
    method: "post",
    baseURL: process.env.TELEGRAM_BOT_IP + url,
    headers: {
      Authorization: "Bearer " + process.env.CAKE_ACCESS_TOKEN,
      "content-type": "text/plain",
    },
    data: payload,
  })
    .then((res) => {
      logger.trace("POST " + url + " " + payload + " " + res.status);
    })
    .catch((err) => {
      logger.error(err.message);
    });
};

mqttClient.on("message", function (topic, message) {
  if (topic === "bucket/status/alive") {
    bucketAliveMsg = message.toString();
  } else if (topic === "oven/status/alive") {
    ovenAliveMsg = message.toString();
  } else if (topic === "robot/status/alive") {
    robotAliveMsg = message.toString();
  } else if (topic === "latch/status/alive") {
    latchAliveMsg = message.toString();
  } else if (topic === "bucket/status/machTemp") {
    const macTempStr = message.toString();
    if (parseFloat(macTempStr) >= maxMachTemp) {
      postWebAPI("/machine/alarm", "machine temperature: " + macTempStr);
    }
  } else if (topic === "bucket/status/alarm") {
    postWebAPI("/machine/alarm", message.toString());
  }
});

const checkModuleAlive = () => {
  if (bucketAliveMsg === lastBucketAliveMsg) {
    bucketDeadCnt = bucketDeadCnt + 1;
  } else {
    bucketDeadCnt = 0;
  }
  lastBucketAliveMsg = bucketAliveMsg;
  if (bucketDeadCnt > maxModuleDeadCnt) {
    postWebAPI("/machine/alarm", "bucket is dead");
  }

  if (ovenAliveMsg === lastOvenAliveMsg) {
    ovenDeadCnt = ovenDeadCnt + 1;
  } else {
    ovenDeadCnt = 0;
  }
  lastOvenAliveMsg = ovenAliveMsg;
  if (ovenDeadCnt > maxModuleDeadCnt) {
    postWebAPI("/machine/alarm", "oven is dead");
  }

  if (robotAliveMsg === lastRobotAliveMsg) {
    robotDeadCnt = robotDeadCnt + 1;
  } else {
    robotDeadCnt = 0;
  }
  lastRobotAliveMsg = robotAliveMsg;
  if (robotDeadCnt > maxModuleDeadCnt) {
    postWebAPI("/machine/alarm", "robot is dead");
  }

  if (latchAliveMsg === lastLatchAliveMsg) {
    latchDeadCnt = latchDeadCnt + 1;
  } else {
    latchDeadCnt = 0;
  }
  lastLatchAliveMsg = latchAliveMsg;
  if (latchDeadCnt > maxModuleDeadCnt) {
    postWebAPI("/machine/alarm", "latch is dead");
  }
};
setInterval(checkModuleAlive, checkModuleAliveInterval);

const mqttSubsTopis = [
  "bucket/status/#",
  "oven/status/#",
  "robot/status/#",
  "latch/status/#",
];

mqttClient.on("connect", function () {
  logger.info(version + " connect to broker OK");
  mqttSubsTopis.forEach(function (topic, index, array) {
    mqttClient.subscribe(topic);
  });
});
