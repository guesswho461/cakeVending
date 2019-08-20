const mqtt = require('mqtt');
const delay = require('delay');
const waitUntil = require('async-wait-until');

const opt = {
  port: 1883,
  clientId: 'recipeOriginal'
};

const waitRobotMotionDoneTimeout = 60000; //ms
let robotMotionDone = true;

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
      robotMotionDone = true;
    } else {
      robotMotionDone = false;
    }
  }
});

async function waitRobotMotionDone() {
  robotMotionDone = false;
  const result = await waitUntil(() => {
    return robotMotionDone;
  }, waitRobotMotionDoneTimeout);
}

(async () => {
  for (i = 1; i <= 3; i++) {
    client.publish('robot/cmd/jog/vel', '50');
    await waitRobotMotionDone();
    client.publish('robot/cmd/jog/x', '50');
    client.publish('robot/cmd/jog/y', '50');
    // client.publish('robot/cmd/jog/z', '50');
    client.publish('robot/cmd/jog/fork', '50');
    await waitRobotMotionDone();
    client.publish('robot/cmd/jog/x', '-50');
    client.publish('robot/cmd/jog/y', '-50');
    // client.publish('robot/cmd/jog/z', '-50');
    client.publish('robot/cmd/jog/fork', '0');
  }
})();

