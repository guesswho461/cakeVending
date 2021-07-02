require("dotenv").config({ path: "../frontend/.env" });

const argv_opts = {
  string: ["device"],
  default: { device: "/dev/ttyUSB0" },
};
const argv = require("minimist")(process.argv.slice(2), argv_opts);

const VERSION = "motion_modbus v1.0"; //Jun 15, 2021
const port = process.env.MOTION_BACKEND_PORT;

const log4js = require("log4js");
const logger = log4js.getLogger(VERSION);
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const axios = require("axios");

const ModbusRTU = require("modbus-serial");
const { UV_FS_O_FILEMAP } = require("constants");

var axis_client = new ModbusRTU();
axis_client.setTimeout(500);
axis_client.setID(1);

//argv.device;
axis_client.connectRTUBuffered("COM9", {
  baudRate: 115200,
  parity: "none",
  stopBits: 1,
  dataBits: 8,
});

let isHomeOvenFlip = false;
let isHomeOvenOpen = false;
let isOvenOpen = false;
let isOvenFlip = false;
let isFlipStandBy = false;
let isOvenFinish = false;

let isHome = new Array(10);

const AXIS_JOG_X = 0;
const AXIS_JOG_Y = 1;
const AXIS_JOG_Z = 2;
const AXIS_BUCKET = 3;
const AXIS_OVEN_OPEN = 4;
const AXIS_OVEN_FLIP = 5;
const AXIS_LATCH_ARM = 6;
const AXIS_LATCH_CV = 7;
const AXIS_LATCH_COLL = 8;
const AXIS_DOOR_OPEN = 9;

const TO_INI = 0;
const TO_TOP = 1;
const TO_TARGETVOL = 2;
const TO_REMAINDERVOL = 3;
const TO_BACKVOL = 4;
const TO_OK = 9;

const DIR_CW = true;
const DIR_CCW = false;

const volin1Round = 2; //unit:ml roughly estimate
const volin1Factor = 0.75; //unit:ml roughly estimate
const volin1ToTop = 70; //unit:ml
//Step motor para

const pulMotor = 200;
const totalPulIn1Round = 400;
const doorOpenMM = 16;

const RATIO_OVEN_OPEN = 100;
const RATIO_OVEN_FLIP = 50;
const RATIO_LATCH_ARM = 19;
const RATIO_LATCH_COLL = 27;

let totalPul_OVEN_OPEN = pulMotor * RATIO_OVEN_OPEN;
let totalPul_OVEN_FLIP = pulMotor * RATIO_OVEN_FLIP;

let flipPul = totalPul_OVEN_FLIP * 0.5;
let standByPul = totalPul_OVEN_FLIP * 0.027;
let flipFinishPul = totalPul_OVEN_FLIP * 0.25;

let openPul = totalPul_OVEN_OPEN * 0.27;
let openFinishPul = totalPul_OVEN_OPEN * 0.5;

const STEP_PER_MM_XY = 5.58;
const STEP_PER_MM_Z = 20;
const STEP_PER_MM_ARM = 23;
const STEP_PER_MM_CV = 5;
const STEP_PER_MM_DOOR = 25;
const STEP_PER_MM_COLL = (pulMotor * RATIO_LATCH_COLL) / 360;
const STEP_PER_MM_OVEN_OPEN = totalPul_OVEN_OPEN / 360;

//1~12
const PAR_ADDR_SET_HOME = 0x0000;

//1~8
const PAR_ADDR_MOVE_CONT_DO = 0x0001;
const PAR_ADDR_MOVE_REL_DO = 0x0009;
const PAR_ADDR_MOVE_ABS_DO = 0x0011;
const PAR_ADDR_MOVE_STOP = 0x0023;
//9~12
const PAR_ADDR_EXT_MOVE_CONT_DO = 0x0101;
const PAR_ADDR_EXT_MOVE_REL_DO = 0x0109;
const PAR_ADDR_EXT_MOVE_ABS_DO = 0x0111;
const PAR_ADDR_EXT_MOVE_STOP = 0x0123;

//1~12
const PAR_ADDR_ALL_STOP = 0x002c;

//1~8
const PAR_ADDR_SET_SLOW_VEL = 0x0000;
const PAR_ADDR_SET_WORKING_VEL = 0x0010;
const PAR_ADDR_SET_ACCEL_TIME = 0x0020;
const PAR_ADDR_CUR_POS = 0x0060;
const PAR_ADDR_REL_POS = 0x0070;
const PAR_ADDR_ABS_POS = 0x0080;
const PAR_ADDR_STATUS_CODE = 0x0098;
const PAR_ADDR_REL_FAST_POS = 0x00e0;
const PAR_ADDR_ABS_FAST_POS = 0x00f0;

