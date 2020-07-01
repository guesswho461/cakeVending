require("dotenv").config();

const version = "cakeVendingBackendGPIO v1.8";

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
    default: { appenders: ["file", "out"], level: "debug" },
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
const gateLimitPinIdx = 3; //GPIO 2, pin 3

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

const takeBowlDelay = 1000;
const getCoinDelay = 100;

let coinCnt = 0;
let coinEnable = false;
let coinValue = false;
let coinLastValue = true;
const coinValueDebounceLimit = 0;
let coinValueDebounceCnt = 0;

const gateLimitDebounceLimit = 50;
let gateLimitDebounceCnt = 0;
let gateLimitLastValue = false;
let gateIsOpen = false;
let gateIsStop = false;

logger.info(version + " started");

const openTheGate = () => {
  if (gateIsOpen === false) {
    gateMotor.enable().then(
      gateMotor.turn(gateOpen).then((steps) => {
        logger.trace(`gate turned ${steps} steps`);
        gateMotor.disable();
        gateIsOpen = true;
      })
    );
  }
};

const closeTheGate = () => {
  if (gateIsOpen === true) {
    gateMotor.enable().then(
      gateMotor.turn(gateClose).then((steps) => {
        logger.trace(`gate turned ${steps} steps`);
        gateMotor.disable();
        gateIsOpen = false;
      })
    );
    mqttClient.publish("latch/cmd/light/open", "false");
    logger.debug("latch/cmd/light/open false");
  }
};

const checkGateAndClose = () => {
  gpio.read(gateLimitPinIdx, function (err, value) {
    if (err) {
      logger.error(err);
    } else {
      if (value === true) {
        gateIsOpen = true;
        logger.info("gate is open, close the gate");
        closeTheGate();
      } else {
        gateIsOpen = false;
        logger.info("gate is close");
      }
    }
  });
};

gpio.on("change", function (channel, value) {
  logger.trace("pin " + channel + " is " + value);
  if (coinEnable) {
    if (channel === coinPinIdx) {
      if (value === coinLastValue) {
        if (coinValueDebounceCnt < coinValueDebounceLimit) {
          coinValueDebounceCnt = coinValueDebounceCnt + 1;
        } else {
          coinValueDebounceCnt = 0;
          if (value === true) {
            coinCnt = coinCnt + 1;
            logger.debug(coinCnt);
            mqttClient.publish("coin/status/inc", "1");
            if (coinCnt >= 5) {
              coinEnable = false;
              coinCnt = 0;
              mqttClient.publish("coin/cmd/enable", "false");
              logger.debug("coin disable");
            }
          }
        }
      } else {
        coinValueDebounceCnt = 0;
      }
      coinValueDebounceCnt = value;
    }
  }
  if (channel === gateLimitPinIdx) {
    // if (value === gateLimitLastValue) {
    //   if (gateLimitDebounceCnt < gateLimitDebounceLimit) {
    //     gateLimitDebounceCnt = gateLimitDebounceCnt + 1;
    //   } else {
    //     gateLimitDebounceCnt = 0;
    if (value === false) {
      if (gateIsStop === false) {
        gateMotor.stop();
        gateMotor.disable();
        gateIsStop = true;
        logger.debug("gate stoped");
      }
    } else {
      gateIsStop = false;
    }
    //   }
    // } else {
    //   gateLimitDebounceCnt = 0;
    // }
    gateLimitLastValue = value;
  }
});

gpio.setup(coinEnablePinIdx, gpio.DIR_OUT, function (err) {
  gpio.write(coinEnablePinIdx, false);
});
gpio.setup(kanbanEnablePinIdx, gpio.DIR_OUT, function (err) {
  gpio.write(kanbanEnablePinIdx, true);
});
gpio.setup(coinPinIdx, gpio.DIR_IN, gpio.EDGE_RISING);
gpio.setup(gateLimitPinIdx, gpio.DIR_IN, gpio.EDGE_RISING, checkGateAndClose);

const mqttClient = mqtt.connect("mqtt://localhost", mqttOpt);

mqttClient.on("message", function (topic, message) {
  if (topic === "coin/cmd/enable") {
    if (message.toString() === "true") {
      setTimeout(() => {
        coinEnable = true;
      }, getCoinDelay);
      gpio.write(coinEnablePinIdx, true);
      logger.debug("coin/cmd/enable true");
    } else {
      coinCnt = 0;
      coinEnable = false;
      gpio.write(coinEnablePinIdx, false);
      logger.debug("coin/cmd/enable false");
    }
  } else if (topic === "kanban/cmd/enable") {
    if (message.toString() === "true") {
      gpio.write(kanbanEnablePinIdx, true);
      logger.debug("kanban/cmd/enable true");
    } else {
      gpio.write(kanbanEnablePinIdx, false);
      logger.debug("kanban/cmd/enable false");
    }
  } else if (topic === "gate/cmd/open") {
    if (message.toString() === "true") {
      openTheGate();
      logger.debug("gate/cmd/open true");
    } else {
      closeTheGate();
      logger.debug("gate/cmd/open false");
    }
  } else if (topic === "gate/cmd/stop") {
    if (message.toString() === "true") {
      gateMotor.stop();
      gateMotor.disable();
      logger.debug("gate/cmd/stop true");
    }
  } else if (topic === "latch/status/bowl/ready") {
    if (message.toString() === "false") {
      logger.trace("latch/status/bowl/ready false");
      if (gateIsOpen === true) {
        setTimeout(() => {
          mqttClient.publish("gate/cmd/open", "false");
          logger.debug("gate/cmd/open false");
        }, takeBowlDelay);
      }
    }
  }
});

const mqttSubsTopis = [
  "coin/cmd/#",
  "kanban/cmd/#",
  "gate/cmd/#",
  "latch/status/bowl/ready",
];

mqttClient.on("connect", function () {
  logger.info("connect to broker OK");
  mqttSubsTopis.forEach(function (topic, index, array) {
    mqttClient.subscribe(topic);
  });
});
