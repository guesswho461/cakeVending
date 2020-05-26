require("dotenv").config();

const version = "cakeVendingBackend v1.9";

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
const util = require("util");
const { stringify } = require("comment-json");

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
const maxMachTemp = 70; //Celsius
const bowlCntWarningLevel = 60; //bowl count
const bowlCntAlarmLevel = 40; //bowl count
const batterVolWarningLevel = 14; //distance, greater means lower
const batterVolAlarmLevel = 16; //distance, greater means lower
let maxFridgeTemp = 20; //Celsius
const checkGateCmdDelay = 10 * 60 * 1000; //ms
const unitPrice = 50; //NTD
const coinEnableDelayToResponse = 5000;
const dbPath = "mydatebase.db";

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

let batterVolStr = "1";
let bowlCntStr = "1";
let fridgeTempStr = "1";
let macTempStr = "1";

let canPost = true;

const mqttClient = mqtt.connect("mqtt://localhost", mqttOpt);

const iNameList = os.networkInterfaces();
const localIP = iNameList.tun0[0].address;
// const localIP = "localhost";
// const localIP = "172.27.240.59";

const machineInfo = {
  name: process.env.LOCALNAME,
  ip: localIP,
};

const postWebAPI = (url, payload) => {
  if (canPost) {
    axios({
      method: "post",
      baseURL:
        process.env.TELEGRAM_BOT_IP + ":" + process.env.SERVER_PORT + url,
      // baseURL: "https://localhost:10010" + url,
      headers: {
        Authorization: "Bearer " + process.env.CAKE_ACCESS_TOKEN,
        "content-type": "text/plain",
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      data: payload,
    })
      .then((res) => {
        logger.trace("POST " + url + " " + payload + " " + res.status);
      })
      .catch((err) => {
        logger.error(err.message);
      });
  }
};

logger.info(version + " started");
postWebAPI("/machine/online", stringify(machineInfo));

const today = new Date();
const tableName =
  "[" +
  today.getFullYear() +
  "-" +
  (today.getMonth() + 1) +
  "-" +
  today.getDate() +
  "]";

let db = new sqlite3.Database(dbPath, function (err) {
  if (err) throw err;
});

db.serialize(function () {
  const statement = util.format(
    "CREATE TABLE IF NOT EXISTS %s (time TEXT PRIMARY KEY, sellCnt TEXT, batterVol TEXT, bowlCnt TEXT, fridgeTemp TEXT, macTemp TEXT)",
    tableName
  );
  db.run(statement);
});

const setToDB = (
  tableName,
  date,
  sellCnt,
  batterVol,
  bowlCnt,
  fridgeTemp,
  macTemp
) => {
  const statement = util.format(
    "INSERT INTO %s VALUES (%d, %d, %s, %s, %s, %s)",
    tableName,
    date,
    sellCnt,
    batterVol,
    bowlCnt,
    fridgeTemp,
    macTemp
  );
  db.run(statement);
};

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
    setToDB(
      tableName,
      Date.now(),
      1,
      batterVolStr,
      bowlCntStr,
      fridgeTempStr,
      macTempStr
    );
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
    setToDB(
      tableName,
      Date.now(),
      1,
      batterVolStr,
      bowlCntStr,
      fridgeTempStr,
      macTempStr
    );
    // exec("node /home/pi/recipe/original.js", function (err, stdout, stderr) {
    exec("python /home/pi/recipe/dummy.py", function (err, stdout, stderr) {
      // exec("python ../../recipe/py/test2.py", function (err, stdout, stderr) {
      if (err !== null) {
        res.status(500).send(stderr);
        logger.error(stderr);
      } else {
        res.status(200).send(stdout);
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
    //const root = "C:/Users/guess/Downloads/demoMP4/";
    const root = "/home/pi/ad";
    let ret = fs.readdirSync(root).map(function (file, index, array) {
      return { src: root + "/" + file, type: "video/mp4" };
    });
    res.send(ret);
  }
);

const getTurnover = (tableName) => {
  return new Promise((resolve, reject) => {
    const statement = util.format("SELECT COUNT(*) FROM %s", tableName);
    db.get(statement, [], (err, row) => {
      if (err) {
        return reject(err.message);
      } else {
        return resolve((row["COUNT(*)"] * unitPrice).toString());
      }
    });
  });
};

app.get(
  "/turnover/today",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    getTurnover(tableName)
      .then((msg) => {
        res.status(200).send("NTD" + msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/db",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    res.download(dbPath);
  }
);

const machineDisable = () => {
  mqttClient.publish("oven/cmd/temperature", "9");
  postWebAPI("/machine/info", "is disable");
  canPost = false;
};

const machineEnable = () => {
  mqttClient.publish("oven/cmd/temperature", "180");
  canPost = true;
  postWebAPI("/machine/info", "is enable");
};

app.post(
  "/machine/disable",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    machineDisable();
    res.sendStatus(200);
  }
);

app.post(
  "/machine/enable",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    machineEnable();
    res.sendStatus(200);
  }
);

app.post(
  "/machine/echo",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    res.send(req.body);
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
    setTimeout(() => {
      res.sendStatus(200);
    }, coinEnableDelayToResponse);
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

app.post(
  "/kanban/enable",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    mqttClient.publish("kanban/cmd/enable", "true");
    res.sendStatus(200);
  }
);

app.post(
  "/kanban/disable",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    mqttClient.publish("kanban/cmd/enable", "false");
    res.sendStatus(200);
  }
);

// http.createServer(app).listen(process.env.MACHINE_BACKEND_PORT, () => {
//   logger.info(
//     version + " listening on port " + process.env.MACHINE_BACKEND_PORT
//   );
// });

// for test purpose so listening on all interface
// for production should change to http <--> localhost, https <--> tun0

// https
//   .createServer(httpsOptions, app)
//   .listen(process.env.MACHINE_BACKEND_PORT, () => {
//     logger.info(
//       version + " listening on port " + process.env.MACHINE_BACKEND_PORT
//     );
//   });

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

https
  .createServer(httpsOptions, app)
  .listen(process.env.MACHINE_BACKEND_PORT, localIP, () => {
    logger.info(
      localIP +
        " " +
        version +
        " listening on port " +
        process.env.MACHINE_BACKEND_PORT
    );
  });

const postAlarm = (payload) => {
  machineDisable();
  postWebAPI("/machine/alarm", payload);
};

const postWarning = (payload) => {
  postWebAPI("/machine/warning", payload);
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
    const macTemp = parseFloat(message.toString());
    macTempStr = macTemp.toString();
    if (macTemp >= maxMachTemp) {
      postAlarm("machine temperature too high");
    }
  } else if (topic === "bucket/status/alarm") {
    postAlarm(message.toString());
  } else if (topic === "latch/status/bowl/cnt") {
    const bowlCnt = parseInt(message.toString());
    bowlCntStr = bowlCnt.toString();
    if (bowlCnt <= bowlCntAlarmLevel) {
      postAlarm("out of bowl");
    } else if (bowlCnt <= bowlCntWarningLevel) {
      postWarning("bowl cnt too low");
    }
  } else if (topic === "bucket/status/resiVol") {
    const batterVol = parseFloat(message.toString());
    batterVolStr = batterVol.toString();
    if (batterVol >= batterVolAlarmLevel) {
      postAlarm("out of batter");
    } else if (batterVol >= batterVolWarningLevel) {
      postWarning("batter vol too low");
    }
  } else if (topic === "bucket/status/refrigTemp") {
    const fridgeTemp = parseFloat(message.toString());
    fridgeTempStr = fridgeTemp.toString();
    if (fridgeTemp >= maxFridgeTemp) {
      postWarning("firdge temperature to high");
    }
  } else if (topic === "bucket/cmd/refrigTemp") {
    maxFridgeTemp = parseFloat(message.toString());
  } else if (topic === "gate/cmd/open") {
    let gateCmd = message.toString() === "true" ? true : false;
    let checkGateCmdDelayObj;
    if (gateCmd === true) {
      if (checkGateCmdDelayObj) {
        clearTimeout(checkGateCmdDelayObj);
      }
      checkGateCmdDelayObj = setTimeout(() => {
        if (gateCmd === true) {
          postAlarm("gate open too long");
        }
      }, checkGateCmdDelay);
    } else {
      clearTimeout(checkGateCmdDelayObj);
    }
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
    postAlarm("bucket is dead");
  }

  if (ovenAliveMsg === lastOvenAliveMsg) {
    ovenDeadCnt = ovenDeadCnt + 1;
  } else {
    ovenDeadCnt = 0;
  }
  lastOvenAliveMsg = ovenAliveMsg;
  if (ovenDeadCnt > maxModuleDeadCnt) {
    postAlarm("oven is dead");
  }

  if (robotAliveMsg === lastRobotAliveMsg) {
    robotDeadCnt = robotDeadCnt + 1;
  } else {
    robotDeadCnt = 0;
  }
  lastRobotAliveMsg = robotAliveMsg;
  if (robotDeadCnt > maxModuleDeadCnt) {
    postAlarm("robot is dead");
  }

  if (latchAliveMsg === lastLatchAliveMsg) {
    latchDeadCnt = latchDeadCnt + 1;
  } else {
    latchDeadCnt = 0;
  }
  lastLatchAliveMsg = latchAliveMsg;
  if (latchDeadCnt > maxModuleDeadCnt) {
    postAlarm("latch is dead");
  }
};
setInterval(checkModuleAlive, checkModuleAliveInterval);

const mqttSubsTopis = [
  "bucket/status/#",
  "oven/status/#",
  "robot/status/#",
  "latch/status/#",
  "bucket/cmd/refrigTemp",
  "gate/cmd/open",
];

mqttClient.on("connect", function () {
  logger.info(version + " connect to broker OK");
  mqttSubsTopis.forEach(function (topic, index, array) {
    mqttClient.subscribe(topic);
  });
});
