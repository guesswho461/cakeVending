const serialPort = require('serialport')
const mega2560Serial = new serialPort('/dev/ttyACM0', {
  baudRate: 115200
})
const mqtt = require('mqtt');
const mqttOpt = {
  port: 1883,
  clientId: "serialmqtt",
};
const mqttClient = mqtt.connect("mqtt://localhost", mqttOpt);

// Switches the port into "flowing mode"
mega2560Serial.on('readable', function () {
  console.log('mega2560:', mega2560Serial.read().toString('ascii'))
});

mqttClient.on("connect", function () {
  console.log("mqttClient: connect to broker");
  mqttClient.subscribe("robot/cmd/#");
});

const serialEnd = "\r\n";

function sendSerialCmd (cmd) {
  console.log("sendSerialCmd: " + cmd);
  mega2560Serial.write(cmd + serialEnd);
};

function move (dir, len) {
  sendSerialCmd("G01 " + dir + len);
};

mqttClient.on("message", function (topic, msg) {
  console.log("mqttClient: topic " + topic + ", msg " + msg);
  switch (topic) {
    default:
      break;
    case "robot/cmd/jog/vel":
      move("F", "1000");
      break;
    case "robot/cmd/jog/x":
      move("X", msg);
      break;
    case "robot/cmd/jog/y":
      move("Y", msg);
      break;
    case "robot/cmd/jog/z":
      move("Z", msg);
      break;
    case "robot/cmd/stop":
      sendSerialCmd('blink');
      break;
    }
});
