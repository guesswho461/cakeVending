require("dotenv").config({ path: "../frontend/.env" });

const argv_opts = {
  string: ["device"],
  default: { device: "/dev/ttyUSB0" },
};
const argv = require("minimist")(process.argv.slice(2), argv_opts);

const VERSION = "io_modbus v1.0"; //Jun 17, 2021
const port = process.env.IO_BACKEND_PORT;

const log4js = require("log4js");
const logger = log4js.getLogger(VERSION);
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const axios = require("axios");

const ModbusRTU = require("modbus-serial");

var client = new ModbusRTU();
client.setTimeout(500);
client.setID(1);

//argv.device;
client.connectRTUBuffered("COM2", {
  baudRate: 115200,
  parity: "none",
  stopBits: 1,
  dataBits: 8,
});

let alarmCnts = {
  opModeAlarm: 0,
  macTempAlarm: 0,
  bucketStatusAlarm: 0,
  batterVolAlarm: 0,
  bowlCntAlarm: 0,
  gateOpenAlarm: 0,
};

let gateCmd = false;
let isGateOpen = false;

const machineInfo = {
  name: process.env.NAME,
  isSoldout: false,
};

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

//min to ms
const checkGateCmdDelay = process.env.CHECK_GATE_CMD_DELAY * 60 * 1000;

//set to ms
const coinEnableDelayToResponse =
  process.env.COIN_ENABLE_DELAY_TO_RESPONSE * 1000;

const coin_debounceDelay = 40; //debounce delay (ms)
const flow_debounceDelay = 5; //debounce delay (ms)
const tp_keythreshold = 70;

//Celsius
let maxFridgeTemp =
  parseFloat(process.env.MAX_FRIDGE_TEMP) +
  parseFloat(process.env.MAX_FRIDGE_TEMP_OFFSET);

let machineIsEnable = true;
let checkGateCmdDelayObj;

let vacuum_startTime = 0;
let vacuum_endTime = 0;
let coin1_startTime = 0;
let coin1_endTime = 0;
let coin2_startTime = 0;
let coin2_endTime = 0;
let clean1_startTime = 0;
let clean1_endTime = 0;
let clean2_startTime = 0;
let clean2_endTime = 0;
let clean3_startTime = 0;
let clean3_endTime = 0;
let reset_startTime = 0;
let reset_endTime = 0;

let coin1EnableDelayOk = false;
let coin2EnableDelayOk = false;

let ovenIsReady = true;
let tpMode = "Manual";

let lastMacTemp = 0;
let lastBowlCnt = 0;
let lastBatterVol = 0;
let lastFridgeTemp = 0;

let isCheckBowlCnt = true;
let isCheckBatterVol = true;
let ischeckCoin1Debounced = true;
let ischeckCoin2Debounced = true;
let ischeckFlow1Debounced = true;
let ischeckFlow2Debounced = true;

let isClean1 = false;
let isClean2 = false;
let isClean3 = false;

//system
const PAR_ADDR_FW_VER = 0x0000;
const PAR_ADDR_SERIAL_NUM_H = 0x0001;
const PAR_ADDR_SERIAL_NUM_L = 0x0002;
const PAR_ADDR_SYS_CMD = 0x0003;
const PAR_ADDR_SYS_PW = 0x0004;
const PAR_ADDR_SYS_CYCLIC_TIME = 0x0005;
const PAR_ADDR_SYS_ERROR_CODE = 0x0006;
const PAR_ADDR_SYS_HEARTBEAT = 0x0007;

//status
const PAR_ADDR_BOWL_CNT = 0x0010;
const PAR_ADDR_BATTER_CNT = 0x0011;
const PAR_ADDR_OVEN_TEMP = 0x0012;
const PAR_ADDR_FRIG_TEMP = 0x0013;
const PAR_ADDR_MACH_TEMP = 0x0014;
const PAR_ADDR_BOWL_READY = 0x0015;
const PAR_ADDR_FLOW_1_CNT = 0x0016;
const PAR_ADDR_FLOW_2_CNT = 0x0017;
const PAR_ADDR_COIN_1_CNT = 0x0018;
const PAR_ADDR_COIN_2_CNT = 0x0019;
const PAR_ADDR_TP_MODE = 0x001a;
const PAR_ADDR_TP_JOG_SPD = 0x001b;
const PAR_ADDR_TP_JOG_TARGET = 0x001c;
const PAR_ADDR_TP_JOG_DIR = 0x001d;
const PAR_ADDR_ALARM_RESET = 0x001e;
const PAR_ADDR_CLEAN_1 = 0x001f;
const PAR_ADDR_CLEAN_2 = 0x0020;
const PAR_ADDR_CLEAN_3 = 0x0021;

