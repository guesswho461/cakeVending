const delay = require("delay");
const mqtt = require("mqtt");
const waitUntil = require("async-wait-until");

const opt = {
  port: 8000,
  clientId: "recipeOriginal"
};

const waitRobotMotionDoneTimeout = 60000; //ms
const waitOvenTimeout = 60000; //ms
let robotMotionDone = true;

const client = mqtt.connect("ws://192.168.1.99", opt);

client.on("connect", function() {
  console.log("connect to broker OK");
  client.subscribe("robot/status/stop");
  client.subscribe("oven/status/flip");
  client.subscribe("oven/status/open");
});

client.on("message", function(topic, msg) {
  //console.log('topic ' + topic + ' - ' + msg);
  if (topic === "robot/status/stop") {
    if (msg.toString() === "true") {
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
  await delay(3000);
  client.publish("gate/cmd/open", "true");
  await delay(3000);
  client.publish("gate/cmd/open", "false");
})();
