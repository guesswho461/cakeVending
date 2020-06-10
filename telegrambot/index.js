//todo: shutdown

const version = "cakeVendingBot v1.13";

const log4js = require("log4js");
log4js.configure({
  appenders: {
    file: {
      type: "dateFile",
      filename: "log/cakeVendingBot.log",
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
const logger = log4js.getLogger("cake");

const express = require("express");
const app = express();
const http = require("http");
const https = require("https");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const jwt = require("express-jwt");
require("dotenv").config();
const { parse } = require("comment-json");
const HashMap = require("hashmap");
const util = require("util");

const httpsOptions = {
  key: fs.readFileSync("./ssl_files/server_private_key.pem"),
  ca: [fs.readFileSync("./ssl_files/cert.pem")],
  cert: fs.readFileSync("./ssl_files/server_cert.pem"),
};

const bot = new TelegramBot(process.env.TELEGRAM_ACCESS_TOKEN, {
  polling: true,
});

let machineMap = new HashMap();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(morgan("dev"));
app.set("trust proxy", true);

app.get(
  "/version",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    res.send(version);
  }
);

const appendPrefix = (req, type, msg) => {
  return "[" + req.ip + "]  " + type + ": " + msg;
};

app.post(
  "/machine/alarm",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    bot.sendMessage(
      process.env.TELEGRAM_CHAT_ID,
      appendPrefix(req, "ALARM", req.body)
    );
    res.sendStatus(200);
  }
);

app.post(
  "/machine/warning",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    bot.sendMessage(
      process.env.TELEGRAM_CHAT_ID,
      appendPrefix(req, "WARNING", req.body)
    );
    res.sendStatus(200);
  }
);

app.post(
  "/machine/info",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    bot.sendMessage(
      process.env.TELEGRAM_CHAT_ID,
      appendPrefix(req, "INFO", req.body)
    );
    res.sendStatus(200);
  }
);

app.post(
  "/machine/online",
  jwt({
    subject: process.env.CAKE_ACCESS_TOKEN_SUBJECT,
    name: process.env.CAKE_ACCESS_TOKEN_NAME,
    secret: process.env.CAKE_ACCESS_TOKEN_SECRET,
  }),
  (req, res) => {
    const machineInfo = parse(req.body);
    if (machineMap.has(machineInfo.name)) {
      machineMap.delete(machineMap);
    }
    machineMap.set(machineInfo.name, machineInfo);
    bot.sendMessage(
      process.env.TELEGRAM_CHAT_ID,
      appendPrefix(
        req,
        "INFO",
        machineInfo.name +
          " " +
          machineInfo.ver +
          ": " +
          machineInfo.ip +
          " is online"
      )
    );
    res.sendStatus(200);
  }
);
const PORT = process.env.PORT || process.env.SERVER_PORT;
// http.createServer(app).listen(PORT, () => {
//   console.log(version + " listening on port " + PORT);
// });

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(version + " listening on port " + PORT);
});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

const postWebAPI = (ip, url, payload) => {
  return new Promise((resolve, reject) => {
    axios({
      method: "post",
      baseURL: "https://" + ip + ":" + process.env.MACHINE_BACKEND_PORT + url,
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
        logger.trace("POST " + url + " " + payload + " " + res.status);
        return resolve(res.data);
      })
      .catch((err) => {
        logger.error(err.message);
        return reject(err.message);
      });
  });
};