//command BOOL
const PAR_ADDR_COIN_1_CMD = 0x0080;
const PAR_ADDR_COIN_2_CMD = 0x0081;
const PAR_ADDR_BRAKE_CMD = 0x0082;
const PAR_ADDR_LED_1_CMD = 0x0083;
const PAR_ADDR_LED_2_CMD = 0x0084;
const PAR_ADDR_LED_3_CMD = 0x0085;
const PAR_ADDR_DEPRESSURELIZE_CMD = 0x0086;
const PAR_ADDR_FRIG_CMD = 0x0087;
const PAR_ADDR_VACUUM_CMD = 0x0088;
const PAR_ADDR_OVEN_CMD = 0x0089;
const PAR_ADDR_GATE_CMD = 0x008a;

const PAR_ADDR_TP_OVEN_TEMP_CMD = 0x0090;
const PAR_ADDR_OVEN_TEMP_CMD = 0x0091;

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
  "/bowl/suck",

  (req, res) => {
    vacuumOpen_Ctrl(true);
    res.sendStatus(200);
  }
);

let setVacuumObj;
app.post(
  "/bowl/release",

  (req, res) => {
    setVacuumObj = setInterval(vacuumClose_Ctrl, 50);
    res.sendStatus(200);
  }
);

app.post(
  "/bowl/LED/open",

  (req, res) => {
    en = true;
    writeCmd(PAR_ADDR_LED_1_CMD, true);
    res.sendStatus(200);
  }
);

app.post(
  "/bowl/LED/close",

  (req, res) => {
    writeCmd(PAR_ADDR_LED_1_CMD, false);
    res.sendStatus(200);
  }
);

app.post(
  "/gate/open",

  (req, res) => {
    gate_Open();
    res.sendStatus(200);
  }
);

app.post(
  "/gate/close",

  (req, res) => {
    gate_Close();
    res.sendStatus(200);
  }
);

app.get(
  "/gate/isOpen",

  (req, res) => {
    res.status(200).send(isGateOpen);
  }
);

app.post(
  "/robot/brake/off",

  (req, res) => {
    writeCmd(PAR_ADDR_BRAKE_CMD, true);
    res.sendStatus(200);
  }
);

app.post(
  "/robot/brake/on",

  (req, res) => {
    writeCmd(PAR_ADDR_BRAKE_CMD, false);
    res.sendStatus(200);
  }
);

app.get(
  "/oven/heat",

  (req, res) => {
    readData(PAR_ADDR_OVEN_CMD);
    res.sendStatus(200);
  }
);

app.get(
  "/refrig/cold",

  (req, res) => {
    readData(PAR_ADDR_FRIG_CMD);
    res.sendStatus(200);
  }
);

var setCoin1Obj;
app.post(
  "/coin1/enable",

  (req, res) => {
    if (setCoin1Obj) {
      clearInterval(setCoin1Obj);
    }
    coin1_startTime = new Date();
    setCoin1Obj = setInterval(coin1Trigger, 10);

    writeCmd(PAR_ADDR_COIN_1_CMD, true);
    setTimeout(() => {
      res.sendStatus(200);
    }, coinEnableDelayToResponse);
  }
);

app.post(
  "/coin1/disable",

  (req, res) => {
    if (setCoin1Obj) {
      clearInterval(setCoin1Obj);
    }
    coin1EnableDelayOk = false;
    writeCmd(PAR_ADDR_COIN_1_CMD, false);
    res.sendStatus(200);
  }
);

app.get(
  "/coin1/cnt",

  (req, res) => {
    res.status(200).send(coin1Count);
  }
);

var setCoin2Obj;
app.post(
  "/coin2/enable",

  (req, res) => {
    if (setCoin2Obj) {
      clearInterval(setCoin2Obj);
    }
    coin2_startTime = new Date();
    setCoin2Obj = setInterval(coin2Trigger, 10);
    writeCmd(PAR_ADDR_COIN_2_CMD, true);
    setTimeout(() => {
      res.sendStatus(200);
    }, coinEnableDelayToResponse);
  }
);

