require("dotenv").config({ path: "../frontend/.env" });

const version = "cakeVendingBackendGPIO v1.23";

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
const axios = require("axios");
const Gpio = require("pigpio").Gpio;

//todo: idle的時候每五分鐘回抽

const mqttOpt = {
  port: process.env.MACHINE_LOCAL_MQTT_BROKER_PORT,
  clientId: version,
};

const coinPinIdx = 7; //GPIO 4, pin 7
const coinPinIdx2 = 4; //GPIO 4, pin 7
const coinEnablePinIdx = 11; //GPIO 17, pin 11
const kanbanEnablePinIdx = 13; //GPIO 27, pin 13
const gateLimitPinIdx = 3; //GPIO 2, pin 3
const alarmResetPinIdx = 22; //GPIO 22, pin 15

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

let endtime = 0;
let startime = 0;
let sTime = 0;
let coinTrig = false;

const gateLimitDebounceLimit = 50;
let gateLimitDebounceCnt = 0;
let gateLimitLastValue = false;
let gateIsOpen = false;
let gateIsStop = false;

const alarmResetBtnPressDownDurationThreshold =
  process.env.ALARM_RESET_BTN_PRESS_DURATION * 1000 * 1000; //sec to us
let lastAlarmResetBtnPressDownTick = 0;
const alarmResetPin = new Gpio(alarmResetPinIdx, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_UP,
  alert: true,
});
const alarmDebounceTime = process.env.ALARM_RESET_DEBOUNCE_TIME * 1000; //ms to us
alarmResetPin.glitchFilter(alarmDebounceTime);

const coinPin = new Gpio(coinPinIdx2, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_UP,
  alert: true,
});
const coinDebounceTime = process.env.COIN_DEBOUNCE_TIME * 1000; //ms to us
coinPin.glitchFilter(coinDebounceTime);

logger.info(version + " started");

const postWebAPI = (url, payload) => {
  axios({
    method: "post",
    baseURL: "http://localhost" + ":" + process.env.MACHINE_BACKEND_PORT + url,
    headers: {
      Authorization: "Bearer " + process.env.CAKE_ACCESS_TOKEN,
      "content-type": "text/plain",
    },
    data: payload,
  })
    .then((res) => {
      logger.debug("POST " + url + " " + payload + " " + res.status);
    })
    .catch((err) => {
      logger.error(err.message);
    });
  logger.debug("POST " + url + " " + payload);
};

alarmResetPin.on("alert", (level, tick) => {
  logger.trace("alarmResetPin alert level: " + level + ", tick: " + tick);
  if (level === 0) {
    // btn down
    lastAlarmResetBtnPressDownTick = tick;
  } else {
    // btn up
    const diff = tick - lastAlarmResetBtnPressDownTick;
    if (diff >= alarmResetBtnPressDownDurationThreshold) {
      logger.trace(
        "alarm press duration: " +
          tick +
          ", " +
          lastAlarmResetBtnPressDownTick +
          ", " +
          diff
      );
      logger.info("alarm reset");
      postWebAPI("/machine/enable", "alarm reset");
    }
  }
});

coinPin.on("alert", (level, tick) => {
  if (level === 0) {
    mqttClient.publish("coin/status/inc", "1");
    coinCnt = coinCnt + 1;
    logger.info(coinCnt);
    if (coinCnt >= 5) {
      coinEnable = false;
      coinCnt = 0;
      mqttClient.publish("coin/cmd/enable", "false");
      logger.trace("coin disable");
    }
  }
});

const openTheGate = () => {
  if (gateIsOpen === false) {
    if (gateMotor.enabled === false) {
      gateMotor.enable();
    }
    // gateMotor.enable().then(
    gateMotor.turn(gateOpen).then((steps) => {
      logger.trace(`gate turned ${steps} steps`);
      // gateMotor.disable();
      gateIsOpen = true;
    });
    // );
  }
};

