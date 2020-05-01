require("dotenv").config();

const version = "cakeVendingBackendGPIO v1.0";

const log4js = require("log4js");
log4js.configure({
  appenders: {
    file: {
      type: "dateFile",
      filename: "log/cakeBackendGPIO.log",
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

const mqtt = require("mqtt");
const gpio = require("rpi-gpio");
const A4988 = require("./A4988");

//todo: idle的時候每五分鐘回抽

const mqttOpt = {
  port: process.env.MACHINE_LOCAL_MQTT_BROKER_PORT,
  clientId: version,
};

const coinPinIdx = 7; //GPIO 4, pin 7
const coinEnablePinIdx = 11; //GPIO 17, pin 11
const kanbanEnablePinIdx = 13; //GPIO 27, pin 13
const gateLimitPinIdx = 15; //GPIO 22, pin 15

const gateMotor = new A4988({
  step: 24, //GPIO 24, pin 18
  dir: 25, //GPIO 25, pin 22
  ms1: 15, //GPIO 15, pin 10
  ms2: 18, //GPIO 18, pin 12
  ms3: 23, //GPIO 23, pin 16
  enable: 14, //GPIO 14, pin 8
});
gateMotor.step_size = "sixteenth";

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

const mqttClient = mqtt.connect("mqtt://localhost", mqttOpt);

logger.info(version + " started");

mqttClient.on("message", function (topic, message) {
  if (topic === "coin/cmd/enable") {
    if (message.toString() === "true") {
      coinEnable = true;
      gpio.write(coinEnablePinIdx, true);
      logger.trace("coin/cmd/enable true");
    } else {
      coinCnt = 0;
      coinEnable = false;
      gpio.write(coinEnablePinIdx, false);
      logger.trace("coin/cmd/enable false");
    }
  } else if (topic === "kanban/cmd/enable") {
    if (message.toString() === "true") {
      gpio.write(kanbanEnablePinIdx, true);
      logger.trace("kanban/cmd/enable true");
    } else {
      gpio.write(kanbanEnablePinIdx, false);
      logger.trace("kanban/cmd/enable false");
    }
  } else if (topic === "gate/cmd/open") {
    if (message.toString() === "true") {
      gateMotor.enable().then(
        gateMotor.turn(gateOpen).then((steps) => {
          logger.trace(`gate turned ${steps} steps`);
          gateMotor.disable();
        })
      );
      logger.trace("gate/cmd/open true");
    } else {
      gateMotor.enable().then(
        gateMotor.turn(gateClose).then((steps) => {
          logger.trace(`gate turned ${steps} steps`);
          gateMotor.disable();
        })
      );
      logger.trace("gate/cmd/open false");
    }
  } else if (topic === "gate/cmd/stop") {
    if (message.toString() === "true") {
      gateMotor.stop();
      gateMotor.disable();
      logger.trace("gate/cmd/stop true");
    }
  }
});

const mqttSubsTopis = ["coin/cmd/#", "kanban/cmd/#", "gate/cmd/#"];

mqttClient.on("connect", function () {
  gateMotor.turn(gateClose);
  logger.info("connect to broker OK");
  mqttSubsTopis.forEach(function (topic, index, array) {
    mqttClient.subscribe(topic);
  });
});

gpio.on("change", function (channel, value) {
  logger.trace("pin " + channel + " is " + value);
  if (coinEnable) {
    if (channel === coinPinIdx) {
      if (value === true) {
        if (coinValueDebounceCnt < coinValueDebounceLimit) {
          coinValueDebounceCnt = coinValueDebounceCnt + 1;
        } else {
          coinValue = true;
          coinValueDebounceCnt = 0;
        }
      } else {
        coinValue = false;
        coinValueDebounceCnt = 0;
      }
      //if (coinValue === true && coinLastValue === false) {
      if (value === true) {
        coinCnt = coinCnt + 1;
        logger.trace(coinCnt);
        mqttClient.publish("coin/status/inc", "1");
        if (coinCnt >= 5) {
          coinEnable = false;
          coinCnt = 0;
          gpio.write(coinEnablePinIdx, false);
          logger.trace("coin disable");
        }
      }
      coinLastValue = coinValue;
    }
  }
  if (channel === gateLimitPinIdx) {
    if (value === true) {
      if (gateLimitDebounceCnt < gateLimitDebounceLimit) {
        gateLimitDebounceCnt = gateLimitDebounceCnt + 1;
      } else {
        gateLimitValue = true;
        gateLimitDebounceCnt = 0;
      }
    } else {
      gateLimitValue = false;
      gateLimitDebounceCnt = 0;
    }
    if (gateLimitValue === true && gateLimitLastValue === false) {
      gateMotor.stop();
      logger.trace("gate stoped");
    }
    gateLimitLastValue = gateLimitValue;
  }
});

gpio.setup(coinEnablePinIdx, gpio.DIR_OUT, function (err) {
  gpio.write(coinEnablePinIdx, false);
});
gpio.setup(kanbanEnablePinIdx, gpio.DIR_OUT, function (err) {
  gpio.write(kanbanEnablePinIdx, false);
});
gpio.setup(coinPinIdx, gpio.DIR_IN, gpio.EDGE_RISING);
gpio.setup(gateLimitPinIdx, gpio.DIR_IN, gpio.EDGE_RISING);