app.post(
  "/coin2/disable",

  (req, res) => {
    if (setCoin2Obj) {
      clearInterval(setCoin2Obj);
    }
    coin2EnableDelayOk = false;
    writeCmd(PAR_ADDR_COIN_2_CMD, false);
    res.sendStatus(200);
  }
);

app.get(
  "/coin2/cnt",

  (req, res) => {
    res.status(200).send(coin2Count);
  }
);

app.post(
  "/door/LED/open",

  (req, res) => {
    writeCmd(PAR_ADDR_LED_2_CMD, true);
    res.sendStatus(200);
  }
);

app.post(
  "/door/LED/close",

  (req, res) => {
    writeCmd(PAR_ADDR_LED_2_CMD, false);
    res.sendStatus(200);
  }
);

app.get(
  "/bowl/ready",

  (req, res) => {
    readData(PAR_ADDR_BOWL_READY)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/bowl/cnt",

  (req, res) => {
    readData(PAR_ADDR_BOWL_CNT)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/batter/vol",

  (req, res) => {
    readData(PAR_ADDR_BATTER_CNT)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/refrig/temp",

  (req, res) => {
    readData(PAR_ADDR_FRIG_TEMP)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/oven/temp",

  (req, res) => {
    readData(PAR_ADDR_OVEN_TEMP)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/mach/temp",

  (req, res) => {
    readData(PAR_ADDR_MACH_TEMP)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/tp/mode",

  (req, res) => {
    res.status(200).send(tpMode);
  }
);

app.get(
  "/tp/jog/dir",

  (req, res) => {
    getTpJogDir()
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/tp/jog/target",

  (req, res) => {
    getTpJogTarget()
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/tp/jog/spd",

  (req, res) => {
    getTpJogSpd()
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/tp/isClean1",

  (req, res) => {
    res.status(200).send(isClean1);
  }
);

app.post(
  "/tp/isClean1/reset",

  (req, res) => {
    isClean1 = false;
    console.log("reset");
    res.sendStatus(200);
  }
);

app.get(
  "/tp/isClean2",

  (req, res) => {
    res.status(200).send(isClean2);
  }
);

app.post(
  "/tp/isClean2/reset",

  (req, res) => {
    isClean2 = false;
    res.sendStatus(200);
  }
);

app.get(
  "/tp/isClean3",

  (req, res) => {
    res.status(200).send(isClean3);
  }
);

app.post(
  "/tp/isClean3/reset",

  (req, res) => {
    isClean3 = false;
    res.sendStatus(200);
  }
);

app.post(
  "/alarm/reset",

  (req, res) => {
    machineEnable();
    res.sendStatus(200);
  }
);

app.post(
  "/machine/enable",

  (req, res) => {
    machineEnable();
    res.sendStatus(200);
  }
);

app.post(
  "/machine/disable",

  (req, res) => {
    machineDisable();
    res.sendStatus(200);
  }
);

app.get(
  "/flow1/cnt",

  (req, res) => {
    res.status(200).send(flow1Count);
  }
);

app.post(
  "/flow1/reset",

  (req, res) => {
    flow1Count = 0;
    res.sendStatus(200);
  }
);

const writeCmd = (address, en) => {
  return new Promise((resolve, reject) => {
    if (en) value = 1;
    else value = 0;
    client
      .writeRegister(address, en)
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const readData = (address) => {
  return new Promise((resolve, reject) => {
    client
      .readHoldingRegisters(address, 1)
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

const oven_Heatctrl = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_TP_MODE).then((mode) => {
      if (mode === manual) address = PAR_ADDR_TP_OVEN_TEMP_CMD;
      else address = PAR_ADDR_OVEN_TEMP_CMD;

      readData(address).then((cmdTemp) => {
        readData(PAR_ADDR_OVEN_TEMP).then((curTemp) => {
          if (cmdTemp < curTemp && machineInfo.isSoldout == false)
            writeCmd(PAR_ADDR_OVEN_CMD, true);
          else writeCmd(PAR_ADDR_OVEN_CMD, false);

          ovenIsReady = checkOvenIsReady(curTemp.toString());
        });
      });
    });
    return resolve(true);
  });
};

const frig_Coldctrl = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_FRIG_TEMP).then((curTemp) => {
      if (curTemp == 0 || curTemp == -127) {
        //跳溫度異常error
        writeCmd(PAR_ADDR_FRIG_CMD, true).then(() => {});
      } else {
        if (cmdFrigTemp < curTemp)
          writeCmd(PAR_ADDR_FRIG_CMD, true).then(() => {});
        else writeCmd(PAR_ADDR_FRIG_CMD, false).then(() => {});
      }

      if (lastFridgeTemp !== curTemp) {
        fridgeTempStr = curTemp.toString();
        if (curTemp >= maxFridgeTemp) {
          postWarning("fridge temperature to high (" + fridgeTempStr + ")");
        }
      }
      lastFridgeTemp = curTemp;
    });
    return resolve(true);
  });
};

const depressurelizeDelay = 1000;
const vacuumOpen_Ctrl = () => {
  writeCmd(PAR_ADDR_VACUUM_CMD, true);
};

let vacuumStep = 0;
const vacuumClose_Ctrl = () => {
  switch (vacuumStep) {
    case 0:
      writeCmd(PAR_ADDR_VACUUM_CMD, false).then(() => {
        writeCmd(PAR_ADDR_DEPRESSURELIZE_CMD, true).then(() => {
          vacuumStep = 1;
          vacuum_startTime = new Date();
        });
      });
      break;
    case 1:
      vacuum_endTime = new Date();
      if (vacuum_endTime - vacuum_startTime >= depressurelizeDelay)
        vacuumStep = 2;
      break;
    case 2:
      writeCmd(PAR_ADDR_DEPRESSURELIZE_CMD, false).then(() => {
        vacuumStep = 3;
      });
      break;
    case 3:
      clearInterval(setVacuumObj);
      vacuumStep = 0;
      break;
  }
};

const chk_bowlCnt = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_BOWL_CNT).then((bowlCnt) => {
      if (lastBowlCnt !== bowlCnt && isCheckBowlCnt === true) {
        bowlCntStr = bowlCnt.toString();
        if (bowlCnt >= bowlCntAlarmLevel) {
          alarmCnts.bowlCntAlarm = postAlarm(
            "out of bowl (" + bowlCntStr + ")",
            alarmCnts.bowlCntAlarm,
            true,
            true
          );
        } else if (bowlCnt >= bowlCntWarningLevel) {
          postWarning("bowl cnt too low (" + bowlCntStr + ")");
        }
        if (bowlCnt >= bowlCntWarningLevel || bowlCnt >= bowlCntAlarmLevel) {
          isCheckBowlCnt = false;
          setTimeout(() => {
            isCheckBowlCnt = true;
          }, checkBowlCntDelay);
        }
      }
      lastBowlCnt = bowlCnt;
    });
    return resolve(true);
  });
};

const chk_batterVol = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_BATTER_CNT).then((batterVol) => {
      if (lastBatterVol !== batterVol && isCheckBatterVol === true) {
        batterVolStr = batterVol.toString();
        if (batterVol >= batterVolAlarmLevel) {
          alarmCnts.batterVolAlarm = postAlarm(
            "out of batter (" + batterVolStr + ")",
            alarmCnts.batterVolAlarm,
            true,
            true
          );
        } else if (batterVol >= batterVolWarningLevel) {
          postWarning("batter vol too low (" + batterVolStr + ")");
        }
        if (
          batterVol >= batterVolWarningLevel ||
          batterVol >= batterVolAlarmLevel
        ) {
          isCheckBatterVol = false;
          setTimeout(() => {
            isCheckBatterVol = true;
          }, checkBatterVolDelay);
        }
      }
      lastBatterVol = batterVol;
    });
    return resolve(true);
  });
};

