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

const ModbusRTU = require("modbus-serial");

var client = new ModbusRTU();
client.setTimeout(500);
client.setID(1);

//argv.device;
client.connectRTUBuffered("COM9", {
  baudRate: 115200,
  parity: "none",
  stopBits: 1,
  dataBits: 8,
});

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
const PAR_ADDR_CUP_CNT = 0x0010;
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
  "/bowlSuck",

  (req, res) => {
    //en = req.body;
    en = true;
    writeCmd(PAR_ADDR_VACUUM_CMD, en);
    res.sendStatus(200);
  }
);

app.post(
  "/bowlRelease",

  (req, res) => {
    //en = req.body;
    en = true;
    writeCmd(PAR_ADDR_DEPRESSURELIZE_CMD, en);
    res.sendStatus(200);
  }
);

app.post(
  "/gateOpen",

  (req, res) => {
    //en = req.body;
    en = true;
    writeCmd(PAR_ADDR_GATE_CMD, en);
    res.sendStatus(200);
  }
);

app.post(
  "/bowlLED",

  (req, res) => {
    //en = req.body;
    en = true;
    writeCmd(PAR_ADDR_LED_1_CMD, en);
    res.sendStatus(200);
  }
);

app.post(
  "/robotBrake",

  (req, res) => {
    //en = req.body;
    en = true;
    writeCmd(PAR_ADDR_BRAKE_CMD, en);
    res.sendStatus(200);
  }
);

app.post(
  "/ovenHeat",

  (req, res) => {
    //en = req.body;
    en = true;
    writeCmd(PAR_ADDR_OVEN_CMD, en);
    res.sendStatus(200);
  }
);

app.post(
  "/refrigCold",

  (req, res) => {
    //en = req.body;
    en = true;
    writeCmd(PAR_ADDR_FRIG_CMD, en);
    res.sendStatus(200);
  }
);

app.post(
  "/coin10Enable",

  (req, res) => {
    //en = req.body;
    en = true;
    writeCmd(PAR_ADDR_COIN_1_CMD, en);
    res.sendStatus(200);
  }
);

app.post(
  "/coin5Enable",

  (req, res) => {
    //en = req.body;
    en = true;
    writeCmd(PAR_ADDR_COIN_2_CMD, en);
    res.sendStatus(200);
  }
);

app.post(
  "/doorLED",

  (req, res) => {
    //en = req.body;
    en = true;
    writeCmd(PAR_ADDR_LED_2_CMD, en);
    res.sendStatus(200);
  }
);

app.get(
  "/bowlReady",

  (req, res) => {
    readStatus(PAR_ADDR_BOWL_READY)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/bowlCnt",

  (req, res) => {
    readStatus(PAR_ADDR_CUP_CNT)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/flow1Count",

  (req, res) => {
    readStatus(PAR_ADDR_FLOW_1_CNT)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/refrigTemp",

  (req, res) => {
    readStatus(PAR_ADDR_FRIG_TEMP)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/bucketVol",

  (req, res) => {
    readStatus(PAR_ADDR_BATTER_CNT)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/ovenTemp",

  (req, res) => {
    readStatus(PAR_ADDR_OVEN_TEMP)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/machTemp",

  (req, res) => {
    readStatus(PAR_ADDR_MACH_TEMP)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/coin10Inc",

  (req, res) => {
    readStatus(PAR_ADDR_COIN_1_CNT)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/coin5Inc",

  (req, res) => {
    readStatus(PAR_ADDR_COIN_2_CNT)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/tpMode",

  (req, res) => {
    readStatus(PAR_ADDR_TP_MODE)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/jogDir",

  (req, res) => {
    readStatus(PAR_ADDR_TP_JOG_DIR)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/jogTarget",

  (req, res) => {
    readStatus(PAR_ADDR_TP_JOG_TARGET)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/jogSpd",

  (req, res) => {
    readStatus(PAR_ADDR_TP_JOG_SPD)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/clean1",

  (req, res) => {
    readStatus(PAR_ADDR_CLEAN_1)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/clean2",

  (req, res) => {
    readStatus(PAR_ADDR_CLEAN_2)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/clean3",

  (req, res) => {
    readStatus(PAR_ADDR_CLEAN_3)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/alarmReset",

  (req, res) => {
    readStatus(PAR_ADDR_ALARM_RESET)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

const writeCmd = (address, en) => {
  return new Promise((resolve, reject) => {
    client
      .writeCoil(address, en)
      .then(function (d) {
        return resolve("OK");
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const readStatus = (address) => {
  return new Promise((resolve, reject) => {
    client
      .readHoldingRegisters(address, 1)
      .then(function (d) {
        console.log(d.data);
        return resolve(d.data);
      })
      .catch(function (err) {
        console.log(err.message);
        return reject(err.message);
      });
  });
};
