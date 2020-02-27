const apiServerVersion = "v1.0";
const apiServerPort = 8081;
// const mqttBrokerIP = "ws://localhost:8080";
// const modbusServerIP = "192.168.1.1";
// const ftpServerIP = "192.168.1.1";
const mqttBrokerIP = "ws://192.168.56.101:8080";
const modbusServerIP = "192.168.56.101";
const ftpServerIP = "192.168.56.101";
const ftpUser = "lua";
const ftpPassword = "123456";
const ftpKeepaliveInterval = 5000; //ms
const modbusPollingInterval = 2000; //ms
const modbusId = 2;
const modbusPort = 502;
const modbusTimeout = 50000; //ms

const ROBOT_OP_MODE = 313;
const ROBOT_CYCLE_STATUS = 531;
const ROBOT_SERVO_STATUS = 8;
const ROBOT_GROUP_ALARM_STATUS = 480;
const ROBOT_JOINT_ALARM_STATUS = 320;
const ROBOT_IO_STATUS = 736;
const ROBOT_GROUP_ALARM_RESET = 384;
const ROBOT_JOINT_ALARM_RESET = 32;
const ROBOT_JOINT_SERVO_CMD = 0;
const ROBOT_SET_PROJECT = 544;
const ROBOT_CYCLE_CMD = 552;
const ROBOT_USER_DI = 762;
const ROBOT_USER_DO = 764;
const ROBOT_USER_DO_CMD = 766;
const ROBOT_JOG_DIR_CMD = 768;
const ROBOT_JOG_VEL_CMD = 804;
const ROBOT_JOG_CART_LEN_CMD = 800;
const ROBOT_JOG_JOINT_LEN_CMD = 802;
const ROBOT_JOG_COORD_CMD = 830;
const ROBOT_JOG_UF_COORD_IDX_CMD = 828;
const ROBOT_JOG_TF_COORD_IDX_CMD = 831;
const ROBOT_GLOBAL_POINT_BEGIN = 0xa000;
const ROBOT_GLOBAL_POINT_END = 0xffff;
const ROBOT_SINGLE_POINT_LEN = 48;

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mqtt = require("mqtt");
const mqttClient = mqtt.connect(mqttBrokerIP);
const ftp = require("ftp");
const ftpClient = new ftp();
const modbus = require("modbus-serial");
const modbusClient = new modbus();
const bitwise = require("bitwise");
const fs = require("fs");
const binFileOp = require("binary-file");

mqttClient.on("connect", function() {
  console.log("mqtt connected!");
});

ftpClient.on("ready", function() {
  console.log("ftp connected!");
});
ftpClient.connect({
  host: ftpServerIP,
  user: ftpUser,
  password: ftpPassword,
  keepalive: ftpKeepaliveInterval
});

// modbusClient.close();
modbusClient.setID(modbusId);
modbusClient.setTimeout(modbusTimeout);
modbusClient
  .connectTCP(modbusServerIP, { port: modbusPort })
  .then(function() {
    console.log("modbus connected!");
    modbusPolling();
  })
  .catch(function(e) {
    console.log(e);
  });

const coordEnum = ["WCS", "PCS", "TCS", "ACS"];
const inchJogCmdList = [
  {
    dir: "J1+",
    value: 25
  },
  {
    dir: "J1-",
    value: 26
  },
  {
    dir: "J2+",
    value: 27
  },
  {
    dir: "J2-",
    value: 28
  },
  {
    dir: "J3+",
    value: 29
  },
  {
    dir: "J3-",
    value: 30
  },
  {
    dir: "J4+",
    value: 31
  },
  {
    dir: "J4-",
    value: 32
  },
  {
    dir: "J5+",
    value: 1
  },
  {
    dir: "J5-",
    value: 2
  },
  {
    dir: "J6+",
    value: 3
  },
  {
    dir: "J6-",
    value: 4
  },
  {
    dir: "X+",
    value: 201
  },
  {
    dir: "X-",
    value: 202
  },
  {
    dir: "Y+",
    value: 203
  },
  {
    dir: "Y-",
    value: 204
  },
  {
    dir: "Z+",
    value: 205
  },
  {
    dir: "Z-",
    value: 206
  },
  {
    dir: "RX+",
    value: 207
  },
  {
    dir: "RX-",
    value: 208
  },
  {
    dir: "RY+",
    value: 209
  },
  {
    dir: "RY-",
    value: 210
  },
  {
    dir: "RZ+",
    value: 211
  },
  {
    dir: "RZ-",
    value: 212
  }
];

