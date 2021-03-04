require("dotenv").config({ path: "../frontend/.env" });

const version = "setfrigtemp v1.00";

const log4js = require("log4js");
log4js.configure({
  appenders: {
    file: {
      type: "dateFile",
      filename: "log/cakeBackend.log",
      maxLogSize: 1000000, // 1 MB
      backups: 5,
      category: "normal",
    },
    out: {
      type: "stdout",
    },
  },
  categories: {
    default: { appenders: ["file", "out"], level: "trace" },
  },
});
const logger = log4js.getLogger("setfrigtemp");

const mqtt = require("mqtt");
var argv = require("minimist")(process.argv.slice(2));

const mqttOpt = {
  port: process.env.MACHINE_LOCAL_MQTT_BROKER_PORT,
  clientId: version,
};
const mqttClient = mqtt.connect("mqtt://localhost", mqttOpt);

mqttClient.on("connect", function () {
  mqttClient.publish(
    "bucket/cmd/refrigTemp",
    argv._[0].toString(),
    function () {
      logger.info("set bucket/cmd/refrigTemp " + argv._[0].toString());
      mqttClient.end();
    }
  );
});
