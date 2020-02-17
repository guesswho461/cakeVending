const mqtt = require("mqtt");
const gpio = require("rpi-gpio");
const A4988 = require("./A4988");

const opt = {
  port: 1883,
  clientId: "cakeVendingSys"
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
  enable: 14 //GPIO 14, pin 8
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

console.log(opt.clientId + " started");

gpio.on("change", function(channel, value) {
  // console.log("pin " + channel + " is " + value);
  //if (coinEnable) {
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
        console.log(coinCnt);
        client.publish("coin/status/inc", "1");
        if (coinCnt >= 5) {
          coinEnable = false;
          coinCnt = 0;
          gpio.write(coinEnablePinIdx, false);
          console.log("coin disable");
        }
      }
      coinLastValue = coinValue;
    }
  //}
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
      console.log("gate stoped");
    }
    gateLimitLastValue = gateLimitValue;
  }
});

const client = mqtt.connect("mqtt://localhost", opt);

client.on("connect", function() {
  console.log("connect to broker OK");
  client.subscribe("coin/cmd/#");
  client.subscribe("kanban/cmd/#");
  client.subscribe("gate/cmd/#");
  gateMotor.turn(gateClose);
});

client.on("message", function(topic, message) {
  if (topic === "coin/cmd/enable") {
    if (message.toString() === "true") {
      coinEnable = true;
      gpio.write(coinEnablePinIdx, true);
      console.log("coin/cmd/enable true");
    }
  } else if (topic === "kanban/cmd/enable") {
    if (message.toString() === "true") {
      gpio.write(kanbanEnablePinIdx, true);
      console.log("kanban/cmd/enable true");
    } else {
      gpio.write(kanbanEnablePinIdx, false);
      console.log("kanban/cmd/enable false");
    }
  } else if (topic === "gate/cmd/open") {
    if (message.toString() === "true") {
      gateMotor.enable().then(
        gateMotor.turn(gateOpen).then(steps => {
          console.log(`gate turned ${steps} steps`);
          gateMotor.disable();
        })
      );
      console.log("gate/cmd/open true");
    } else {
      gateMotor.enable().then(
        gateMotor.turn(gateClose).then(steps => {
          console.log(`gate turned ${steps} steps`);
          gateMotor.disable();
        })
      );
      console.log("gate/cmd/open false");
    }
  } else if (topic === "gate/cmd/stop") {
    if (message.toString() === "true") {
      gateMotor.stop();
      gateMotor.disable();
      console.log("gate/cmd/stop true");
    }
  }
});

gpio.setup(coinEnablePinIdx, gpio.DIR_OUT, function(err) {
  gpio.write(coinEnablePinIdx, false);
});
gpio.setup(kanbanEnablePinIdx, gpio.DIR_OUT, function(err) {
  gpio.write(kanbanEnablePinIdx, false);
});
gpio.setup(coinPinIdx, gpio.DIR_IN, gpio.EDGE_RISING);
gpio.setup(gateLimitPinIdx, gpio.DIR_IN, gpio.EDGE_RISING);
