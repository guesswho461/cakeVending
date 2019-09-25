const mqtt = require('mqtt');
const delay = require('delay');
const waitUntil = require('async-wait-until');

const opt = {
  port: 1883,
  clientId: 'recipeOriginal'
};

const waitRobotMotionDoneTimeout = 60000; //ms
const waitOvenTimeout = 60000; //ms
let robotMotionDone = true;
let ovenFlipTrue = false;
let ovenFlipFalse = false;
let ovenOpenTrue = false;
let ovenOpenFalse = false;

console.log(opt.clientId + ' started');

const client = mqtt.connect('mqtt://localhost', opt);

client.on('connect', function () {
  console.log('connect to broker OK');
  client.subscribe('robot/status/stop');
  client.subscribe('oven/status/flip');
  client.subscribe('oven/status/open');
});

client.on('message', function (topic, msg) {
  //console.log('topic ' + topic + ' - ' + msg);
  if (topic === 'robot/status/stop') {
    if (msg.toString() === 'true') {
      robotMotionDone = true;
    } else {
      robotMotionDone = false;
    }
  } else if (topic === 'oven/status/flip') {
    if (msg.toString() === 'true') {
      ovenFlipTrue = true;
      ovenFlipFalse = false;
    } else {
      ovenFlipTrue = false;
      ovenFlipFalse = true;
    }
  } else if (topic === 'oven/status/open') {
    if (msg.toString() === 'true') {
      ovenOpenTrue = true;
      ovenOpenFalse = false;
    } else {
      ovenOpenTrue = false;
      ovenOpenFalse = true;
    }
  }
});

async function waitRobotMotionDone() {
  robotMotionDone = false;
  const result = await waitUntil(() => {
    return robotMotionDone;
  }, waitRobotMotionDoneTimeout);
}

async function waitOvenOpenTrue() {
  ovenOpenTrue = false;
  const result = await waitUntil(() => {
    return ovenOpenTrue;
  }, waitOvenTimeout);
}

async function waitOvenOpenFalse() {
  ovenOpenFalse = false;
  const result = await waitUntil(() => {
    return ovenOpenFalse;
  }, waitOvenTimeout);
}

async function waitOvenFlipTrue() {
  ovenFlipTrue = false;
  const result = await waitUntil(() => {
    return ovenFlipTrue;
  }, waitOvenTimeout);
}

async function waitOvenFlipFalse() {
  ovenFlipFalse = false;
  const result = await waitUntil(() => {
    return ovenFlipFalse;
  }, waitOvenTimeout);
}

(async () => {
  console.log('oven open');
  client.publish('oven/cmd/open', 'true');
  //await delay(3000);
  await waitOvenOpenTrue();
  client.publish('robot/cmd/jog/vel', '15');
  client.publish('bucket/cmd/jog/vel', '500');

  await waitRobotMotionDone();
  console.log('robot to P7-1');
  client.publish('robot/cmd/jog/x', '-234.5');
  client.publish('robot/cmd/jog/y', '-3.5');
  client.publish('robot/cmd/jog/z', '-90.7');
  //client.publish('robot/cmd/jog/fork', '50');
  await waitRobotMotionDone();
  console.log('bucket jog vol');
  client.publish('bucket/cmd/jog/vol', '60');
  await delay(1000);
  console.log('robot to P8-1');
  client.publish('robot/cmd/jog/x', '-234.5');
  client.publish('robot/cmd/jog/y', '-50.5');
  client.publish('robot/cmd/jog/z', '-90.7');
  //client.publish('robot/cmd/jog/fork', '50');
  await waitRobotMotionDone();
  console.log('bucket jog vol');
  client.publish('bucket/cmd/jog/vol', '60');
  await delay(1000);
  console.log('robot to P9-1');
  client.publish('robot/cmd/jog/x', '-234.5');
  client.publish('robot/cmd/jog/y', '-97.5');
  client.publish('robot/cmd/jog/z', '-90.7');
  //client.publish('robot/cmd/jog/fork', '50');
  await waitRobotMotionDone();
  console.log('bucket jog vol');
  client.publish('bucket/cmd/jog/vol', '60');
  await delay(1000);
  console.log('robot to P10-1');
  client.publish('robot/cmd/jog/x', '-234.5');
  client.publish('robot/cmd/jog/y', '-144.5');
  client.publish('robot/cmd/jog/z', '-90.7');
  //client.publish('robot/cmd/jog/fork', '50');
  await waitRobotMotionDone();
  console.log('bucket jog vol');
  client.publish('bucket/cmd/jog/vol', '60');
  await delay(1000);
  console.log('robot to P11-1');
  client.publish('robot/cmd/jog/x', '-234.5');
  client.publish('robot/cmd/jog/y', '-191.5');
  client.publish('robot/cmd/jog/z', '-90.7');
  //client.publish('robot/cmd/jog/fork', '50');
  await waitRobotMotionDone();
  console.log('bucket jog vol');
  client.publish('bucket/cmd/jog/vol', '60');
  await delay(1000);
  console.log('robot to P12-1');
  client.publish('robot/cmd/jog/x', '-234.5');
  client.publish('robot/cmd/jog/y', '-238.5');
  client.publish('robot/cmd/jog/z', '-90.7');
  //client.publish('robot/cmd/jog/fork', '50');
  await waitRobotMotionDone();
  console.log('robot to home');
  client.publish('robot/cmd/jog/x', '0');
  //client.publish('robot/cmd/jog/y', '0');
  //client.publish('robot/cmd/jog/z', '0');
  //client.publish('robot/cmd/jog/fork', '50');
  await waitRobotMotionDone();
  console.log('oven close');
  client.publish('oven/cmd/open', 'false');
  //await delay(3000);
  await waitOvenOpenFalse();
  console.log('oven flip true');
  client.publish('oven/cmd/flip', 'true');
  //await delay(3000);
  await waitOvenFlipTrue();
  console.log('oven flip false');
  client.publish('oven/cmd/flip', 'false');
  //await delay(3000);
  await waitOvenFlipFalse();
  console.log('oven open');
  client.publish('oven/cmd/open', 'true');
  //await delay(3000);
  await waitOvenOpenTrue();
})();