const chk_macTemp = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_MACH_TEMP).then((macTemp) => {
      if (lastMacTemp !== macTemp) {
        macTempStr = macTemp.toString();
        if (macTemp >= maxMachTemp) {
          alarmCnts.macTempAlarm = postAlarm(
            "machine temperature too high (" + macTempStr + ")",
            alarmCnts.macTempAlarm
          );
        }
      }
      lastMacTemp = macTemp;
    });
    return resolve(true);
  });
};

const chk_Gate = () => {
  return new Promise((resolve, reject) => {
    if (gateCmd === true) {
      if (checkGateCmdDelayObj) {
        clearTimeout(checkGateCmdDelayObj);
      }
      checkGateCmdDelayObj = setTimeout(() => {
        if (gateCmd === true) {
          alarmCnts.gateOpenAlarm = postAlarm(
            "gate open too long",
            alarmCnts.gateOpenAlarm
          );
        }
      }, checkGateCmdDelay);
    } else {
      clearTimeout(checkGateCmdDelayObj);
    }
    return resolve(true);
  });
};

const initAlarmCnts = () => {
  var keys = Object.keys(alarmCnts);
  for (var i = 0, length = keys.length; i < length; i++) {
    alarmCnts[keys[i]] = 0;
  }
};

const postAlarm = (
  payload,
  alarmCnt,
  stopHeating = true,
  isSoldout = false
) => {
  if (alarmCnt <= 0) {
    logger.error(payload);
    postWebAPI2("/machine/alarm", payload);
    alarmCnt = alarmCnt + 1;

    machineDisable(stopHeating, isSoldout);
    machineInfo.isSoldout = true;
  }
  return alarmCnt;
};