let selectedProject = "";

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/version", (req, res) => {
  res.send(apiServerVersion);
});

app.post("/jog/move", (req, res) => {
  const lenDigit = parseInt(req.body.len, 10);
  const velDigit = parseInt(req.body.vel, 10);
  const coordIdxDigit = parseInt(req.body.ptCoordIdx, 10);
  if (req.body.coord === "PCS") {
    modbusClient.writeRegisters(ROBOT_JOG_COORD_CMD, [1]);
    modbusClient.writeRegisters(ROBOT_JOG_UF_COORD_IDX_CMD, [coordIdxDigit]);
    if (lenDigit > 0) {
      modbusClient.writeRegisters(ROBOT_JOG_CART_LEN_CMD, [lenDigit]);
    }
  } else if (req.body.coord === "TCS") {
    modbusClient
      .writeRegisters(ROBOT_JOG_COORD_CMD, [2])
      .modbusClient.writeRegisters(ROBOT_JOG_TF_COORD_IDX_CMD, [coordIdxDigit]);
    if (lenDigit > 0) {
      modbusClient.writeRegisters(ROBOT_JOG_CART_LEN_CMD, [lenDigit]);
    }
  } else if (req.body.coord === "WCS") {
    modbusClient.writeRegisters(ROBOT_JOG_COORD_CMD, [0]);
    if (lenDigit > 0) {
      modbusClient.writeRegisters(ROBOT_JOG_CART_LEN_CMD, [lenDigit]);
    }
  } else if (req.body.coord === "ACS") {
    modbusClient.writeRegisters(ROBOT_JOG_COORD_CMD, [3]);
    if (lenDigit > 0) {
      modbusClient.writeRegisters(ROBOT_JOG_JOINT_LEN_CMD, [lenDigit]);
    }
  } else {
    // do nothing
  }
  modbusClient.writeRegisters(ROBOT_JOG_VEL_CMD, [velDigit]);
  const jogCmd = inchJogCmdList.find(function(item, index, array) {
    return item.dir === req.body.dir;
  });
  let jogCmdValue = jogCmd.value;
  if (lenDigit <= 0) {
    jogCmdValue = jogCmdValue + 400;
  }
  modbusClient.writeRegisters(ROBOT_JOG_DIR_CMD, [jogCmdValue]);
  res.send("OK");
});

app.post("/jog/stop", (req, res) => {
  modbusClient.writeRegisters(ROBOT_JOG_DIR_CMD, [0]);
  res.send("OK");
});

app.post("/project/set", (req, res) => {
  selectedProject = req.body.name;
  const projectIdx = selectedProject.split("_");
  const idx = parseInt(projectIdx[0], 10);
  modbusClient.writeRegisters(ROBOT_SET_PROJECT, [idx]);
  mqttClient.publish("robot/status/project", selectedProject);
  res.send("OK");
});

app.post("/project/list/get", (req, res) => {
  ftpClient.list("/lua", function(err, list) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      let projectList = [];
      list.forEach(function(item, index, array) {
        if (item.type === "d") projectList.push(item.name);
      });
      res.send(projectList);
    }
  });
});

