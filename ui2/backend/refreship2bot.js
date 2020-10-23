require("dotenv").config({ path: "../frontend/.env" });

const version = "refresh2bot v1.0";

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
    default: { appenders: ["file", "out"], level: "debug" },
  },
});
const logger = log4js.getLogger("refresh2bot");

const axios = require("axios");
const https = require("https");

const getWebAPI = (ip, url) => {
  return new Promise((resolve, reject) => {
    axios({
      method: "get",
      baseURL: ip + url,
      headers: {
        Authorization: "Bearer " + process.env.CAKE_ACCESS_TOKEN,
        "content-type": "text/plain",
      },
    })
      .then((res) => {
        logger.trace("GET " + url + " " + res.status);
        return resolve(res.data);
      })
      .catch((err) => {
        logger.error(err.message);
        return reject(err.message);
      });
  });
};

const post2Bot = (url, payload) => {
  axios({
    method: "post",
    baseURL: process.env.TELEGRAM_BOT_IP + ":" + process.env.SERVER_PORT + url,
    headers: {
      Authorization: "Bearer " + process.env.CAKE_ACCESS_TOKEN,
      "content-type": "text/plain",
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
    data: payload,
  })
    .then((res) => {
      logger.debug("POST " + url + " " + payload + " " + res.status);
    })
    .catch((err) => {
      logger.error(err.message);
    });
  logger.debug("POST " + url + " " + payload);
};

getWebAPI(
  "http://localhost:" + process.env.MACHINE_BACKEND_PORT,
  "/machine/info"
)
  .then((res) => {
    post2Bot("/machine/online", res);
  })
  .catch((err) => {
    logger.error(err.message);
  });
