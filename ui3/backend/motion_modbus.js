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

const ModbusRTU = require("modbus-serial");

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

//1~12
const PAR_ADDR_SET_HOME = 0x0000;

//1~8
const PAR_ADDR_MOVE_DO = 0x0011;
const PAR_ADDR_MOVE_STOP = 0x0023;
//9~12
const PAR_ADDR_EXT_MOVE_DO = 0x0111;
const PAR_ADDR_EXT_MOVE_STOP = 0x0123;

//1~12
const PAR_ADDR_ALL_STOP = 0x002c;

//1~8
const PAR_ADDR_SET_SLOW_VEL = 0x0000;
const PAR_ADDR_SET_WORKING_VEL = 0x0010;
const PAR_ADDR_SET_ACCEL_TIME = 0x0020;
const PAR_ADDR_ABS_POS = 0x0080;
const PAR_ADDR_REL_FAST_POS = 0x00e0;
const PAR_ADDR_ABS_FAST_POS = 0x00f0;
//9~12
const PAR_ADDR_EXT_SET_SLOW_VEL = 0x0100;
const PAR_ADDR_EXT_SET_WORKING_VEL = 0x0110;
const PAR_ADDR_EXT_SET_ACCEL_TIME = 0x0120;
const PAR_ADDR_EXT_ABS_POS = 0x0180;
const PAR_ADDR_EXT_REL_FAST_POS = 0x01e0;
const PAR_ADDR_EXT_ABS_FAST_POS = 0x01f0;
//1~12
const PAR_ADDR_STATUS_CODE = 0x0096;

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

app.get(
  "/status",

  (req, res) => {
    readStatus()
      .then((value) => {
        res.status(200).send("status " + value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post(
  "/absMove",

  (req, res) => {
    axis = req.body.axis;
    pos = req.body.pos;
    //axis = 1;
    //pos = 21000;
    absPos(axis, pos);
    res.sendStatus(200);
  }
);

app.post(
  "/relMove",

  (req, res) => {
    axis = req.body.axis;
    pos = req.body.pos;
    //axis = 1;
    //pos = 21000;
    relPos(axis, pos);
    res.sendStatus(200);
  }
);
/*
app.post(
  "/relMove2",

  (req, res) => {
    axis = req.body.axis;
    pos = req.body.pos;
    axis = 2;
    pos = 21000;
    relPos(axis, pos);
    res.sendStatus(200);
  }
);

app.post(
  "/relMove5",

  (req, res) => {
    axis = req.body.axis;
    pos = req.body.pos;
    axis = 5;
    pos = 21000;
    relPos(axis, pos);
    res.sendStatus(200);
  }
);
*/
app.post(
  "/relMove6",

  (req, res) => {
    axis = req.body.axis;
    pos = req.body.pos;
    //axis = 6;
    //pos = 21000;
    relPos(axis, pos);
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
  "/relMultiPos",

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
    axis3 = 6;
    pos1 = 21000;
    pos2 = 21000;
    pos3 = 21000;
    */
    relMultiPos(axis1, pos1, axis2, pos2, axis3, pos3);

    res.sendStatus(200);
  }
);

app.post(
  "/absHome",

  (req, res) => {
    axis = req.body.axis;
    pos = req.body.pos;
    //axis = 1;
    //pos = 0;
    absPos(axis, pos);
    res.sendStatus(200);
  }
);

app.post(
  "/stop",

  (req, res) => {
    axis = req.body.axis;
    //axis = 1;
    moveStop(axis);
    res.sendStatus(200);
  }
);

app.post(
  "/stopAll",

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

app.post(
  "/setPar",

  (req, res) => {
    axis = req.body.axis;
    //axis = 1;
    setPar(axis, 100, 4000, 10);
    res.sendStatus(200);
  }
);

app.post(
  "/SlowVel",

  (req, res) => {
    axis = req.body.axis;
    slowVel = req.body.slowVel;
    //axis = 1;
    //slowVel = 110;
    setSlowVel(axis, slowVel);
    res.sendStatus(200);
  }
);

app.post(
  "/WorkingVel",

  (req, res) => {
    axis = req.body.axis;
    workingVel = req.body.workingVel;
    //axis = 1;
    //workingVel = 4100;
    setWorkingVel(axis, workingVel);
    res.sendStatus(200);
  }
);

app.post(
  "/AccelTime",

  (req, res) => {
    axis = req.body;
    accelTime = req.body.accelTime;
    //axis = 1;
    //accelTime = 110;
    setAccelTime(axis, accelTime);
    res.sendStatus(200);
  }
);

const readStatus = () => {
  return new Promise((resolve, reject) => {
    axis_client
      .readHoldingRegisters(PAR_ADDR_STATUS_CODE, 1)
      .then(function (d) {
        console.log(d.data);
        return resolve(d.data);
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(errmessage);
      });
  });
};

const absPos = (axis, AbsPos) => {
  if (axis >= 9) {
    axis = axis - 9;
    address = PAR_ADDR_EXT_ABS_FAST_POS + axis * 2;
  } else address = PAR_ADDR_ABS_FAST_POS + (axis - 1) * 2;

  return new Promise((resolve, reject) => {
    axis_client
      .writeRegisters(address, [AbsPos, 0])
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
  if (axis >= 9) {
    axis = axis - 9;
    address = PAR_ADDR_EXT_REL_FAST_POS + axis * 2;
  } else address = PAR_ADDR_REL_FAST_POS + (axis - 1) * 2;

  return new Promise((resolve, reject) => {
    axis_client
      .writeRegisters(address, [RelPos, 0])
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
  if (axis >= 9) {
    axis = axis - 9;
    address = PAR_ADDR_EXT_MOVE_STOP + axis;
  } else address = PAR_ADDR_MOVE_STOP + axis - 1;

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
  if (axis >= 9) {
    axis = axis - 9;
    address = PAR_ADDR_EXT_SET_SLOW_VEL + axis * 2;
  } else address = PAR_ADDR_SET_SLOW_VEL + (axis - 1) * 2;

  return new Promise((resolve, reject) => {
    axis_client
      .writeRegisters(address, [SlowVel, 0])
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
  if (axis >= 9) {
    axis = axis - 9;
    address = PAR_ADDR_EXT_SET_WORKING_VEL + axis * 2;
  } else address = PAR_ADDR_SET_WORKING_VEL + (axis - 1) * 2;

  return new Promise((resolve, reject) => {
    axis_client
      .writeRegisters(address, [WorkingVel, 0])
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
  if (axis >= 9) {
    axis = axis - 9;
    address = PAR_ADDR_EXT_SET_ACCEL_TIME + axis * 2;
  } else address = PAR_ADDR_SET_ACCEL_TIME + (axis - 1) * 2;

  return new Promise((resolve, reject) => {
    axis_client
      .writeRegisters(address, [AccelTime, 0])
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

const absMultiPos = (axis1, AbsPos1, axis2, AbsPos2, axis3, AbsPos3) => {
  absPos(axis1, AbsPos1).then(() => {
    absPos(axis2, AbsPos2).then(() => {
      if (axis3 != 0 && axis3 != undefined) absPos(axis3, AbsPos3);
    });
  });
};

const relMultiPos = (axis1, AbsPos1, axis2, AbsPos2, axis3, AbsPos3) => {
  relPos(axis1, AbsPos1).then(() => {
    relPos(axis2, AbsPos2).then(() => {
      if (axis3 != 0 && axis3 != undefined) relPos(axis3, AbsPos3);
    });
  });
};