app.post("/alarm/reset", (req, res) => {
  modbusClient.writeRegisters(ROBOT_JOINT_ALARM_RESET, [
    0xffff,
    0xffff,
    0xffff,
    0xffff,
    0xffff,
    0xffff,
    0xffff,
    0xffff
  ]);
  modbusClient.writeRegisters(ROBOT_GROUP_ALARM_RESET, [0xffff]);
  res.send("OK");
});

app.post("/io/set", (req, res) => {
  modbusClient.readHoldingRegisters(ROBOT_USER_DO, 2).then(function(data) {
    const idx = parseInt(req.body.idx, 10);
    let value = data.data[0];
    if (req.body.value === "on") {
      value = bitwise.integer.setBit(data.data[0], idx, 1);
    } else {
      value = bitwise.integer.setBit(data.data[0], idx, 0);
    }
    modbusClient.writeRegisters(ROBOT_USER_DO_CMD, [value]);
  });
  res.send("OK");
});

app.post("/point/set", (req, res) => {
  res.send("OK");
});

const getBitRangeValue = (totalBitCnt, value, from, to) => {
  const waste = totalBitCnt - 1 - to;
  return (value << waste) >> (waste + from);
};

const strToUTF8Array = str => {
  let utf8 = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(
        0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
    // surrogate pair
    else {
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode =
        0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }
  return utf8;
};

const isGreaterThanZero = value => {
  return value > 0;
};

const parseToPointList = async binFile => {
  let pointList = [
    {
      name: "error",
      coord: "error"
    }
  ];
  const lptBinFile = new binFileOp(binFile, "r");
  try {
    await lptBinFile.open();
    pointList.length = 0;
    const byteLen = await lptBinFile.size();
    for (i = 0; i < byteLen; i += ROBOT_SINGLE_POINT_LEN) {
      const ptNameFullStr = await lptBinFile.readString(16, i + 0);
      const ptNameFullArr = strToUTF8Array(ptNameFullStr);
      const ptNameArr = ptNameFullArr.filter(isGreaterThanZero);
      const ptName = ptNameArr.map(b => String.fromCharCode(b)).join("");
      const ptX = await lptBinFile.readUInt32(i + 16 + 4 * 0);
      const ptY = await lptBinFile.readUInt32(i + 16 + 4 * 1);
      const ptZ = await lptBinFile.readUInt32(i + 16 + 4 * 2);
      const ptRX = await lptBinFile.readUInt32(i + 16 + 4 * 3);
      const ptRY = await lptBinFile.readUInt32(i + 16 + 4 * 4);
      const ptRZ = await lptBinFile.readUInt32(i + 16 + 4 * 5);
      const ptJRC = await lptBinFile.readUInt32(i + 16 + 4 * 6);
      const ptJRCJ1 = getBitRangeValue(32, ptJRC, 0, 3).toString();
      const ptJRCJ2 = getBitRangeValue(32, ptJRC, 4, 7).toString();
      const ptJRCJ3 = getBitRangeValue(32, ptJRC, 8, 11).toString();
      const ptJRCJ4 = getBitRangeValue(32, ptJRC, 12, 15).toString();
      const ptJRCJ5 = getBitRangeValue(32, ptJRC, 16, 19).toString();
      const ptJRCJ6 = getBitRangeValue(32, ptJRC, 20, 23).toString();
      const ptDetail = await lptBinFile.readUInt16(i + 16 + 4 * 7 + 2);
      const ptUFIdx = getBitRangeValue(16, ptDetail, 4, 7).toString();
      const ptTFIdx = getBitRangeValue(16, ptDetail, 8, 11).toString();
      const ptCoordIdx = getBitRangeValue(16, ptDetail, 13, 14).toString();
      const ptShoulder = bitwise.integer.getBit(ptDetail, 0) ? "right" : "left";
      const ptElbow = bitwise.integer.getBit(ptDetail, 1) ? "up" : "down";
      const ptWrist = bitwise.integer.getBit(ptDetail, 2) ? "right" : "left";
      const pt = {
        name: ptName,
        coord: coordEnum[ptCoordIdx],
        X: ptX / 1000,
        Y: ptY / 1000,
        Z: ptZ / 1000,
        RX: ptRX / 1000,
        RY: ptRY / 1000,
        RZ: ptRZ / 1000,
        UF: ptUFIdx,
        TF: ptTFIdx,
        shoulder: ptShoulder,
        elbow: ptElbow,
        wrist: ptWrist,
        jrc1: ptJRCJ1,
        jrc2: ptJRCJ2,
        jrc3: ptJRCJ3,
        jrc4: ptJRCJ4,
        jrc5: ptJRCJ5,
        jrc6: ptJRCJ6
      };
      pointList.push(pt);
    }
    await lptBinFile.close();
  } catch (err) {
    console.log(err);
  }
  return pointList;
};

const getGlobalPoint = async () => {
  let pointList = [
    {
      name: "error",
      coord: "error"
    }
  ];
  let file = fs.createWriteStream("PT.bin");
  for (
    i = ROBOT_GLOBAL_POINT_BEGIN;
    i < ROBOT_GLOBAL_POINT_END + 1;
    i += ROBOT_SINGLE_POINT_LEN
  ) {
    await modbusClient
      .readHoldingRegisters(i, ROBOT_SINGLE_POINT_LEN)
      .then(function(data) {
        file.write(data.buffer);
      })
      .catch(function(e) {
        console.log(e);
      });
  }
  file.end();
  mqttClient.publish("robot/status/progress", "50");
  pointList = await parseToPointList("PT.bin");
  mqttClient.publish("robot/status/progress", "100");
  return pointList;
};

app.post("/point/list/get", (req, res) => {
  if (req.body.type === "global") {
    (async function() {
      const globalPointList = await getGlobalPoint();
      res.send(globalPointList);
    })();
  } else {
    if (selectedProject) {
      const filePath = "/lua/" + selectedProject + "/LPT.bin";
      ftpClient.get(filePath, function(err, stream) {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        } else {
          (async function() {
            stream.pipe(fs.createWriteStream("LPT.bin"));
            const pointList = await parseToPointList("LPT.bin");
            res.send(pointList);
          })();
        }
      });
    } else {
      res.status(404).send("project not found");
    }
  }
});

