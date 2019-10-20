const mqtt = require('mqtt');
const gpio = require('rpi-gpio');

const opt = {
  port: 1883,
  clientId: 'coin'
};

const coinPinIdx = 7;

console.log(opt.clientId + ' started');

const client = mqtt.connect('mqtt://localhost', opt);

gpio.on('change' , function(channel, value) {
  console.log('pin ' + channel + ' is ' + value);
  client.publish('coin/inc', '1');
});

gpio.setup(coinPinIdx, gpio.DIR_IN, gpio.EDGE_RISING);

client.on('connect', function () {
  console.log('connect to broker OK');
});