//9~12
const PAR_ADDR_EXT_SET_SLOW_VEL = 0x0100;
const PAR_ADDR_EXT_SET_WORKING_VEL = 0x0110;
const PAR_ADDR_EXT_SET_ACCEL_TIME = 0x0120;
const PAR_ADDR_EXT_CUR_POS = 0x0160;
const PAR_ADDR_EXT_REL_POS = 0x0170;
const PAR_ADDR_EXT_ABS_POS = 0x0180;
const PAR_ADDR_EXT_STATUS_CODE = 0x0198;
const PAR_ADDR_EXT_REL_FAST_POS = 0x01e0;
const PAR_ADDR_EXT_ABS_FAST_POS = 0x01f0;

//1~12
const PAR_ADDR_CNT = 0x0090;
const PAR_ADDR_HOME_VEL = 0x0093;
const PAR_ADDR_ALL_STATUS_CODE = 0x0096;

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

app.post(
  "/test",

  (req, res) => {
    pos = 20000;
    absFastMove(AXIS_JOG_X, pos);
    res.sendStatus(200);
  }
);

app.get(
  "/status",

  (req, res) => {
    readAllStatus()
      .then((value) => {
        res.status(200).send("status " + value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/jog/robot/isStop",

  (req, res) => {
    robotTargetReach()
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post(
  "/jog/x",

  (req, res) => {
    pos = req.body.pos;
    pos = 200000;
    jog(AXIS_JOG_X, pos, STEP_PER_MM_XY);
    res.sendStatus(200);
  }
);

app.post(
  "/cont/x",

  (req, res) => {
    dir = req.body.dir;
    dir = true;
    contDo(AXIS_JOG_X, dir);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/x/vel",

  (req, res) => {
    slowVel = req.body.slowVel;
    workingVel = req.body.workingVel;
    accelTime = req.body.accelTime;

    slowVel = 300;
    workingVel = 4000;
    accelTime = 10;
    setPar(AXIS_JOG_X, slowVel, workingVel, accelTime);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/x/home",

  (req, res) => {
    jog(AXIS_JOG_X, 0, STEP_PER_MM_XY);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/y",

  (req, res) => {
    pos = req.body.pos;
    jog(AXIS_JOG_Y, pos, STEP_PER_MM_XY);
    res.sendStatus(200);
  }
);

app.post(
  "/cont/y",

  (req, res) => {
    dir = req.body.dir;
    contDo(AXIS_JOG_Y, dir);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/y/vel",

  (req, res) => {
    slowVel = req.body.slowVel;
    workingVel = req.body.workingVel;
    accelTime = req.body.accelTime;
    setPar(AXIS_JOG_Y, slowVel, workingVel, accelTime);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/y/home",

  (req, res) => {
    jog(AXIS_JOG_Y, 0, STEP_PER_MM_XY);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/z",

  (req, res) => {
    pos = req.body.pos;
    jog(AXIS_JOG_Z, pos, STEP_PER_MM_Z);
    res.sendStatus(200);
  }
);

app.post(
  "/cont/z",

  (req, res) => {
    dir = req.body.dir;
    contDo(AXIS_JOG_Z, dir);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/z/vel",

  (req, res) => {
    slowVel = req.body.slowVel;
    workingVel = req.body.workingVel;
    accelTime = req.body.accelTime;
    setPar(AXIS_JOG_Z, slowVel, workingVel, accelTime);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/z/home",

  (req, res) => {
    jog(AXIS_JOG_Z, 0, STEP_PER_MM_Z);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/arm",

  (req, res) => {
    pos = req.body.pos;
    jog(AXIS_LATCH_ARM, pos, STEP_PER_MM_ARM);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/arm/vel",

  (req, res) => {
    slowVel = req.body.slowVel;
    workingVel = req.body.workingVel;
    accelTime = req.body.accelTime;
    /*
    slowVel = 100;
    workingVel = 4000;
    accelTime = 10;
    */
    setPar(AXIS_LATCH_ARM, slowVel, workingVel, accelTime);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/arm/home",

  (req, res) => {
    jog(AXIS_LATCH_ARM, 0, STEP_PER_MM_ARM);
    res.sendStatus(200);
  }
);

app.get(
  "/jog/arm/isStop",

  (req, res) => {
    readStatus(AXIS_LATCH_ARM)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post(
  "/jog/cv",

  (req, res) => {
    pos = req.body.pos;
    //pos = 180;
    jog(AXIS_LATCH_CV, pos, STEP_PER_MM_CV);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/cv/vel",

  (req, res) => {
    slowVel = req.body.slowVel;
    workingVel = req.body.workingVel;
    accelTime = req.body.accelTime;

    setPar(AXIS_LATCH_CV, slowVel, workingVel, accelTime);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/cv/home",

  (req, res) => {
    jog(AXIS_LATCH_CV, 0, STEP_PER_MM_CV);
    res.sendStatus(200);
  }
);

app.get(
  "/jog/cv/isStop",

  (req, res) => {
    readStatus(AXIS_LATCH_CV)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post(
  "/jog/coll",

  (req, res) => {
    pos = req.body.pos;
    //pos = 90;
    jog(AXIS_LATCH_COLL, pos, STEP_PER_MM_COLL);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/coll/vel",

  (req, res) => {
    slowVel = req.body.slowVel;
    workingVel = req.body.workingVel;
    accelTime = req.body.accelTime;

    setPar(AXIS_LATCH_COLL, slowVel, workingVel, accelTime);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/coll/home",

  (req, res) => {
    jog(AXIS_LATCH_COLL, 0, STEP_PER_MM_COLL);
    res.sendStatus(200);
  }
);

app.get(
  "/jog/coll/isStop",

  (req, res) => {
    readStatus(AXIS_LATCH_COLL)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post(
  "/oven/absDeg",

  (req, res) => {
    pos = req.body;
    //pos = 10;
    jog(AXIS_OVEN_OPEN, pos, STEP_PER_MM_OVEN_OPEN);
    res.sendStatus(200);
  }
);

app.post(
  "/oven/open",

  (req, res) => {
    oven_Open();
    res.sendStatus(200);
  }
);

app.post(
  "/oven/close",

  (req, res) => {
    oven_Close();
    res.sendStatus(200);
  }
);

app.post(
  "/oven/open/vel",

  (req, res) => {
    slowVel = req.body.slowVel;
    workingVel = req.body.workingVel;
    accelTime = req.body.accelTime;

    setPar(AXIS_OVEN_OPEN, slowVel, workingVel, accelTime);
    res.sendStatus(200);
  }
);

app.post(
  "/oven/open/home",

  (req, res) => {
    jog(AXIS_OVEN_OPEN, 0, STEP_PER_MM_OVEN_OPEN);
    res.sendStatus(200);
  }
);

app.get(
  "/oven/isOpen",

  (req, res) => {
    res.status(200).send(isOvenOpen);
  }
);

app.get(
  "/oven/open/isStop",

  (req, res) => {
    readStatus(AXIS_OVEN_OPEN)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post(
  "/oven/flipTurn",

  (req, res) => {
    oven_FlipTurn();
    res.sendStatus(200);
  }
);

app.post(
  "/oven/flipBack",

  (req, res) => {
    oven_FlipBack();
    res.sendStatus(200);
  }
);

app.post(
  "/oven/flipStandBy",

  (req, res) => {
    oven_FlipStandBy();
    res.sendStatus(200);
  }
);

app.post(
  "/oven/flip/vel",

  (req, res) => {
    slowVel = req.body.slowVel;
    workingVel = req.body.workingVel;
    accelTime = req.body.accelTime;

    setPar(AXIS_OVEN_FLIP, slowVel, workingVel, accelTime);
    res.sendStatus(200);
  }
);

app.post(
  "/oven/flip/home",

  (req, res) => {
    jog(AXIS_OVEN_FLIP, 0, STEP_PER_MM_OVEN_FLIP);
    res.sendStatus(200);
  }
);

app.get(
  "/oven/isFlip",

  (req, res) => {
    res.status(200).send(isOvenFlip);
  }
);

app.get(
  "/oven/isStandBy",

  (req, res) => {
    res.status(200).send(isFlipStandBy);
  }
);

app.get(
  "/oven/flip/isStop",

  (req, res) => {
    readStatus(AXIS_OVEN_FLIP)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post(
  "/oven/finishTurn",

  (req, res) => {
    oven_FinishTurn();
    res.sendStatus(200);
  }
);

app.post(
  "/oven/finishBack",

  (req, res) => {
    oven_FinishBack();
    res.sendStatus(200);
  }
);

app.get(
  "/oven/isFinish",

  (req, res) => {
    res.status(200).send(isOvenFinish);
  }
);

app.post(
  "/door/open",

  (req, res) => {
    jog(AXIS_DOOR_OPEN, doorOpenMM, STEP_PER_MM_DOOR);
    res.sendStatus(200);
  }
);

app.post(
  "/door/close",

  (req, res) => {
    jog(AXIS_DOOR_OPEN, 0, STEP_PER_MM_DOOR);
    res.sendStatus(200);
  }
);

app.post(
  "/door/home",

  (req, res) => {
    jog(AXIS_DOOR_OPEN, 0, STEP_PER_MM_DOOR);
    res.sendStatus(200);
  }
);

app.post(
  "/door/open/vel",

  (req, res) => {
    slowVel = req.body.slowVel;
    workingVel = req.body.workingVel;
    accelTime = req.body.accelTime;

    setPar(AXIS_DOOR_OPEN, slowVel, workingVel, accelTime);
    res.sendStatus(200);
  }
);

app.get(
  "/door/open/isStop",

  (req, res) => {
    readStatus(AXIS_DOOR_OPEN)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

var setVolObj;
app.post(
  "/jog/vol",

  (req, res) => {
    vol = req.body.vol;
    if (setVolObj) {
      clearInterval(setVolObj);
    }
    setVolObj = setInterval(stpSetRelRevVol, 200, vol);
    res.sendStatus(200);
  }
);

app.post(
  "/cont/vol",

  (req, res) => {
    dir = req.body.dir;
    contDo(AXIS_BUCKET, dir);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/1",

  (req, res) => {
    flow1Cnt = flow1Cnt + 1;
    writeCnt(flow1Cnt);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/vol/vel",

  (req, res) => {
    slowVel = req.body.slowVel;
    workingVel = req.body.workingVel;
    accelTime = req.body.accelTime;

    setPar(AXIS_BUCKET, slowVel, workingVel, accelTime);
    res.sendStatus(200);
  }
);

app.get(
  "/jog/vol/isStop",

  (req, res) => {
    readStatus(AXIS_BUCKET)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

var setHomeObj;
app.post(
  "/jog/home",

  (req, res) => {
    axis = req.body;
    axis = AXIS_JOG_X;
    setHomeObj = setInterval(jogHome, 100);

    res.sendStatus(200);
  }
);

app.post(
  "/jog/home/vel",

  (req, res) => {
    spd = req.body.spd;
    setHomeSpd(spd);
    res.sendStatus(200);
  }
);

app.post(
  "/relMove",

  (req, res) => {
    axis = req.body.axis;
    pos = req.body.pos;
    axis = 1;
    pos = 21000;
    relMove(axis, pos, DIR_CW);
    res.sendStatus(200);
  }
);

app.post(
  "/absMultiPos",

  (req, res) => {
    axis1 = req.body.axis1;
    axis2 = req.body.axis2;
    axis3 = req.body.axis3;
    pos1 = req.body.pos1;
    pos2 = req.body.pos2;
    pos3 = req.body.pos3;
    /*
    axis1 = 1;
    axis2 = 2;
    axis3 = 0;
    pos1 = 21000;
    pos2 = 21000;
    pos3 = 21000;
    */
    absMultiPos(axis1, pos1, axis2, pos2, axis3, pos3);

    res.sendStatus(200);
  }
);

app.post(
  "/jog/stop",

  (req, res) => {
    axis = req.body.axis;
    moveStop(axis);
    res.sendStatus(200);
  }
);

app.post(
  "/jog/stopAll",

  (req, res) => {
    stopAll();
    res.sendStatus(200);
  }
);

app.post(
  "/setHome",

  (req, res) => {
    setHomeAll();
    res.sendStatus(200);
  }
);

const readAllStatus = () => {
  return new Promise((resolve, reject) => {
    axis_client
      .readHoldingRegisters(PAR_ADDR_ALL_STATUS_CODE, 1)
      .then(function (d) {
        return resolve(d.data);
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const readStatus = (axis) => {
  if (axis >= 8) {
    axis = axis - 8;
    address = PAR_ADDR_EXT_STATUS_CODE + axis;
  } else address = PAR_ADDR_STATUS_CODE + axis;

  return new Promise((resolve, reject) => {
    axis_client
      .readHoldingRegisters(address, 1)
      .then(function (d) {
        if (d.data == 0) return resolve(true);
        else return resolve(false);
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const curPos = (axis) => {
  if (axis >= 8) {
    axis = axis - 8;
    address = PAR_ADDR_EXT_CUR_POS + axis * 2;
  } else address = PAR_ADDR_CUR_POS + axis * 2;

  return new Promise((resolve, reject) => {
    axis_client
      .readHoldingRegisters(address, 2)
      .then(function (d) {
        //console.log(d.data);
        return resolve(toInt32(d.data));
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const absFastMove = (axis, AbsPos) => {
  if (axis >= 8) {
    axis = axis - 8;
    address = PAR_ADDR_EXT_ABS_FAST_POS + axis * 2;
  } else address = PAR_ADDR_ABS_FAST_POS + axis * 2;

  return new Promise((resolve, reject) => {
    axis_client
      .writeRegisters(address, toShort(AbsPos))
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const relFastMove = (axis, RelPos) => {
  if (axis >= 8) {
    axis = axis - 8;
    address = PAR_ADDR_EXT_REL_FAST_POS + axis * 2;
  } else address = PAR_ADDR_REL_FAST_POS + axis * 2;

  return new Promise((resolve, reject) => {
    axis_client
      .writeRegisters(address, toShort(RelPos))
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const relPos = (axis, RelPos) => {
  if (axis >= 8) {
    axis = axis - 8;
    address = PAR_ADDR_EXT_REL_POS + axis * 2;
  } else address = PAR_ADDR_REL_POS + axis * 2;

  if (RelPos < 0) return reject("Pos mush >= 0");

  return new Promise((resolve, reject) => {
    axis_client
      .writeRegisters(address, toShort(RelPos))
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const relDo = (axis, dir) => {
  if (axis >= 8) {
    axis = axis - 8;
    address = PAR_ADDR_EXT_MOVE_REL_DO + axis;
  } else address = PAR_ADDR_MOVE_REL_DO + axis;

  return new Promise((resolve, reject) => {
    axis_client
      .writeCoil(address, dir)
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const contDo = (axis, dir) => {
  if (axis >= 8) {
    axis = axis - 8;
    address = PAR_ADDR_EXT_MOVE_CONT_DO + axis;
  } else address = PAR_ADDR_MOVE_CONT_DO + axis;

  return new Promise((resolve, reject) => {
    axis_client
      .writeCoil(address, dir)
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const moveStop = (axis) => {
  if (axis >= 8) {
    axis = axis - 8;
    address = PAR_ADDR_EXT_MOVE_STOP + axis;
  } else address = PAR_ADDR_MOVE_STOP + axis;

  return new Promise((resolve, reject) => {
    axis_client
      .writeCoil(address, true)
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const stopAll = () => {
  return new Promise((resolve, reject) => {
    axis_client
      .writeCoil(PAR_ADDR_ALL_STOP, true)
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const setHomeAll = () => {
  return new Promise((resolve, reject) => {
    axis_client
      .writeCoil(PAR_ADDR_SET_HOME, true)
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const setSlowVel = (axis, SlowVel) => {
  if (axis >= 8) {
    axis = axis - 8;
    address = PAR_ADDR_EXT_SET_SLOW_VEL + axis * 2;
  } else address = PAR_ADDR_SET_SLOW_VEL + axis * 2;

  return new Promise((resolve, reject) => {
    axis_client
      .writeRegisters(address, toShort(SlowVel))
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const setWorkingVel = (axis, WorkingVel) => {
  if (axis >= 8) {
    axis = axis - 8;
    address = PAR_ADDR_EXT_SET_WORKING_VEL + axis * 2;
  } else address = PAR_ADDR_SET_WORKING_VEL + axis * 2;

  return new Promise((resolve, reject) => {
    axis_client
      .writeRegisters(address, toShort(WorkingVel))
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const setAccelTime = (axis, AccelTime) => {
  if (axis >= 8) {
    axis = axis - 8;
    address = PAR_ADDR_EXT_SET_ACCEL_TIME + axis * 2;
  } else address = PAR_ADDR_SET_ACCEL_TIME + axis * 2;

  return new Promise((resolve, reject) => {
    axis_client
      .writeRegisters(address, toShort(AccelTime))
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const setHomeSpd = (spd) => {
  return new Promise((resolve, reject) => {
    axis_client
      .writeRegister(PAR_ADDR_HOME_VEL, spd)
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const setPar = (axis, SlowVel, WorkingVel, AccelTime) => {
  setSlowVel(axis, SlowVel).then(() => {
    setWorkingVel(axis, WorkingVel).then(() => {
      setAccelTime(axis, AccelTime);
    });
  });
};

function toShort(number) {
  const uint16 = new Uint16Array(2);
  uint16[0] = number;
  uint16[1] = number >> 16;
  return uint16;
}

function toInt32(number) {
  return (number[1] << 16) + number[0];
}

function valueAtBit(num, bit) {
  return (num >> (bit - 1)) & 1;
}

const robotTargetReach = () => {
  return new Promise((resolve, reject) => {
    readStatus(AXIS_JOG_X).then((status1) => {
      if (status1 == true) {
        readStatus(AXIS_JOG_Y).then((status2) => {
          if (status2 == true) {
            readStatus(AXIS_JOG_Z).then((status3) => {
              if (status3 == true) {
                return resolve(true);
              } else return resolve(false);
            });
          } else return resolve(false);
        });
      } else return resolve(false);
    });
  });
};

const latchTargetReach = () => {
  readStatus(AXIS_JOG_ARM).then((status1) => {
    if (status1 == true) {
      readStatus(AXIS_JOG_CV).then((status2) => {
        if (status2 == true) {
          return true;
        } else return false;
      });
    } else return false;
  });
};

const absMultiPos = (axis1, AbsPos1, axis2, AbsPos2, axis3, AbsPos3) => {
  absFastMove(axis1, AbsPos1).then(() => {
    absFastMove(axis2, AbsPos2).then(() => {
      if (axis3 != 0 && axis3 != undefined) absFastMove(axis3, AbsPos3);
    });
  });
};

const relMove = (axis1, RelPos, dir) => {
  return relPos(axis1, RelPos).then(() => {
    relDo(axis1, dir);
  });
};

const posToStep = (pos, stepPerMM) => {
  if (stepPerMM < 0) stepPerMM = 1.0;
  return Math.floor(pos * stepPerMM); //捨去小數點
};

const oven_Open = () => {
  if (
    isHome[AXIS_OVEN_FLIP] == true &&
    isOvenFlip == false &&
    isOvenOpen == false
  )
    absFastMove(AXIS_OVEN_OPEN, openPul).then(() => {
      isOvenOpen = true;
    });
};

const oven_Close = () => {
  if (
    isHome[AXIS_OVEN_FLIP] == true &&
    isOvenFlip == false &&
    isOvenOpen == true
  )
    absFastMove(AXIS_OVEN_OPEN, 0).then(() => {
      isOvenOpen = false;
    });
};

const oven_FlipTurn = () => {
  if (
    isHome[AXIS_OVEN_OPEN] == true &&
    isOvenFlip == false &&
    isOvenOpen == false
  )
    absFastMove(AXIS_OVEN_FLIP, flipPul).then(() => {
      isOvenFlip = true;
    });
};

const oven_FlipBack = () => {
  if (
    isHome[AXIS_OVEN_OPEN] == true &&
    isOvenFlip == true &&
    isOvenOpen == false
  )
    absFastMove(AXIS_OVEN_FLIP, 0).then(() => {
      isOvenFlip = false;
      isFlipStandBy = false;
    });
};

const oven_FlipStandBy = () => {
  if (
    isHome[AXIS_OVEN_OPEN] == true &&
    isFlipStandBy == false &&
    isOvenFlip == false &&
    isOvenOpen == false
  )
    absFastMove(AXIS_OVEN_FLIP, standByPul).then(() => {
      isFlipStandBy == true;
    });
};

const oven_FinishTurn = () => {
  if (
    isHome[AXIS_OVEN_OPEN] == true &&
    isHome[AXIS_OVEN_FLIP] == true &&
    isOvenFinish == false
  )
    absMultiPos(
      AXIS_OVEN_OPEN,
      openFinishPul,
      AXIS_OVEN_FLIP,
      flipFinishPul
    ).then(() => {
      isOvenFinish = true;
    });
};

const oven_FinishBack = () => {
  if (
    isHome[AXIS_OVEN_OPEN] == false &&
    isHome[AXIS_OVEN_FLIP] == false &&
    isOvenFinish == true
  )
    absMultiPos(AXIS_OVEN_OPEN, 0, AXIS_OVEN_FLIP, 0).then(() => {
      isOvenFinish = false;
    });
};

const jog = (axis, cmdPos, stepPerMM) => {
  absFastMove(axis, posToStep(cmdPos, stepPerMM)).then(() => {});
};

let homeStep = 0;
const jogHome = () => {
  return new Promise((resolve) => {
    switch (homeStep) {
      case 0:
        setHomeAll().then(() => {
          homeMultiStep = 0;
          homeStep = 1;
          console.log(0);
        });
        break;

      case 1:
        jogHomeMulti(AXIS_JOG_X, AXIS_JOG_Y, AXIS_OVEN_OPEN);

        if (homeMultiStep == 4) {
          homeMultiStep = 0;
          homeStep = 2;
        }

        if (homeMultiStep == 9) homeStep = 9;
        console.log(1);
        break;

      case 2:
        jogHomeMulti(AXIS_JOG_Y, AXIS_OVEN_OPEN, AXIS_OVEN_FLIP);

        if (homeMultiStep == 4) {
          homeMultiStep = 0;
          homeStep = 3;
        }

        if (homeMultiStep == 9) homeStep = 9;
        console.log(2);
        break;

      case 3:
        jogHomeMulti(AXIS_OVEN_OPEN, AXIS_OVEN_FLIP, AXIS_JOG_X);

        if (homeMultiStep == 4) {
          homeMultiStep = 0;
          homeStep = 4;
        }

        if (homeMultiStep == 9) homeStep = 9;

        console.log(3);
        break;

      case 4:
        homeStep = 0;
        console.log(4);
        clearInterval(setHomeObj);
        break;

      case 9:
        homeStep = 0;
        console.log("Home " + homeErrId + " Error");
        clearInterval(setHomeObj);
        break;
    }
    return resolve(homeStep);
  });
};

let homeMultiStep = 0;
let homeErrId = 0;
const jogHomeMulti = (axis1, axis2, axis3) => {
  maxPos = -60000;
  switch (homeMultiStep) {
    case 0:
      relFastMove(axis1, maxPos).then(() => {
        relFastMove(axis2, maxPos).then(() => {
          relFastMove(axis3, maxPos).then(() => {
            homeMultiStep = 1;
            console.log(0);
          });
        });
      });
      break;
    case 1:
      readAllStatus().then((status) => {
        if (status == 0) {
          homeMultiStep = 2;
          console.log(1);
        }
      });
      break;
    case 2:
      curPos(axis1).then((value) => {
        if (value > maxPos) {
          curPos(axis2).then((value2) => {
            if (value2 > maxPos) {
              curPos(axis3).then((value3) => {
                if (value3 > maxPos) {
                  homeMultiStep = 3;
                  console.log(4);
                } else {
                  homeErrId = 2;
                  homeMultiStep = 9;
                }
                console.log("2-3");
              });
            } else {
              homeErrId = 3;
              homeMultiStep = 9;
            }
            console.log("2-2");
          });
        } else {
          homeErrId = 1;
          homeMultiStep = 9;
        }
        console.log("2-1");
      });

      break;

    case 3:
      setHomeAll().then(() => {
        homeMultiStep = 4;
        console.log("3");
      });
      break;

    case 4:
      isHome[axis1] = true;
      isHome[axis2] = true;
      isHome[axis3] = true;
      console.log("4");

      break;
    case 9:
      console.log("Home " + homeErrId + " Error");

      break;
    default:
  }
};

let homeSingleStep = 0;
const jogHomeSingle = (axis) => {
  return new Promise((resolve, reject) => {
    maxPos = -60000;
    switch (homeSingleStep) {
      case 0:
        setHomeAll().then(() => {
          homeSingleStep = 0;
          console.log("0");
        });
        break;
      case 1:
        relFastMove(axis, maxPos).then(() => {
          homeSingleStep = 2;
        });
        console.log("1");
        break;
      case 2:
        readStatus(axis).then((status) => {
          if (status == true) {
            homeSingleStep = 3;
            console.log("2-1");
          }
        });
        console.log("2");
        break;
      case 3:
        curPos(axis).then((value) => {
          if (value > maxPos) {
            homeSingleStep = 4;
            console.log("3-1");
          } else {
            homeErrId = 1;
            homeSingleStep = 9;
          }
        });
        console.log("3");
        break;
      case 4:
        setHomeAll().then(() => {
          homeSingleStep = 5;
          console.log("4");
        });
        break;
      case 5:
        isHome[axis] = true;
        homeSingleStep = 0;
        console.log("5");
        clearInterval(setHomeObj);
        break;
      case 9:
        homeSingleStep = 0;
        console.log("Home " + homeErrId + " Error");
        clearInterval(setHomeObj);
        break;
    }
    return resolve(true);
  });
};

let flow1Cnt = 0;
let flowSensorCaliFactor = 4; // unit: ml/Count
let step = 0;
let lastPos = 0;
let stepErr = false;
let volStep = 0;
let absVOL = 0;
let howManyRound = 0;
let totalPul = 0;
let cmdTop = false;
let firstMotorStep = 0;
let scdMotorStep = 0;
let firstReachCount = 0;
let scdReachCount = 0;
let targetSensorPulCount = 0;
let volin1MotorStep = 0;
let firstStageVol = 0;
let secondStageVol = 0;
let remainderVol = 0;

let totalPul3 = 0;

const stpSetRelRevVol = (cmdVol) => {
  switch (volStep) {
    case TO_INI:
      if (cmdVol == 99) {
        cmdVol = volin1ToTop;
        cmdTop = true;
      } else cmdTop = false;

      stepErr = false;
      step = 0;

      absVOL = Math.abs(cmdVol); //unit:ml
      howManyRound = absVOL / (volin1Round * volin1Factor);
      totalPul = Math.floor(howManyRound * totalPulIn1Round);
      targetSensorPulCount = Math.floor(absVOL / flowSensorCaliFactor);

      console.log(absVOL);
      console.log(howManyRound);
      console.log(totalPul);
      console.log(targetSensorPulCount);

      if (cmdVol > 0) {
        volStep = TO_TOP;
      } else {
        totalPul = totalPul * -1;
        volStep = TO_BACKVOL;
      }
      console.log("0");
      break;
    case TO_TOP:
      if (step == 0) {
        resetFlow1Cnt().then(() => {
          curPos(AXIS_JOG_X).then((value) => {
            lastPos = value;
            contDo(AXIS_JOG_X, DIR_CW).then(() => {
              step = 1;
            });
          });
        });
      } else if (step == 1) {
        getFlow1Cnt().then((count) => {
          SensorPulCount = count;
          if (SensorPulCount > 0) step = 2;
          else {
            curPos(AXIS_JOG_X).then((value) => {
              firstMotorStep = value - lastPos;
              if (firstMotorStep >= totalPul) {
                stepErr = true;
                step = 2;
              }
            });
          }
        });
        console.log("1-1");
      } else if (step == 2) {
        moveStop(AXIS_JOG_X).then(() => {
          if (stepErr) {
            if (cmdTop == true) flowSensorErr(99);
            else flowSensorErr(1); //如果for迴圈有跑完，代表flowSensor怪怪的
            volStep = TO_OK;
          } else step = 3;
        });
        console.log("1-2");
      } else if (step == 3) {
        readStatus(AXIS_JOG_X).then((status) => {
          if (status == true) {
            curPos(AXIS_JOG_X).then((value) => {
              firstMotorStep = value - lastPos;
              lastPos = value;
              firstReachCount = SensorPulCount;

              if (cmdTop == true) volStep = TO_OK;
              else volStep = TO_TARGETVOL;
              step = 0;
              console.log(firstMotorStep);
            });
          }
        });
        console.log("1-3");
      }

      break;
    case TO_TARGETVOL:
      if (step == 0) {
        contDo(AXIS_JOG_X, DIR_CW).then(() => {
          step = 1;
        });
        console.log(4);
      } else if (step == 1) {
        getFlow1Cnt().then((count) => {
          SensorPulCount = count;

          if (SensorPulCount >= targetSensorPulCount - 1) {
            step = 2;
          } else {
            curPos(AXIS_JOG_X).then((value) => {
              scdMotorStep = value - lastPos;
              if (scdMotorStep >= totalPul) {
                stepErr = true;
                step = 2;
              }
            });
          }
        });
        console.log("2-1");
      } else if (step == 2) {
        moveStop(AXIS_JOG_X).then(() => {
          if (stepErr) {
            flowSensorErr(2); //如果for迴圈有跑完，代表flowSensor怪怪的
            volStep = TO_OK;
          } else step = 3;
        });
        console.log("2-2");
      } else if (step == 3) {
        readStatus(AXIS_JOG_X).then((status) => {
          if (status == true) {
            curPos(AXIS_JOG_X).then((value) => {
              scdMotorStep = value - lastPos;

              scdReachCount = SensorPulCount;

              volin1MotorStep =
                ((scdReachCount - firstReachCount) * flowSensorCaliFactor) /
                scdMotorStep;
              firstStageVol = firstMotorStep * volin1MotorStep;
              secondStageVol = scdMotorStep * volin1MotorStep;
              remainderVol = absVOL - secondStageVol - firstStageVol;

              totalPul3 = Math.floor(remainderVol / volin1MotorStep);

              volStep = TO_REMAINDERVOL;
              step = 0;
              console.log(scdMotorStep);
              console.log(totalPul3);
            });
          }
        });
        console.log("2-3");
      }

      break;
    case TO_REMAINDERVOL:
      if (step == 0) {
        if (remainderVol > 0) {
          relFastMove(AXIS_JOG_X, totalPul3).then(() => {
            step = 1;
          });
        } else {
          volStep = TO_OK;
        }
        console.log("3-1");
      } else if (step == 1) {
        readStatus(AXIS_JOG_X).then((status) => {
          if (status == true) {
            volStep = TO_OK;
            step = 0;
          }
        });
        console.log("3-2");
      }
      break;
    case TO_BACKVOL:
      if (step == 0) {
        relFastMove(AXIS_JOG_X, totalPul).then(() => {
          step = 1;
        });
        console.log("4-1");
      } else if (step == 1) {
        readStatus(AXIS_JOG_X).then((status) => {
          if (status == true) {
            volStep = TO_OK;
            step = 0;
          }
        });
        console.log("4-2");
      }
      break;
    case TO_OK:
      resetFlow1Cnt().then(() => {
        clearInterval(setVolObj);
        stepErr = false;
        volStep = 0;
      });
      console.log("9");
      break;
    default:
  }
};

const postWebAPI = (port, url, payload = "") => {
  return new Promise((resolve, reject) => {
    axios({
      method: "post",
      baseURL: "http://localhost:" + port + url,
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
    logger.debug("POST " + url + " " + payload);
  });
};

const getWebAPI = (port, url) => {
  return new Promise((resolve, reject) => {
    axios({
      method: "get",
      baseURL: "http://localhost:" + port + url,
    })
      .then((res) => {
        logger.debug(port + url);
        return resolve(res.data);
      })
      .catch((err) => {
        logger.error(err.message);
        return reject(err.message);
      });
    logger.debug("GET " + url);
  });
};

const getFlow1Cnt = () => {
  return getWebAPI(process.env.MAIN_BACKEND_PORT, "/flow1/cnt");
  //return readCnt();
};

const resetFlow1Cnt = () => {
  return postWebAPI(process.env.MAIN_BACKEND_PORT, "/flow1/cnt/reset");
  //flow1Cnt = 0;
  //return writeCnt(0);
};

const flowSensorErr = (id) => {
  //return postWebAPI(process.env.MAIN_BACKEND_PORT, "/flow/err", id);
  console.log("flowError:" + id);
};

const readCnt = () => {
  return new Promise((resolve, reject) => {
    axis_client
      .readHoldingRegisters(PAR_ADDR_CNT, 1)
      .then(function (d) {
        //console.log(d.data);
        return resolve(d.data);
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const writeCnt = (cnt) => {
  return new Promise((resolve, reject) => {
    axis_client
      .writeRegister(PAR_ADDR_CNT, cnt)
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};
