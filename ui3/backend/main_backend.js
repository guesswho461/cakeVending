require("dotenv").config({ path: "../frontend/.env" });

const VERSION = "main_backend v2.0"; //May 13, 2021
const port = process.env.MAIN_BACKEND_PORT;

const qs = require("qs");
const log4js = require("log4js");
const logger = log4js.getLogger(VERSION);
const express = require("express");
const app = express();
const http = require("http");
const https = require("https");
const cors = require("cors");
const fs = require("fs");
const exec = require("child_process").exec;
const jwt = require("express-jwt");
const sqlite3 = require("sqlite3").verbose();
const os = require("os");
const axios = require("axios");
const util = require("util");
const { stringify } = require("comment-json");

var io = require("socket.io-client")(http);
var socket = io.connect("http://localhost:8085");

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
  //connect2Cloud: process.env.CONNECT_2_CLOUD === "true" ? true : false,
  connect2Cloud: true,
};

let scriptFile = "dummy.py";

//const recipePath = "/home/pi/recipe";
const recipePath = "C:\\Users\\BNHuse\\Desktop\\3\\nano";
//const recipeCmd = "sudo python %s/%s --cnt %d %s";
const recipeCmd = "python %s/%s --cnt %d %s";

let posMachineFile = "AS350.jar";
//const posMachinePath = "/home/pi/ui3/AS350";
const posMachinePath = "C:\\Users\\BNHuse\\Desktop\\3\\nano\\AS350";
//const posMachineCmd = "sudo java -jar %s -com %s -id %d -pay %d -type %d";
const posMachineCmd = "java -jar %s/%s -com %s -id %d -pay %d -type %d";

let ovenIsReady = true;
let isMakingACake = false;

let isTpModeCorrect = true;
//min to ms
const batterPumpBackRoutineInterval =
  process.env.BATTER_PUMP_BACK_ROUTINE_INTERVAL * 60 * 1000;

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

app.post("/machine/info", (req, res) => {
  logger.debug("machine_info" + req.body);
  res.sendStatus(200);
});

app.post("/machine/alarm", (req, res) => {
  logger.debug("machine_alarm" + req.body);
  res.sendStatus(200);
});

