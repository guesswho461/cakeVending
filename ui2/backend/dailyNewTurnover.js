require("dotenv").config({ path: "../frontend/.env" });

const version = "dailyNewTurnover v1.00";

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
const logger = log4js.getLogger("dailyNewTurnover");

const axios = require("axios");

const postWebAPI = (ip, url, payload) => {
  return new Promise((resolve, reject) => {
    axios({
      method: "post",
      baseURL: "http://" + ip + ":" + process.env.MACHINE_BACKEND_PORT + url,
      headers: {
        Authorization: "Bearer " + process.env.REACT_APP_CAKE_ACCESS_TOKEN,
        "content-type": "text/plain",
      },
      data: payload,
    })
      .then((res) => {
        logger.trace("POST " + url + " " + payload + " " + res.status);
        return resolve(res.data);
      })
      .catch((err) => {
        logger.error(err.message);
        return reject(err.message);
      });
  });
};

postWebAPI("localhost", "/turnover", "true");