const postWarning = (payload) => {
  logger.warn(payload);
  postWebAPI2("/machine/warning", payload);
};

const postWebAPI = (port, url, payload) => {
  return new Promise((resolve, reject) => {
    axios({
      method: "post",
      baseURL: "http://localhost:" + port + url,
      payload,
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

const postWebAPI2 = (url, payload) => {
  let good2Post = false;
  if (url === "/machine/info" || url === "/machine/alarm") {
    good2Post = true;
  } else {
    if (machineIsEnable) {
      good2Post = true;
    } else {
      good2Post = false;
    }
  }
  if (good2Post) {
    return postWebAPI(process.env.MAIN_BACKEND_PORT, url, payload);
  }
};

const machineEnable = () => {
  machineInfo.isSoldout = false;
  machineIsEnable = true;
  postWebAPI2("/machine/info", "is enable");
  logger.info("machine enable");
  initAlarmCnts();
};

const machineDisable = (stopHeating = true, isSoldout = false) => {
  if (stopHeating === true) {
    writeCmd(PAR_ADDR_OVEN_CMD, false);
  }
  if (isSoldout === true) {
    postWebAPI2("/machine/info", "is sold out");
    logger.info("machine sold out");
  } else {
    postWebAPI2("/machine/info", "is disable");
    logger.info("machine disable");
  }
  machineIsEnable = false;
};

const checkOvenIsReady = (tempature) => {
  const parsed = parseInt(tempature, 10);
  return parsed >= process.env.REACT_APP_OVEN_GOOD_TEMPERATURE ? true : false;
};

const coin1Trigger = () => {
  return new Promise((resolve, reject) => {
    if (coin1EnableDelayOk == false) {
      coin1_endTime = new Date();
      if (coin1_startTime - coin1_endTime >= coinEnableDelayToResponse) {
        coin1EnableDelayOk = true;
      }
    }
    if (coin1EnableDelayOk == true) {
      readData(PAR_ADDR_COIN_1_CNT).then((inc) => {
        if (inc == 1 && ischeckCoin1Debounced === true) {
          coin1Count++;

          ischeckCoin1Debounced = false;
          setTimeout(() => {
            ischeckCoin1Debounced = true;
          }, coin_debounceDelay);
        }
      });
    }
    return resolve(true);
  });
};

const coin2Trigger = () => {
  return new Promise((resolve, reject) => {
    if (coin2EnableDelayOk == false) {
      coin2_endTime = new Date();
      if (coin2_startTime - coin2_endTime >= coinEnableDelayToResponse) {
        coin2EnableDelayOk = true;
      }
    }

    if (coin2EnableDelayOk == true) {
      readData(PAR_ADDR_COIN_2_CNT).then((inc) => {
        if (inc == 1 && ischeckCoin2Debounced === true) {
          coin2Count++;

          ischeckCoin2Debounced = false;
          setTimeout(() => {
            ischeckCoin2Debounced = true;
          }, coin_debounceDelay);
        }
      });
    }
    return resolve(true);
  });
};

const flow1Trigger = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_FLOW_1_CNT).then((inc) => {
      if (inc == 1 && ischeckFlow1Debounced === true) {
        flow1Count++;

        ischeckFlow1Debounced = false;
        setTimeout(() => {
          ischeckFlow1Debounced = true;
        }, flow_debounceDelay);
      }
    });
    return resolve(true);
  });
};

const flow2Trigger = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_FLOW_2_CNT).then((inc) => {
      if (inc == 1 && ischeckFlow2Debounced === true) {
        flow2Count++;

        ischeckFlow2Debounced = false;
        setTimeout(() => {
          ischeckFlow2Debounced = true;
        }, flow_debounceDelay);
      }
    });
    return resolve(true);
  });
};