const getWebAPI = (ip, url) => {
  return new Promise((resolve, reject) => {
    axios({
      method: "get",
      baseURL: "https://" + ip + ":" + process.env.MACHINE_BACKEND_PORT + url,
      headers: {
        Authorization: "Bearer " + process.env.CAKE_ACCESS_TOKEN,
        "content-type": "text/plain",
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
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

const getFileWebAPI = (ip, url) => {
  return new Promise((resolve, reject) => {
    axios({
      method: "get",
      baseURL: "https://" + ip + ":" + process.env.MACHINE_BACKEND_PORT + url,
      headers: {
        Authorization: "Bearer " + process.env.CAKE_ACCESS_TOKEN,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      responseType: "stream",
    })
      .then((res) => {
        console.log("GET " + url + " " + res.status);
        return resolve(res.data);
      })
      .catch((err) => {
        console.log(err.message);
        return reject(err.message);
      });
  });
};

const findMachineAndPost = (words, url) => {
  return new Promise((resolve, reject) => {
    if (machineMap.has(words[1])) {
      const machine = machineMap.get(words[1]);
      let payload = "";
      if (words.length >= 2) {
        for (let i = 2; i < words.length; i++) {
          payload = payload + " " + words[i];
        }
      }
      postWebAPI(machine.ip, url, payload)
        .then((msg) => {
          return resolve(machine.name + ": " + msg);
        })
        .catch((err) => {
          return reject(err.message);
        });
    } else {
      resp = "sorry, " + words[1] + " is offline";
      return reject(resp);
    }
  });
};

const findMachineAndGet = (words, url) => {
  return new Promise((resolve, reject) => {
    if (machineMap.has(words[1])) {
      const machine = machineMap.get(words[1]);
      getWebAPI(machine.ip, url)
        .then((msg) => {
          return resolve(machine.name + ": " + msg);
        })
        .catch((err) => {
          return reject(err.message);
        });
    } else {
      resp = "sorry, " + words[1] + " is offline";
      return reject(resp);
    }
  });
};

const findMachineAndDownload = (words, url) => {
  return new Promise((resolve, reject) => {
    if (machineMap.has(words[1])) {
      const machine = machineMap.get(words[1]);
      getFileWebAPI(machine.ip, url)
        .then((data) => {
          return resolve(data);
        })
        .catch((err) => {
          return reject(err.message);
        });
    } else {
      resp = "sorry, " + words[1] + " is offline";
      return reject(resp);
    }
  });
};
const cakeBotAction = (chatId, words) => {
  return new Promise((resolve, reject) => {
    let resp;
    if (words[0] === "list") {
      resp = "machine list: [\n";
      machineMap.forEach(function (value, key) {
        resp += value.name + "(" + value.ver + "): " + value.ip + "\n";
      });
      resp += "]";
      return resolve(resp);
    } else if (words[0] === "echo") {
      // postWebAPI(words[1], "/machine/echo", words[2]).then((msg) => {
      //   return resolve(words[1] + ": " + msg);
      // });
      findMachineAndPost(words, "/machine/echo")
        .then((msg) => {
          return resolve(msg);
        })
        .catch((err) => {
          return reject(err);
        });
    } else if (words[0] === "disable") {
      findMachineAndPost(words, "/machine/disable")
        .then((msg) => {
          return resolve(msg);
        })
        .catch((err) => {
          return reject(err);
        });
    } else if (words[0] === "enable") {
      findMachineAndPost(words, "/machine/enable")
        .then((msg) => {
          return resolve(msg);
        })
        .catch((err) => {
          return reject(err);
        });
    } else if (words[0] === "turnover" && words[2] === "today") {
      findMachineAndGet(words, "/turnover/today")
        .then((msg) => {
          return resolve(msg);
        })
        .catch((err) => {
          return reject(err);
        });
    } else if (words[0] === "get" && words[2] === "db") {
      findMachineAndDownload(words, "/db")
        .then((data) => {
          const filePath = "./machine.db";
          data
            .pipe(fs.createWriteStream(filePath))
            .on("finish", () => {
              bot.sendDocument(chatId, filePath);
              return resolve("get db from " + words[1] + " done");
            })
            .on("error", (err) => {
              return reject(err);
            });
        })
        .catch((err) => {
          return reject(err);
        });
    } else {
      resp = "sorry, I dont understand";
      return reject(resp);
    }
  });
};

// Matches "/cake"
bot.onText(/\/cake (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const words = match[1].split(" ");
  cakeBotAction(chatId, words)
    .then((resp) => {
      bot.sendMessage(chatId, resp);
    })
    .catch((err) => {
      bot.sendMessage(chatId, err);
    });
});

bot.sendMessage(process.env.TELEGRAM_CHAT_ID, version + " online");
