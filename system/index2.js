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

const gateMotor = new A4988({
  step: 24, //GPIO 24, pin 18
  dir: 25, //GPIO 25, pin 22
  ms1: 15, //GPIO 15, pin 10
  ms2: 18, //GPIO 18, pin 12
  ms3: 23, //GPIO 23, pin 16
  enable: 14 //GPIO 14, pin 8
});
gateMotor.step_size = "sixteenth";

const gateOpen = 1000;
const gateClose = -1000;

let coinCnt = 0;
let coinEnable = false;

console.log(opt.clientId + " started");

gpio.on("change", function(channel, value) {
  // console.log("pin " + channel + " is " + value);
  if (coinEnable) {
    if (channel === coinPinIdx && value === true) {
      coinCnt = coinCnt + 1;
      console.log(coinCnt);
      client.publish("coin/status/inc", "1")