require("dotenv").config({ path: "../frontend/.env" });

const version = "cakeVendingBackend v1.59";

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
    default: { appenders: ["file", "out"], level: "debug" },
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

//min to ms
const checkModuleAliveInterval =
  process.env.CHECK_MODULE_ALIVE_INTERVAL * 60 * 1000;

const maxModuleDeadCnt = process.env.MAX_MODULE_DEAD_CNT;

//Celsius
const maxMachTemp = process.env.MAX_NACH_TEMP;

//distance, greater means lower
const bowlCntWarningLevel = process.env.BOWL_CNT_WARNING_LEVEL;

//distance, greater means lower
const bowlCntAlarmLevel = process.env.BOWL_CNT_ALARM_LEVEL;

//distance, greater means lower
const batterVolWarningLevel = process.env.BATTER_VOL_WARNING_LEVEL;

//distance, greater means lower
const batterVolAlarmLevel = process.env.BATTER_ALARM_WARNING_LEVEL;

//Celsius
let maxFridgeTemp = process.env.MAX_FRIDGE_TEMP;

//min to ms
const checkGateCmdDelay = process.env.CHECK_GATE_CMD_DELAY * 60 * 1000;

//NTD
const unitPrice = process.env.UNIT_PRICE;

//set to ms
const coinEnableDelayToResponse =
  process.env.COIN_ENABLE_DELAY_TO_RESPONSE * 1000;

//min to ms
const batterPumpBackRoutineInterval =
  process.env.BATTER_PUMP_BACK_ROUTINE_INTERVAL * 60 * 1000;

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
let checkGateCmdDelayObj;

let lastRobotOpMode = "MQTT";
let lastBucketOpMode = "MQTT";
let lastOvenOpMode = "MQTT";

let ovenIsReady = true;
let isMakingACake = false;

let lastMacTemp = 0;
let lastBowlCnt = 0;
let lastBatterVol = 0;
let lastFridgeTemp = 0;

let scriptFile = "dummy.py";

const machineInfo = {
  name: process.env.LOCALNAME,
  ver: version,
  isDevMode: process.env.DEV_MODE === "true" ? true : false,
  connect2Bot: process.env.CONNECT_2_BOT === "true" ? true : false,
  ip:
    process.env.CONNECT_2_BOT === "true"
      ? os.networkInterfaces().tun0[0].address
      : null,
};

const mqttOpt = {
  port: process.env.MACHINE_LOCAL_MQTT_BROKER_PORT,
  clientId: machineInfo.ver,
};

const postWebAPI = (url, payload) => {
  return new Promise((resolve, reject) => {
    if (canPost) {
      if (machineInfo.connect2Bot) {
        axios({
          method: "post",
          baseURL:
            process.env.TELEGRAM_BOT_IP + ":" + process.env.SERVER_PORT + url,
          headers: {
            Authorization: "Bearer " + process.env.REACT_APP_CAKE_ACCESS_TOKEN,
            "content-type": "text/plain",
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
          data: payload,
        })
          .then((res) => {
            let msg = "POST " + url + " " + payload + " " + res.status;
            logger.debug(msg);
            return resolve(msg);
          })
          .catch((err) => {
            logger.error(err.message);
            return reject(err.message);
          });
      }
      logger.debug("POST " + url + " " + payload);
    }
  });
};

const postWebAPI2 = (url, payload) => {
  return postWebAPI(url, process.env.LOCALNAME + " " + payload);
};

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

const setParToDB = (table, name, value) => {
  const statement = util.format('UPDATE %s SET %s="%s"', table, name, value);
  db.run(statement, function (err) {
    if (err) throw err;
  });
};

const getParFromDB = (table, name) => {
  return new Promise((resolve, reject) => {
    const statement = util.format("SELECT DISTINCT %s FROM %s", name, table);
    db.get(statement, [], (err, value) => {
      if (err) {
        return reject(err.message);
      } else {
        return resolve(value);
      }
    });
  });
};

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
    res.send(machineInfo.ver);
  }
);

app.get(
  "/recipe/argu",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    getParFromDB("PAR", "scriptArgu").then((value) => {
      res.send(value.scriptArgu);
    });
  }
);

app.post(
  "/recipe/argu",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    if (isMakingACake === false) {
      setParToDB("PAR", "scriptArgu", req.body);
      res.sendStatus(200);
    } else {
      let resp = "a cake is making, skip this request";
      logger.warn(resp);
      res.status(409).send(resp);
    }
  }
);