let lastClean1 = 1;
const clean1Trigger = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_CLEAN_1).then((value) => {
      if (isClean1 == false) {
        if (value == 0 && lastClean1 == 1) {
          clean1_startTime = new Date();
        } else if (value == 1 && lastClean1 == 0) {
          clean1_endTime = new Date();

          if (parseInt(clean1_endTime - clean1_startTime) > tp_keythreshold) {
            isClean1 = true;
            console.log("isClean True");
          }
        }
        lastClean1 = value;
      }
    });
    return resolve(true);
  });
};

let lastClean2 = 0;
const clean2Trigger = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_CLEAN_2).then((value) => {
      if (value == 1 && lastClean2 == 0) {
        clean2_startTime = new Date();
      } else if (value == 0 && lastClean2 == 1) {
        clean2_endTime = new Date();

        if (parseInt(clean2_endTime - clean2_startTime) > tp_keythreshold)
          isClean2 = true;
        else isClean2 = false;
      }
      lastClean2 = value;
    });
    return resolve(true);
  });
};

let lastClean3 = 0;
const clean3Trigger = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_CLEAN_3).then((value) => {
      if (value == 1 && lastClean3 == 0) {
        clean3_startTime = new Date();
      } else if (value == 0 && lastClean3 == 1) {
        clean3_endTime = new Date();

        if (parseInt(clean3_endTime - clean3_startTime) > tp_keythreshold)
          isClean3 = true;
        else isClean3 = false;
      }
      lastClean3 = value;
    });
    return resolve(true);
  });
};

const alarmResetTrigger = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_ALARM_RESET).then((value) => {
      if (value == 1) {
        reset_startTime = new Date();
      } else {
        reset_endTime = new Date();

        if (parseInt(reset_endTime - reset_startTime) > tp_keythreshold)
          machineEnable();
      }
    });
    return resolve(true);
  });
};

const getTpMode = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_TP_MODE).then((value) => {
      if (value == 0) {
        tpMode = "Manual";
      } else {
        tpMode = "Auto";
      }
      return resolve(tpMode);
    });
  });
};

const getTpJogTarget = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_TP_JOG_TARGET).then((value) => {
      if (value == 1) return resolve("x");
      else if (value == 3) return resolve("y");
      else if (value == 2) return resolve("z");
      else if (value == 4) return resolve("vol");
      else return resolve("");
    });
  });
};

const getTpJogDir = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_TP_JOG_DIR).then((value) => {
      if (value == 0) return resolve(false);
      else return resolve(true);
    });
  });
};

const getTpJogSpd = () => {
  return new Promise((resolve, reject) => {
    readData(PAR_ADDR_TP_JOG_SPD).then((value) => {
      percent = (value / 4096).toFixed(2);
      if (percent <= 0.1) return resolve("0");
      else if (percent > 0.1 && percent <= 0.25) return resolve("0.25");
      else if (percent > 0.25 && percent <= 0.5) return resolve("0.5");
      else if (percent > 0.5 && percent <= 0.75) return resolve("0.75");
      else if (percent > 0.75) return resolve("1");
      else return resolve(percent.toString());
    });
  });
};

const gate_Open = () => {
  if (isGateOpen == false)
    writeCmd(PAR_ADDR_GATE_CMD, 90).then(() => {
      isGateOpen = true;
    });
};

const gate_Close = () => {
  if (isGateOpen == true)
    writeCmd(PAR_ADDR_GATE_CMD, 0).then(() => {
      isGateOpen = false;
    });
};

const tpTriggerData = () => {
  getTpMode().then((mode) => {
    if (mode == "Manual") {
      //alarmResetTrigger().then(() => {
      clean1Trigger().then(() => {
        //    clean2Trigger().then(() => {
        //    clean3Trigger().then(() => {});
      });
      //   });
      // });
    }
    //  flow1Trigger().then(() => {});
  });
};

const ctrlDataChk = () => {
  frig_Coldctrl().then(() => {
    oven_Heatctrl().then(() => {
      chk_bowlCnt().then(() => {
        chk_batterVol().then(() => {
          chk_macTemp().then(() => {
            chk_Gate().then(() => {});
          });
        });
      });
    });
  });
};

function init() {
  logger.info(VERSION + " connect to broker OK");
  setInterval(tpTriggerData, 2000);
  //setInterval(ctrlDataChk, 500);
}

init();
