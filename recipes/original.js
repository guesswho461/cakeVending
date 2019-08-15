const mqtt = require('mqtt');
const delay = require('delay');
const waitUntil = require('async-wait-until');

const opt = {
  port: 1883,
  clientId: 'recipeOriginal'
};
const waitMotionDoneTimeout = 60000; //ms
let motionStop = true;

async function waitMotionDone() {
  motionStop = false;
  const result = await waitUntil(() => {
    return motionStop;
  }, waitMotionDoneTimeout);
}

console.log(opt.clientId + ' started');

const client = mqtt.connect('mqtt://localhost', opt);

client.on('connect', function () {
  console.log('connect to broker OK');
  client.subscribe('robot/status/stop');
});

client.on('message', function (topic, msg) {
  console.log('topic ' + topic + ' - ' + msg);
  if (topic === 'robot/status/stop') {
    if (msg.toString() === 'true') {
      motionStop = true;
    } else {
      motionStop = false;
    }
  }
});

(async () => {
  await waitMotionDone();
  client.publish('robot/cmd/jog/x', '50');
  await waitMotionDone();
  client.publish('robot/cmd/jog/x', '-50');
})();