const closeTheGate = () => {
  if (gateIsOpen === true) {
    if (gateMotor.enabled === false) {
      gateMotor.enable();
    }
    // gateMotor.enable().then(
    gateMotor.turn(gateClose).then((steps) => {
      logger.trace(`gate turned ${steps} steps`);
      // gateMotor.disable();
      gateIsOpen = false;
    });
    // );
    mqttClient.publish("latch/cmd/light/open", "false");
    logger.info("latch/cmd/light/open false");
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
  // if (coinEnable) {
  //   if (channel === coinPinIdx) {
  //     if (value === true) {
  //       logger.trace("coinTrue");
  //       endtime = new Date().getTime();
  //       logger.trace(endtime - sTime);
  //       if (endtime - sTime >= 25) {
  //         sTime = new Date().getTime();
  //         coinCnt = coinCnt + 1;
  //         logger.info(coinCnt);
  //         mqttClient.publish("coin/status/inc", "1");
  //         if (coinCnt >= 5) {
  //           coinEnable = false;
  //           coinCnt = 0;
  //           mqttClient.publish("coin/cmd/enable", "false");
  //           logger.trace("coin disable");
  //         }
  //       }
  //       coinTrig = false;
  //     } else {
  //       //if (coinTrig === false)
  //       //sTime = new Date().getTime();
  //       coinTrig = true;
  //       logger.trace("coinFalse");
  //     }
  //   }
  // }
  if (channel === gateLimitPinIdx) {
    if (value === false) {
      if (gateIsStop === false) {
        gateMotor.stop();
        // gateMotor.disable();
        gateIsStop = true;
        logger.trace("gate stoped");
      }
    } else {
      gateIsStop = false;
    }
    gateLimitLastValue = value;
  }
});

gpio.setup(coinEnablePinIdx, gpio.DIR_OUT, function (err) {
  gpio.write(coinEnablePinIdx, false);
});
gpio.setup(kanbanEnablePinIdx, gpio.DIR_OUT, function (err) {
  gpio.write(kanbanEnablePinIdx, true);
});
// gpio.setup(coinPinIdx, gpio.DIR_IN, gpio.EDGE_RISING);
gpio.setup(gateLimitPinIdx, gpio.DIR_IN, gpio.EDGE_RISING, checkGateAndClose);
// gpio.setup(alarmResetPinIdx, gpio.DIR_IN, gpio.EDGE_RISING);

const mqttClient = mqtt.connect("mqtt://localhost", mqttOpt);

mqttClient.on("message", function (topic, message) {
  if (topic === "coin/cmd/enable") {
    if (message.toString() === "true") {
      setTimeout(() => {
        coinEnable = true;
      }, getCoinDelay);
      gpio.write(coinEnablePinIdx, true);
      logger.info("coin/cmd/enable true");
    } else {
      coinCnt = 0;
      coinEnable = false;
      gpio.write(coinEnablePinIdx, false);
      logger.info("coin/cmd/enable false");
    }
  } else if (topic === "kanban/cmd/enable") {
    if (message.toString() === "true") {
      gpio.write(kanbanEnablePinIdx, true);
      logger.info("kanban/cmd/enable true");
    } else {
      gpio.write(kanbanEnablePinIdx, false);
      logger.info("kanban/cmd/enable false");
    }
  } else if (topic === "gate/cmd/open") {
    if (message.toString() === "true") {
      openTheGate();
      logger.info("gate/cmd/open true");
    } else {
      closeTheGate();
      logger.info("gate/cmd/open false");
    }
  } else if (topic === "gate/cmd/stop") {
    if (message.toString() === "true") {
      gateMotor.stop();
      // gateMotor.disable();
      logger.info("gate/cmd/stop true");
    }
  } else if (topic === "latch/status/bowl/ready") {
    if (message.toString() === "false") {
      if (gateIsOpen === true) {
        setTimeout(() => {
          mqttClient.publish("gate/cmd/open", "false");
          logger.info(
            "gate/cmd/open false by latch/status/bowl/ready is false"
          );
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