app.post("/cycle/start", (req, res) => {
  modbusClient.writeRegisters(ROBOT_CYCLE_CMD, [0x0006]);
  res.send("OK");
});

app.post("/cycle/stop", (req, res) => {
  modbusClient.writeRegisters(ROBOT_CYCLE_CMD, [0x0003]);
  res.send("OK");
});

app.post("/servo", (req, res) => {
  if (req.body.cmd === "on") {
    modbusClient.writeRegisters(ROBOT_JOINT_SERVO_CMD, [
      0xffff,
      0xffff,
      0xffff,
      0xffff,
      0xffff,
      0xffff,
      0xffff,
      0xffff
    ]);
  } else {
    modbusClient.writeRegisters(ROBOT_JOINT_SERVO_CMD, [
      0x0000,
      0x0000,
      0x0000,
      0x0000,
      0x0000,
      0x0000,
      0x0000,
      0x0000
    ]);
  }
  res.send("OK");
});

app.listen(apiServerPort, () => {
  console.log("api server listing on port " + apiServerPort);
});

const robotOpModePollingFn = u08Data => {
  if (u08Data.data[0] === 1) {
    mqttClient.publish("robot/status/mode", "T1");
  } else if (u08Data.data[0] === 2) {
    mqttClient.publish("robot/status/mode", "T2");
  } else if (u08Data.data[0] === 3) {
    mqttClient.publish("robot/status/mode", "AUTO");
  } else {
    mqttClient.publish("robot/status/mode", "NA");
  }
};

