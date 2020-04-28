const version = "cakeVendingBackend v1.0";

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
require("dotenv").config();
// const gpio = require("rpi-gpio");
// const A4988 = require("./A4988");

//todo: idle的時候每五分鐘回抽

const mqttOpt = {
  port: process.env.MACHINE_LOCAL_MQTT_BROKER_PORT,
  clientId: version,
};

const httpsOptions = {
  key: fs.readFileSync("./ssl_files/server-key.pem"),
  ca: [fs.readFileSync("./ssl_files/cert.pem")],
  cert: fs.readFileSync("./ssl_files/server-cert.pem"),
};

const coinPinIdx = 7; //GPIO 4, pin 7
const coinEnablePinIdx = 11; //GPIO 17, pin 11
const kanbanEnablePinIdx = 13; //GPIO 27, pin 13
const gateLimitPinIdx = 15; //GPIO 22, pin 15

// const gateMotor = new A4988({
//   step: 24, //GPIO 24, pin 18
//   dir: 25, //GPIO 25, pin 22
//   ms1: 15, //GPIO 15, pin 10
//   ms2: 18, //GPIO 18, pin 12
//   ms3: 23, //GPIO 23, pin 16
//   enable: 14, //GPIO 14, pin 8
// });
// gateMotor.step_size = "sixteenth";

const gateOpen = -4000;
const gateClose = 4000;

let coinCnt = 0;
let coinEnable = false;
let coinValue = false;
let coinLastValue = false;
const coinValueDebounceLimit = 0;
let coinValueDebounceCnt = 0;

const gateLimitDebounceLimit = 5;
let gateLimitDebounceCnt = 0;
let gateLimitValue = false;
let gateLimitLastValue = false;

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
    exec("node /home/pi/recipe/original.js", function (err, stdout, stderr) {
      logger.trace(req.body.cmd);
      res.send(stdout);
    });
    res.sendStatus(200);
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
    // let readDir = fs.readdirSync("/home/pi/ad");
    let readDir = fs.readdirSync("/home");
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

http
  .createServer(app)
  .listen(process.env.MACHINE_BACKEND_PORT, "localhost", () => {
    logger.info(
      "localhost " +
        version +
        " listening on port " +
        process.env.MACHINE_BACKEND_PORT
    );
  });

https
  .createServer(httpsOptions, app)
  .listen(process.env.MACHINE_BACKEND_PORT, iNameList.tun0[0].address, () => {
    logger.info(
      iNameList.tun0[0].address +
        " " +
        version +
        " listening on port " +
        process.env.MACHINE_BACKEND_PORT
    );
  });

let db = new sqlite3.Database("mydatebase.db", function (err) {
  if (err) throw err;
});

db.serialize(function () {
  //db.run 如果 Staff 資料表不存在，那就建立 Staff 資料表
  db.run("CREATE TABLE IF NOT EXISTS  Stuff (thing TEXT)");
  let stmt = db.prepare("INSERT INTO Stuff VALUES (?)");

  //寫進10筆資料
  for (var i = 0; i < 10; i++) {
    stmt.run("staff_number" + i);
  }

  stmt.finalize();

  db.each("SELECT rowid AS id, thing FROM Stuff", function (err, row) {
    //log 出所有的資料
    logger.trace(row.id + ": " + row.thing);
  });
});

db.close();

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
  if (topic === "coin/cmd/enable") {
    if (message.toString() === "true") {
      coinEnable = true;
      // gpio.write(coinEnablePinIdx, true);
      logger.trace("coin/cmd/enable true");
    }
  } else if (topic === "kanban/cmd/enable") {
    if (message.toString() === "true") {
      // gpio.write(kanbanEnablePinIdx, true);
      logger.trace("kanban/cmd/enable true");
    } else {
      // gpio.write(kanbanEnablePinIdx, false);
      logger.trace("kanban/cmd/enable false");
    }
  } else if (topic === "gate/cmd/open") {
    if (message.toString() === "true") {
      // gateMotor.enable().then(
      //   gateMotor.turn(gateOpen).then((steps) => {
      //     logger.trace(`gate turned ${steps} steps`);
      //     gateMotor.disable();
      //   })
      // );
      logger.trace("gate/cmd/open true");
    } else {
      // gateMotor.enable().then(
      //   gateMotor.turn(gateClose).then((steps) => {
      //     logger.trace(`gate turned ${steps} steps`);
      //     gateMotor.disable();
      //   })
      // );
      logger.trace("gate/cmd/open false");
    }
  } else if (topic === "gate/cmd/stop") {
    if (message.toString() === "true") {
      // gateMotor.stop();
      // gateMotor.disable();
      logger.trace("gate/cmd/stop true");
    }
  } else if (topic === "bucket/status/alive") {
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
  "coin/cmd/#",
  "kanban/cmd/#",
  "gate/cmd/#",
  "bucket/status/#",
  "oven/status/#",
  "robot/status/#",
  "latch/status/#",
];

mqttClient.on("connect", function () {
  // gateMotor.turn(gateClose);
  logger.info("connect to broker OK");
  mqttSubsTopis.forEach(function (topic, index, array) {
    mqttClient.subscribe(topic);
  });
});

// gpio.on("change", function (channel, value) {
//   // logger.trace("pin " + channel + " is " + value);
//   //if (coinEnable) {
//   if (channel === coinPinIdx) {
//     if (value === true) {
//       if (coinValueDebounceCnt < coinValueDebounceLimit) {
//         coinValueDebounceCnt = coinValueDebounceCnt + 1;
//       } else {
//         coinValue = true;
//         coinValueDebounceCnt = 0;
//       }
//     } else {
//       coinValue = false;
//       coinValueDebounceCnt = 0;
//     }
//     //if (coinValue === true && coinLastValue === false) {
//     if (value === true) {
//       coinCnt = coinCnt + 1;
//       logger.trace(coinCnt);
//       mqttClient.publish("coin/status/inc", "1");
//       if (coinCnt >= 5) {
//         coinEnable = false;
//         coinCnt = 0;
//         gpio.write(coinEnablePinIdx, false);
//         logger.trace("coin disable");
//       }
//     }
//     coinLastValue = coinValue;
//   }
//   //}
//   if (channel === gateLimitPinIdx) {
//     if (value === true) {
//       if (gateLimitDebounceCnt < gateLimitDebounceLimit) {
//         gateLimitDebounceCnt = gateLimitDebounceCnt + 1;
//       } else {
//         gateLimitValue = true;
//         gateLimitDebounceCnt = 0;
//       }
//     } else {
//       gateLimitValue = false;
//       gateLimitDebounceCnt = 0;
//     }
//     if (gateLimitValue === true && gateLimitLastValue === false) {
//       gateMotor.stop();
//       logger.trace("gate stoped");
//     }
//     gateLimitLastValue = gateLimitValue;
//   }
// });

// gpio.setup(coinEnablePinIdx, gpio.DIR_OUT, function (err) {
//   gpio.write(coinEnablePinIdx, false);
// });
// gpio.setup(kanbanEnablePinIdx, gpio.DIR_OUT, function (err) {
//   gpio.write(kanbanEnablePinIdx, false);
// });
// gpio.setup(coinPinIdx, gpio.DIR_IN, gpio.EDGE_RISING);
// gpio.setup(gateLimitPinIdx, gpio.DIR_IN, gpio.EDGE_RISING);