app.post(
  "/recipe/file",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    if (isMakingACake === false) {
      scriptFile = req.body;
      res.sendStatus(200);
    } else {
      let resp = "a cake is making, skip this request";
      logger.warn(resp);
      res.status(409).send(resp);
    }
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
    if (isMakingACake === false) {
      if (isAllOpModesAreCorrect() === true) {
        isMakingACake = true;
        getParFromDB("PAR", "scriptArgu").then((value) => {
          setToDB(
            tableName,
            Date.now(),
            1,
            batterVolStr,
            bowlCntStr,
            fridgeTempStr,
            macTempStr
          );
          postWebAPI2("/machine/info", "bake start");
          let cmd = util.format(
            "sudo python /home/pi/recipe/%s %s",
            // "python C:\\codes\\cakeVending\\recipe\\py\\%s %s",
            scriptFile,
            value.scriptArgu
          );
          exec(cmd, function (err, stdout, stderr) {
            if (err !== null) {
              res.status(500).send(stderr);
              logger.error(stderr);
              postWebAPI2("/machine/info", "bake NG")
                .then((msg) => {
                  machineDisable();
                })
                .catch((err) => {
                  machineDisable();
                });
            } else {
              res.status(200).send(stdout);
              logger.trace(stdout);
              postWebAPI2("/machine/info", "bake OK");
            }
            isMakingACake = false;
          });
        });
      } else {
        let resp = "cannot bake the cake, the modes of the modules are wrong";
        logger.error(resp);
        postWebAPI2("/machine/info", resp);
        res.status(403).send(resp);
      }
    } else {
      let resp = "a cake is making, skip this request";
      logger.warn(resp);
      res.status(409).send(resp);
    }
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
    const root = "/home/pi/ui2/frontend/build/video";
    let ret = fs.readdirSync(root).map(function (file, index, array) {
      return ".\\video\\" + file;
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

logger.info(stringify(machineInfo) + " started");
postWebAPI("/machine/online", stringify(machineInfo));

const mqttClient = mqtt.connect("mqtt://localhost", mqttOpt);

const machineDisable = (stopHeating = true, isSoldout = false) => {
  if (stopHeating === true) {
    mqttClient.publish(
      "oven/cmd/temperature",
      process.env.REACT_APP_OVEN_BAD_TEMPERATURE
    );
  }
  if (isSoldout === true) {
    mqttClient.publish("frontend/soldout", "true");
    postWebAPI2("/machine/info", "is sold out");
    logger.info("machine sold out");
  } else {
    mqttClient.publish("frontend/maintain", "true");
    postWebAPI2("/machine/info", "is disable");
    logger.info("machine disable");
  }
  canPost = false;
};

const machineEnable = () => {
  mqttClient.publish("frontend/soldout", "false");
  mqttClient.publish("frontend/maintain", "false");
  canPost = true;
  postWebAPI2("/machine/info", "is enable");
  logger.info("machine enable");
};

app.post(
  "/machine/soldout",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    machineDisable(true, true);
    res.sendStatus(200);
  }
);

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

const opModeRisingEdge = (name, last, now, second, third) => {
  if (last != now) {
    if (now != "MQTT" || second != "MQTT" || third != "MQTT") {
      postAlarm("the op mode of " + name + " is wrong (" + now + ")", false);
    }
  }
  return now;
};

const isAllOpModesAreCorrect = () => {
  if (
    lastRobotOpMode != "MQTT" ||
    lastBucketOpMode != "MQTT" ||
    lastOvenOpMode != "MQTT"
  ) {
    return false;
  } else {
    return true;
  }
};

app.post(
  "/machine/enable",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    if (isAllOpModesAreCorrect() === true) {
      machineEnable();
      res.sendStatus(200);
    } else {
      res.sendStatus(405);
    }
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

app.get(
  "/devMode",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    res.status(200).send(machineInfo.isDevMode);
  }
);

app.get(
  "/opModesAreCorrect",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    if (isAllOpModesAreCorrect() === false) {
      machineDisable();
      res.status(200).send("false");
    } else {
      res.status(200).send("true");
    }
  }
);

app.get(
  "/oven/status/ready",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    res.status(200).send(ovenIsReady);
  }
);

const postAlarm = (payload, stopHeating = true, isSoldout = false) => {
  logger.error(payload);
  postWebAPI2("/machine/alarm", payload);
  if (machineInfo.isDevMode === false) {
    machineDisable(stopHeating, isSoldout);
  }
};

const postWarning = (payload) => {
  logger.warn(payload);
  postWebAPI2("/machine/warning", payload);
};

const checkOvenIsReady = (tempature) => {
  if (machineInfo.isDevMode === true) {
    return true;
  } else {
    const parsed = parseInt(tempature, 10);
    return parsed >= process.env.REACT_APP_OVEN_GOOD_TEMPERATURE ? true : false;
  }
};