const robotCycleStatusPollingFn = u08Data => {
  if (u08Data.data[0] === 0) {
    mqttClient.publish("robot/status/cycle", "stop");
  } else {
    mqttClient.publish("robot/status/cycle", "start");
  }
};

const robotServoStatusPollingFn = u08Data => {
  if (u08Data.data[0] === 257 && u08Data.data[1] === 257) {
    mqttClient.publish("robot/status/servo", "on");
  } else {
    mqttClient.publish("robot/status/servo", "off");
  }
};

const robotGroupAlarmStatusPollingFn = u08Data => {
  let alarmStr = "NORMAL";
  const alarmGroup = u08Data.data[0];
  if (alarmGroup !== 0) {
    alarmStr = "E1." + alarmGroup.toString(16);
  }
  mqttClient.publish("robot/status/alarm", alarmStr);
};

const robotJointAlarmStatusPollingFn = u08Data => {
  let alarmStr = "NORMAL";
  const alarmJ1 = u08Data.data[12];
  const alarmJ2 = u08Data.data[13];
  const alarmJ3 = u08Data.data[14];
  const alarmJ4 = u08Data.data[15];
  const alarmJ5 = u08Data.data[0];
  const alarmJ6 = u08Data.data[1];
  if (alarmJ1 !== 0) {
    alarmStr = "ED" + alarmJ1.toString(16);
  } else if (alarmJ2 !== 0) {
    alarmStr = "EE" + alarmJ2.toString(16);
  } else if (alarmJ3 !== 0) {
    alarmStr = "EF" + alarmJ3.toString(16);
  } else if (alarmJ4 !== 0) {
    alarmStr = "EG" + alarmJ4.toString(16);
  } else if (alarmJ5 !== 0) {
    alarmStr = "E1" + alarmJ5.toString(16);
  } else if (alarmJ6 !== 0) {
    alarmStr = "E2" + alarmJ6.toString(16);
  } else {
    //do nothing
  }
  mqttClient.publish("robot/status/alarm", alarmStr);
};

const parseToIOString = u08Data => {
  const dioString =
    u08Data.data[0].toString(10) +
    "," +
    u08Data.data[1].toString(10) +
    "," +
    u08Data.data[2].toString(10) +
    "," +
    u08Data.data[3].toString(10);
  return dioString;
};

const robotUserDIOStatusPollingFn = u08Data => {
  mqttClient.publish("robot/status/io", parseToIOString(u08Data));
};

const robotKeepingLivingPollingFn = u08Data => {};

const modbusPollingList = [
  // {
  //   address: ROBOT_OP_MODE,
  //   len: 1,
  //   fn: robotOpModePollingFn
  // },
  // {
  //   address: ROBOT_CYCLE_STATUS,
  //   len: 1,
  //   fn: robotCycleStatusPollingFn
  // },
  // {
  //   address: ROBOT_GROUP_ALARM_STATUS,
  //   len: 1,
  //   fn: robotGroupAlarmStatusPollingFn
  // },
  // {
  //   address: ROBOT_JOINT_ALARM_STATUS,
  //   len: 16,
  //   fn: robotJointAlarmStatusPollingFn
  // },
  // {
  //   address: ROBOT_USER_DI,
  //   len: 4,
  //   fn: robotUserDIOStatusPollingFn
  // },
  // {
  //   address: ROBOT_SERVO_STATUS,
  //   len: 5,
  //   fn: robotServoStatusPollingFn
  // },
  {
    address: ROBOT_OP_MODE,
    len: 1,
    fn: robotKeepingLivingPollingFn
  }
];

const modbusPolling = () => {
  modbusPollingList.map(
    async (item, index) =>
      await modbusClient
        .readHoldingRegisters(item.address, item.len)
        .then(function(data) {
          item.fn(data);
        })
        .catch(function(e) {
          console.log(e);
        })
  );
  setTimeout(modbusPolling, modbusPollingInterval);
};