//gm65
app.post("/gm65/code", (req, res) => {
  getWebAPI(process.env.GM65_BACKEND_PORT, "/code")
    .then((msg) => {
      console.log(msg);
      res.status(200).send(msg);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/gm65/open", (req, res) => {
  getWebAPI(process.env.GM65_BACKEND_PORT, "/open")
    .then((msg) => {
      console.log(msg);
      res.status(200).send(msg);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/gm65/close", (req, res) => {
  postWebAPI(process.env.GM65_BACKEND_PORT, "/scanDisable").then(() => {
    postWebAPI(process.env.GM65_BACKEND_PORT, "/close");
  });
  res.sendStatus(200);
});

/////DB
app.post(
  "/recipe/file",

  (req, res) => {
    if (isMakingACake === false) {
      if (
        Object.keys(req.body).length === 0 ||
        isRecipeIsPy(req.body) === false
      ) {
        let resp = "illegal recipe file name";
        logger.warn(resp);
        res.status(400).send(resp);
      } else {
        isRecipeExist(req.body).then((isExist) => {
          if (isExist === true) {
            scriptFile = req.body;
            res.sendStatus(200);
          } else {
            let resp = "unable to find this recipe";
            logger.warn(resp);
            res.status(400).send(resp);
          }
        });
      }
    } else {
      let resp = "a cake is making, skip this request";
      logger.warn(resp);
      res.status(409).send(resp);
    }
  }
);

app.post(
  "/recipe/start/original",

  (req, res) => {
    file = req.body;
    cnt = req.body.cnt;
    price = req.body.price;
    file = scriptFile;
    cnt = 3;
    price = 30;

    if (isMakingACake === false) {
      if (isTpModeCorrect === true) {
        if (
          //Object.keys(req.body).length === 0 ||
          //Object.keys(req.body).includes("cnt") === false ||
          //Object.keys(req.body).includes("price") === false ||
          isNaN(parseInt(cnt)) ||
          parseInt(cnt) <= 0
        ) {
          let resp = "illegal recipe cnt";
          logger.warn(resp);
          res.status(400).send(resp);
        } else {
          isMakingACake = true;
          getWebAPI(process.env.DB_BACKEND_PORT, "/recipe/argu").then(
            (value) => {
              console.log(value);

              if (price > 0) {
                const payload = qs.stringify({
                  price: price,
                  discount: 10,
                  tenCnt: 2,
                  fiveCnt: 2,
                  batchNo: "000007",
                  receiptNo: "000007",
                  tradeNo: "21060906140362892",
                  transAmount: "100",
                  transDate: "210618",
                  transTime: "181403",
                  info_1: "1585624672",
                  info_2: "0",
                  payType: "VISA",
                });
                postWebAPI(process.env.DB_BACKEND_PORT, "/sells", payload);
              } /*else {
                postWebAPI(
                  process.env.FRONT_BACKEND_PORT,
                  "frontend/baking",
                  "true"
                );
              }*/
              logger.debug("machine_info bake start: " + cnt);
              let cmd = util.format(
                recipeCmd,
                recipePath,
                scriptFile,
                cnt,
                value
              );
              exec(cmd, function (err, stdout, stderr) {
                if (err !== null) {
                  logger.error(stderr);
                  res.status(500).send(stderr);
                  postWebAPI(
                    process.env.IO_BACKEND_PORT,
                    "/machine/disable"
                  ).then((msg) => {
                    logger.debug("machine_info bake NG: " + stderr);
                  });
                } else {
                  logger.trace(stderr);
                  logger.debug("machine_info bake OK: " + cnt);
                  res.status(200).send(stderr);
                }
                isMakingACake = false;
              });
            }
          );
        }
      } else {
        let resp = "cannot bake the cake, the mode is wrong";
        logger.error(resp);
        logger.debug("machine_info " + resp);
        res.status(403).send(resp);
      }
    } else {
      let resp = "a cake is making, skip this request";
      logger.warn(resp);
      res.status(409).send(resp);
    }
  }
);

app.post(
  "/thisOrder/payType",

  (req, res) => {
    let com = "COM10";
    let price = req.body.price;
    let payType = req.body.payType;

    let cmd = util.format(
      posMachineCmd,
      posMachinePath,
      posMachineFile,
      com,
      1234567,
      price,
      payType
    );
    console.log(cmd);
    exec(cmd, function (err, stdout, stderr) {
      if (err !== null) {
        logger.error(stderr);
        logger.debug("POS Machine NG: " + stderr);
        res.status(500).send(stderr);
      } else {
        logger.trace(stdout);
        logger.debug("POS Machine OK: " + payType);

        if (stdout._statusCode != 0) res.status(405).send(stdout);
        else res.status(200).send(stdout);
      }
    });
  }
);

app.get("/db", (req, res) => {
  getWebAPI(process.env.DB_BACKEND_PORT, "/db");
  res.sendStatus(200);
});

app.post("/db/sells", (req, res) => {
  const payload = qs.stringify({
    price: 30,
    discount: 10,
    tenCnt: 2,
    fiveCnt: 2,
    batchNo: "000007",
    receiptNo: "000007",
    tradeNo: "21060906140362892",
    transAmount: "100",
    transDate: "210618",
    transTime: "181403",
    info_1: "1585624672",
    info_2: "0",
    payType: "VISA",
  });
  postWebAPI(process.env.DB_BACKEND_PORT, "/sells", payload);
  res.sendStatus(200);
});

app.post("/db/thisOrder/firstTimeBuy", (req, res) => {
  const payload = qs.stringify({
    chk: "yes",
  });
  postWebAPI(process.env.DB_BACKEND_PORT, "/thisOrder/firstTimeBuy", payload);
  res.sendStatus(200);
});

app.post("/db/thisOrder/star", (req, res) => {
  const payload = qs.stringify({
    star: "1",
  });
  postWebAPI(process.env.DB_BACKEND_PORT, "/thisOrder/star", payload);
  res.sendStatus(200);
});

app.post("/db/thisOrder/age", (req, res) => {
  const payload = qs.stringify({
    sex: "F",
    age: 26,
  });
  postWebAPI(process.env.DB_BACKEND_PORT, "/thisOrder/age", payload);
  res.sendStatus(200);
});

app.post("/db/recipe/argu", (req, res) => {
  const payload = qs.stringify({
    vol: 28,
  });
  postWebAPI(process.env.DB_BACKEND_PORT, "/recipe/argu", payload);
  res.sendStatus(200);
});

app.get("/db/recipe/argu", (req, res) => {
  getWebAPI(process.env.DB_BACKEND_PORT, "/recipe/argu")
    .then((msg) => {
      res.status(200).send(msg);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get(
  "/db/sells/detail",

  (req, res) => {
    const payload = {
      mode: "month", //select  month
      date: "2021-06-28",
    };
    getWebAPI(process.env.DB_BACKEND_PORT, "/sells/detail", payload)
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get("/db/sells/turnover", (req, res) => {
  const payload = {
    isToday: "today",
  };
  getWebAPI(process.env.DB_BACKEND_PORT, "/turnover", payload)
    .then((msg) => {
      res.status(200).send(msg);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/db/sells/vol", (req, res) => {
  const payload = {
    isToday: "today",
  };
  getWebAPI(process.env.DB_BACKEND_PORT, "/sells/vol", payload)
    .then((msg) => {
      res.status(200).send(msg);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

/////Motion
app.post("/jog/x", (req, res) => {
  const payload = qs.stringify({
    pos: req.body.pos,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/x", payload);
  res.sendStatus(200);
});

app.post("/jog/x/vel", (req, res) => {
  const payload = qs.stringify({
    slowVel: req.body.vel,
    workingVel: 4000,
    accelTime: 10,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/x/vel", payload);
  res.sendStatus(200);
});

app.post("/jog/y", (req, res) => {
  const payload = qs.stringify({
    pos: req.body.pos,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/y", payload);
  res.sendStatus(200);
});

app.post("/jog/y/vel", (req, res) => {
  const payload = qs.stringify({
    slowVel: req.body.vel,
    workingVel: 4000,
    accelTime: 10,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/y/vel", payload);
  res.sendStatus(200);
});

app.post("/jog/z", (req, res) => {
  const payload = qs.stringify({
    pos: req.body.pos,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/z", payload);
  res.sendStatus(200);
});

app.post("/jog/z/vel", (req, res) => {
  const payload = qs.stringify({
    slowVel: req.body.vel,
    workingVel: 4000,
    accelTime: 10,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/z/vel", payload);
  res.sendStatus(200);
});

app.post("/jog/xyz", (req, res) => {
  const payload = qs.stringify({
    pos1: req.body.pos1,
    pos2: req.body.pos2,
    pos3: req.body.pos3,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/xyz", payload);
  res.sendStatus(200);
});

app.get(
  "/jog/robot/isStop",

  (req, res) => {
    getWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/robot/isStop")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/jog/arm", (req, res) => {
  const payload = qs.stringify({
    pos: req.body.pos,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/arm", payload);
  res.sendStatus(200);
});

app.post("/jog/arm/vel", (req, res) => {
  const payload = qs.stringify({
    slowVel: req.body.vel,
    workingVel: 4000,
    accelTime: 10,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/arm/vel", payload);
  res.sendStatus(200);
});

app.get(
  "/jog/arm/isStop",

  (req, res) => {
    getWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/arm/isStop")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/jog/cv", (req, res) => {
  const payload = qs.stringify({
    pos: req.body.pos,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/cv", payload);
  res.sendStatus(200);
});

app.post("/jog/cv/vel", (req, res) => {
  const payload = qs.stringify({
    slowVel: req.body.vel,
    workingVel: 4000,
    accelTime: 10,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/cv/vel", payload);
  res.sendStatus(200);
});

app.get(
  "/jog/cv/isStop",

  (req, res) => {
    getWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/cv/isStop")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/jog/coll", (req, res) => {
  const payload = qs.stringify({
    pos: req.body.pos,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/coll", payload);
  res.sendStatus(200);
});

app.post("/jog/coll/vel", (req, res) => {
  const payload = qs.stringify({
    slowVel: req.body.vel,
    workingVel: 4000,
    accelTime: 10,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/coll/vel", payload);
  res.sendStatus(200);
});

app.get(
  "/jog/coll/isStop",

  (req, res) => {
    getWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/coll/isStop")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/jog/vol", (req, res) => {
  const payload = qs.stringify({
    vol: req.body.vol,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/vol", payload);
  res.sendStatus(200);
});

app.post("/jog/vol/vel", (req, res) => {
  const payload = qs.stringify({
    slowVel: req.body.vel,
    workingVel: 4000,
    accelTime: 10,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/vol/vel", payload);
  res.sendStatus(200);
});

app.get(
  "/jog/vol/isStop",

  (req, res) => {
    getWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/vol/isStop")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/door/open", (req, res) => {
  io.emit("msg", { status: "doorOpen" });
  //postWebAPI(process.env.MOTION_BACKEND_PORT, "/door/open");
  res.sendStatus(200);
});

app.post("/door/close", (req, res) => {
  io.emit("msg", { status: "doorClose" });
  //postWebAPI(process.env.MOTION_BACKEND_PORT, "/door/close");
  res.sendStatus(200);
});

app.post("/door/open/vel", (req, res) => {
  const payload = qs.stringify({
    slowVel: req.body.vel,
    workingVel: 4000,
    accelTime: 10,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/door/open/vel", payload);
  res.sendStatus(200);
});

app.get(
  "/door/open/isStop",

  (req, res) => {
    getWebAPI(process.env.MOTION_BACKEND_PORT, "/door/open/isStop")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/oven/open", (req, res) => {
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/open");
  res.sendStatus(200);
});

app.post("/oven/close", (req, res) => {
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/close");
  res.sendStatus(200);
});

app.post("/oven/open/vel", (req, res) => {
  const payload = qs.stringify({
    slowVel: req.body.vel,
    workingVel: 4000,
    accelTime: 10,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/open/vel", payload);
  res.sendStatus(200);
});

app.get(
  "/oven/open/isStop",

  (req, res) => {
    getWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/open/isStop")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/oven/flipTurn", (req, res) => {
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/flipTurn");
  res.sendStatus(200);
});

app.post("/oven/flipBack", (req, res) => {
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/flipBack");
  res.sendStatus(200);
});

app.post("/oven/flipStandBy", (req, res) => {
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/flipStandBy");
  res.sendStatus(200);
});

app.get(
  "/oven/isStandBy",

  (req, res) => {
    getWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/isStandBy")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/oven/flip/vel", (req, res) => {
  const payload = qs.stringify({
    slowVel: req.body.vel,
    workingVel: 4000,
    accelTime: 10,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/flip/vel", payload);
  res.sendStatus(200);
});

app.get(
  "/oven/flip/isStop",

  (req, res) => {
    getWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/flip/isStop")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/oven/finishTurn", (req, res) => {
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/finishTurn");
  res.sendStatus(200);
});

app.post("/oven/finishBack", (req, res) => {
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/finishBack");
  res.sendStatus(200);
});

app.get(
  "/oven/isFinish",

  (req, res) => {
    getWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/isFinish")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/jog/home", (req, res) => {
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/home");
  res.sendStatus(200);
});

app.post("/jog/home/vel", (req, res) => {
  const payload = qs.stringify({
    spd: 50,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/home/vel", payload);
  res.sendStatus(200);
});

app.post("/jog/stop", (req, res) => {
  const payload = qs.stringify({
    axis: 0,
  });
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/stop", payload);
  res.sendStatus(200);
});

app.post("/jog/stopAll", (req, res) => {
  postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/stopAll");
  res.sendStatus(200);
});

/////IO
app.post("/bowl/suck", (req, res) => {
  postWebAPI(process.env.IO_BACKEND_PORT, "/bowl/suck");
  res.sendStatus(200);
});

app.post("/bowl/release", (req, res) => {
  postWebAPI(process.env.IO_BACKEND_PORT, "/bowl/release");
  res.sendStatus(200);
});

app.post("/bowl/LED/open", (req, res) => {
  postWebAPI(process.env.IO_BACKEND_PORT, "/bowl/LED/open");
  res.sendStatus(200);
});

app.post("/bowl/LED/close", (req, res) => {
  postWebAPI(process.env.IO_BACKEND_PORT, "/bowl/LED/close");
  res.sendStatus(200);
});

app.get(
  "/bowl/ready",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/bowl/ready")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/bowl/cnt",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/bowl/cnt")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/gate/open", (req, res) => {
  postWebAPI(process.env.IO_BACKEND_PORT, "/gate/open");
  res.sendStatus(200);
});

app.post("/gate/close", (req, res) => {
  postWebAPI(process.env.IO_BACKEND_PORT, "/gate/close");
  res.sendStatus(200);
});

app.get(
  "/gate/isOpen",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/gate/isOpen")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/robot/brake/off", (req, res) => {
  postWebAPI(process.env.IO_BACKEND_PORT, "/robot/brake");
  res.sendStatus(200);
});

app.get(
  "/oven/heat",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/oven/heat")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/refrig/cold",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/refrig/cold")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/coin/enable", (req, res) => {
  postWebAPI(process.env.IO_BACKEND_PORT, "/coin1/enable").then(() => {
    postWebAPI(process.env.IO_BACKEND_PORT, "/coin2/enable");
  });
  res.sendStatus(200);
});

app.post("/coin/disable", (req, res) => {
  postWebAPI(process.env.IO_BACKEND_PORT, "/coin1/disable").then(() => {
    postWebAPI(process.env.IO_BACKEND_PORT, "/coin2/disable");
  });
  res.sendStatus(200);
});

app.get(
  "/coin1/cnt",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/coin1/cnt")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/coin2/cnt",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/coin2/cnt")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/door/LED/open", (req, res) => {
  postWebAPI(process.env.IO_BACKEND_PORT, "/door/LED/open");
  res.sendStatus(200);
});

app.post("/door/LED/close", (req, res) => {
  postWebAPI(process.env.IO_BACKEND_PORT, "/door/LED/close");
  res.sendStatus(200);
});

app.get(
  "/batter/vol",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/batter/vol")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/refrig/temp",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/refrig/temp")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/oven/temp",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/oven/temp")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/mach/temp",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/mach/temp")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/tp/mode",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/tp/mode")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/tp/jog/dir",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/tp/jog/dir")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/tp/jog/target",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/tp/jog/target")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/tp/jog/spd",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/tp/jog/spd")
      .then((msg) => {
        console.log(msg);
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post("/flow1/reset", (req, res) => {
  postWebAPI(process.env.IO_BACKEND_PORT, "/flow1/reset");
  res.sendStatus(200);
});

app.get(
  "/flow1/cnt",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/flow1/cnt")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/tp/clean1",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/tp/clean1")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/tp/clean2",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/tp/clean2")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/tp/clean3",

  (req, res) => {
    getWebAPI(process.env.IO_BACKEND_PORT, "/tp/clean3")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

const isRecipeIsPy = (fileName) => {
  const fileNames = fileName.split(".");
  if (fileNames[fileNames.length - 1] === "py") {
    return true;
  } else {
    return false;
  }
};

const isRecipeExist = (fileName) => {
  return new Promise((resolve, reject) => {
    fs.readdir(recipePath, (err, files) => {
      if (err) {
        return reject(err.message);
      } else {
        let isExist = false;
        for (i = 0; i < files.length; ++i) {
          if (files[i] === fileName) {
            isExist = true;
            break;
          }
        }
        return resolve(isExist);
      }
    });
  });
};

const postWebAPI = (port, url, payload = "") => {
  return new Promise((resolve, reject) => {
    if (machineInfo.connect2Cloud) {
      axios({
        method: "post",
        baseURL: "http://localhost:" + port + url,
        data: payload,
      })
        .then((res) => {
          let msg = "POST " + url + " " + payload + " " + res.status;
          //console.log(payload);
          logger.debug(msg);
          return resolve(msg);
        })
        .catch((err) => {
          logger.error(err.message);
          return reject(err.message);
        });
    }
    logger.debug("POST " + url + " " + payload);
  });
};

const getWebAPI = (port, url, payload = "") => {
  return new Promise((resolve, reject) => {
    if (machineInfo.connect2Cloud) {
      axios({
        method: "get",
        baseURL: "http://localhost:" + port + url,
        params: payload, //{ mode: "select", date: "2021-06-24" },
      })
        .then((res) => {
          console.log(payload);
          logger.debug(port + url);
          return resolve(res.data);
        })
        .catch((err) => {
          logger.error(err.message);
          return reject(err.message);
        });
    }
    logger.debug("GET " + url);
  });
};

let lastMode = "";
let lastDir = "";
let lastTarget = "";
let lastspd = "";
let running = false;
let manualStep = 0;
const tpMode = () => {
  getWebAPI(process.env.IO_BACKEND_PORT, "/tp/mode").then((mode) => {
    switch (manualStep) {
      case 0:
        if (mode != lastMode) manualStep = 2;
        else if (mode == "Manual") {
          getWebAPI(process.env.IO_BACKEND_PORT, "/tp/jog/spd").then((spd) => {
            console.log(spd);
            if (spd == 0) manualStep = 1;
            else {
              getWebAPI(process.env.IO_BACKEND_PORT, "/tp/jog/dir").then(
                (dir) => {
                  getWebAPI(process.env.IO_BACKEND_PORT, "/tp/jog/target").then(
                    (target) => {
                      if (dir != lastDir && running == true) manualStep = 1;
                      else if (target != lastTarget && running == true)
                        manualStep = 1;
                      else {
                        console.log(dir);
                        const payload = qs.stringify({
                          dir: dir,
                          percent: spd,
                        });

                        if (running == false) {
                          postWebAPI(
                            process.env.MOTION_BACKEND_PORT,
                            "/cont/" + target,
                            payload
                          ).then(() => {
                            running = true;
                          });
                        } else {
                          if (spd != lastspd) {
                            postWebAPI(
                              process.env.MOTION_BACKEND_PORT,
                              "/jog/" + target + "/vel",
                              payload
                            );
                          }
                          lastspd = spd;
                        }
                        lastTarget = target;
                        lastDir = dir;
                      }
                    }
                  );
                }
              );
            }
          });
        }

        /*  getWebAPI(process.env.IO_BACKEND_PORT, "/tp/isClean1").then((value) => {
        if (value == true) {
          getWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/isOpen").then(
            (isOpen) => {
              if (isOpen == false) {
                postWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/open").then(
                  () => {
                    postWebAPI(
                      process.env.IO_BACKEND_PORT,
                      "/tp/isClean1/reset"
                    );
                  }
                );
              } else {
                postWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/close").then(
                  () => {
                    postWebAPI(
                      process.env.IO_BACKEND_PORT,
                      "/tp/isClean1/reset"
                    );
                  }
                );
              }
            }
          );
        }
      });*/

        /* getWebAPI(process.env.IO_BACKEND_PORT, "/tp/isClean2").then((value) => {
        if (value == true) {
          getWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/isFlip").then(
            (isFlip) => {
              if (isFlip == false) {
                postWebAPI(
                  process.env.MOTION_BACKEND_PORT,
                  "/oven/flipTurn"
                ).then(() => {
                  postWebAPI(process.env.IO_BACKEND_PORT, "/tp/isClean2/reset");
                });
              } else {
                postWebAPI(
                  process.env.MOTION_BACKEND_PORT,
                  "/oven/flipBack"
                ).then(() => {
                  postWebAPI(process.env.IO_BACKEND_PORT, "/tp/isClean2/reset");
                });
              }
            }
          );
        }
      });

      getWebAPI(process.env.IO_BACKEND_PORT, "/tp/isClean3").then((value) => {
        if (value == true) {
          getWebAPI(process.env.MOTION_BACKEND_PORT, "/oven/isFinish").then(
            (isFinish) => {
              if (isFinish == false) {
                postWebAPI(
                  process.env.MOTION_BACKEND_PORT,
                  "/oven/finishTurn"
                ).then(() => {
                  postWebAPI(process.env.IO_BACKEND_PORT, "/tp/isClean3/reset");
                });
              } else {
                postWebAPI(
                  process.env.MOTION_BACKEND_PORT,
                  "/oven/finishBack"
                ).then(() => {
                  postWebAPI(process.env.IO_BACKEND_PORT, "/tp/isClean3/reset");
                });
              }
            }
          );
        }
      });*/

        break;
      case 1:
        axis = 0;
        if (lastTarget == "x") axis = 0;
        else if (lastTarget == "y") axis = 1;
        else if (lastTarget == "z") axis = 2;
        else axis = 3;
        const payload = qs.stringify({
          axis: axis,
        });
        postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/stop", payload).then(
          () => {
            manualStep = 11;
          }
        );
        break;
      case 11:
        axis = 0;
        if (lastTarget != "vol") {
          getWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/robot/isStop").then(
            (status) => {
              if (status) {
                manualStep = 0;
                running = false;
                lastspd = 0;
              } else manualStep = 1;
            }
          );
        } else {
          getWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/vol/isStop").then(
            (status) => {
              if (status) {
                manualStep = 0;
                running = false;
                lastspd = 0;
              } else manualStep = 1;
            }
          );
        }

        break;
      case 2:
        postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/stopAll").then(() => {
          manualStep = 21;
        });
        break;
      case 21:
        getWebAPI(process.env.MOTION_BACKEND_PORT, "/status").then((status) => {
          if (status == 0) {
            manualStep = 0;
            running = false;
            lastspd = 0;
          } else manualStep = 2;
        });
        break;
    }
    lastMode = mode;
  });
};

const batterPumpBackRoutine = () => {
  const payload = qs.stringify({
    vol: process.env.BATTER_PUMP_BACK_VOL,
  });
  if (isMakingACake === false) {
    postWebAPI(process.env.MOTION_BACKEND_PORT, "/jog/vol", payload);
    logger.info("batter pump back");
  } else {
    logger.info("cake is making, batter did not pump back");
  }
};

function init() {
  logger.info(machineInfo.ver + " connect to broker OK");
  setInterval(batterPumpBackRoutine, batterPumpBackRoutineInterval);
  setInterval(tpMode, 500);
}

init();