mqttClient.on("message", function (topic, message) {
  logger.trace("topic: " + topic + " " + message);
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
    if (lastMacTemp !== macTemp) {
      macTempStr = macTemp.toString();
      if (macTemp >= maxMachTemp) {
        postAlarm("machine temperature too high (" + macTempStr + ")");
      }
    }
    lastMacTemp = macTemp;
  } else if (topic === "bucket/status/alarm") {
    postAlarm(message.toString());
  } else if (topic === "latch/status/bowl/cnt") {
    const bowlCnt = parseInt(message.toString());
    if (lastBowlCnt !== bowlCnt) {
      bowlCntStr = bowlCnt.toString();
      if (bowlCnt >= bowlCntAlarmLevel) {
        postAlarm("out of bowl (" + bowlCntStr + ")", true, true);
      } else if (bowlCnt >= bowlCntWarningLevel) {
        postWarning("bowl cnt too low (" + bowlCntStr + ")");
      }
    }
    lastBowlCnt = bowlCnt;
  } else if (topic === "bucket/status/resiVol") {
    const batterVol = parseFloat(message.toString());
    if (lastBatterVol !== batterVol) {
      batterVolStr = batterVol.toString();
      if (batterVol >= batterVolAlarmLevel) {
        postAlarm("out of batter (" + batterVolStr + ")", true, true);
      } else if (batterVol >= batterVolWarningLevel) {
        postWarning("batter vol too low (" + batterVolStr + ")");
      }
    }
    lastBatterVol = batterVol;
  } else if (topic === "bucket/status/refrigTemp") {
    const fridgeTemp = parseFloat(message.toString());
    if (lastFridgeTemp !== fridgeTemp) {
      fridgeTempStr = fridgeTemp.toString();
      if (fridgeTemp >= maxFridgeTemp) {
        postWarning("fridge temperature to high (" + fridgeTempStr + ")");
      }
    }
    lastFridgeTemp = fridgeTemp;
  } else if (topic === "bucket/cmd/refrigTemp") {
    maxFridgeTemp = parseFloat(message.toString());
  } else if (topic === "gate/cmd/open") {
    let gateCmd = message.toString() === "true" ? true : false;
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
  } else if (topic === "robot/status/mode") {
    lastRobotOpMode = opModeRisingEdge(
      "robot",
      lastRobotOpMode,
      message.toString(),
      lastBucketOpMode,
      lastOvenOpMode
    );
  } else if (topic === "bucket/status/mode") {
    lastBucketOpMode = opModeRisingEdge(
      "bucket",
      lastBucketOpMode,
      message.toString(),
      lastRobotOpMode,
      lastOvenOpMode
    );
  } else if (topic === "oven/status/mode") {
    lastOvenOpMode = opModeRisingEdge(
      "oven",
      lastOvenOpMode,
      message.toString(),
      lastRobotOpMode,
      lastBucketOpMode
    );
  } else if (topic === "oven/status/temperature") {
    ovenIsReady = checkOvenIsReady(message.toString());
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

const batterPumpBackRoutine = () => {
  if (isMakingACake === false) {
    mqttClient.publish("bucket/cmd/jog/vol", process.env.BATTER_PUMP_BACK_VOL);
    logger.info("batter pump back");
  } else {
    logger.info("cake is making, batter did not pump back");
  }
};

mqttClient.on("connect", function () {
  logger.info(machineInfo.ver + " connect to broker OK");
  mqttSubsTopis.forEach(function (topic, index, array) {
    mqttClient.subscribe(topic);
  });
  setInterval(batterPumpBackRoutine, batterPumpBackRoutineInterval);
});

if (machineInfo.isDevMode) {
  http.createServer(app).listen(process.env.MACHINE_BACKEND_PORT, () => {
    logger.info(
      machineInfo.ver +
        " listening on " +
        ":" +
        process.env.MACHINE_BACKEND_PORT
    );
  });
} else {
  http
    .createServer(app)
    .listen(process.env.MACHINE_BACKEND_PORT, "localhost", () => {
      logger.info(
        machineInfo.ver +
          " listening on " +
          "localhost:" +
          process.env.MACHINE_BACKEND_PORT
      );
    });
  if (machineInfo.connect2Bot) {
    const httpsOptions = {
      key: fs.readFileSync("./ssl_files/server_private_key.pem"),
      ca: [fs.readFileSync("./ssl_files/cert.pem")],
      cert: fs.readFileSync("./ssl_files/server_cert.pem"),
    };
    https
      .createServer(httpsOptions, app)
      .listen(process.env.MACHINE_BACKEND_PORT, machineInfo.ip, () => {
        logger.info(
          stringify(machineInfo) +
            " listening on port " +
            process.env.MACHINE_BACKEND_PORT
        );
      });
  }
}
