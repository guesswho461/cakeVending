const version = "cakeVendingBot v1.30";

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

const findMachineAndUpdateIP = (machineName, ip) => {
  return new Promise((resolve, reject) => {
    if (machineMap.has(machineName)) {
      const machine = machineMap.get(machineName);
      machine.ip = ip;
      return resolve("update the ip of " + machine.name + " to " + machine.ip);
    } else {
      getWebAPI(ip, "/version")
        .then((msg) => {
          const machineInfo = { name: machineName, ver: msg, ip: ip };
          machineMap.set(machineInfo.name, machineInfo);
          return resolve(
            "insert a machine: " +
              machineInfo.name +
              " " +
              machineInfo.ver +
              ": " +
              machineInfo.ip
          );
        })
        .catch((err) => {
          return reject(err.message);
        });
    }
  });
};

const findMachineAndPost2 = (machineName, url) => {
  return new Promise((resolve, reject) => {
    if (machineMap.has(machineName)) {
      const machine = machineMap.get(machineName);
      postWebAPI(machine.ip, url, "true")
        .then((msg) => {
          return resolve(machineName + ": OK");
        })
        .catch((err) => {
          return reject(machineName + ": " + err.message);
        });
    } else {
      resp = "sorry, " + machineName + " is offline";
      return reject(resp);
    }
  });
};

const findMachineAndPost = (machineName, url, words, startIdx = 2) => {
  return new Promise((resolve, reject) => {
    if (machineMap.has(machineName)) {
      const machine = machineMap.get(machineName);
      let payload = "";
      if (words.length >= startIdx) {
        for (let i = startIdx; i < words.length; i++) {
          payload = payload + words[i] + " ";
        }
      }
      postWebAPI(machine.ip, url, payload.trim())
        .then((msg) => {
          return resolve(machine.name + ": " + msg);
        })
        .catch((err) => {
          return reject(err.message);
        });
    } else {
      resp = "sorry, " + machineName + " is offline";
      return reject(resp);
    }
  });
};

const findMachineAndGet = (machineName, url) => {
  return new Promise((resolve, reject) => {
    if (machineMap.has(machineName)) {
      const machine = machineMap.get(machineName);
      getWebAPI(machine.ip, url)
        .then((msg) => {
          return resolve(machine.name + ": " + msg);
        })
        .catch((err) => {
          return reject(err.message);
        });
    } else {
      resp = "sorry, " + machineName + " is offline";
      return reject(resp);
    }
  });
};

const findMachineAndDownload = (machineName, url) => {
  return new Promise((resolve, reject) => {
    if (machineMap.has(machineName)) {
      const machine = machineMap.get(machineName);
      getFileWebAPI(machine.ip, url)
        .then((data) => {
          return resolve(data);
        })
        .catch((err) => {
          return reject(err.message);
        });
    } else {
      resp = "sorry, " + machineName + " is offline";
      return reject(resp);
    }
  });
};

const getCmdHandler = (machineName, words, chatId) => {
  return new Promise((resolve, reject) => {
    if (words.length == 3) {
      const arg1 = words[2];
      if (arg1 === "turnover") {
        findMachineAndGet(machineName, "/turnover/today")
          .then((msg) => {
            return resolve(msg);
          })
          .catch((err) => {
            return reject(err);
          });
      } else if (arg1 === "db") {
        findMachineAndDownload(machineName, "/db")
          .then((data) => {
            const filePath = "./machine.db";
            data
              .pipe(fs.createWriteStream(filePath))
              .on("finish", () => {
                bot.sendDocument(chatId, filePath);
                return resolve("get db from " + machineName + " done");
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
    } else if (words.length == 4) {
      // get recipe argu
      const arg1 = words[2];
      const arg2 = words[3];
      if (arg1 === "recipe" && arg2 === "argu") {
        findMachineAndGet(machineName, "/recipe/argu")
          .then((msg) => {
            return resolve(msg);
          })
          .catch((err) => {
            return reject(err);
          });
      } else {
        resp = "sorry, I dont understand";
        return reject(resp);
      }
    } else {
      resp = "missing arguments";
      return reject(resp);
    }
  });
};

const setCmdHandler = (machineName, words) => {
  return new Promise((resolve, reject) => {
    if (words.length >= 3) {
      const arg1 = words[2];
      if (arg1 === "ip") {
        if (words.length >= 4) {
          // set ip arg2
          const arg2 = words[3];
          findMachineAndUpdateIP(machineName, arg2)
            .then((msg) => {
              return resolve(msg);
            })
            .catch((err) => {
              return reject(err);
            });
        } else {
          resp = "missing arguments";
          return reject(resp);
        }
      } else if (arg1 === "recipe") {
        if (words.length == 4) {
          // set recipe arg2
          // const arg2 = words[3];
          findMachineAndPost(machineName, "/recipe/file", words, 3)
            .then((msg) => {
              return resolve(msg);
            })
            .catch((err) => {
              return reject(err);
            });
        } else if (words.length >= 5) {
          const arg2 = words[3];
          if (arg2 === "argu") {
            //set recipe argu arg3
            findMachineAndPost(machineName, "/recipe/argu", words, 4)
              .then((msg) => {
                return resolve(msg);
              })
              .catch((err) => {
                return reject(err);
              });
          } else {
            resp = "sorry, I dont understand";
            return reject(resp);
          }
        } else {
          resp = "sorry, I dont understand";
          return reject(resp);
        }
      } else {
        resp = "sorry, I dont understand";
        return reject(resp);
      }
    } else {
      resp = "missing arguments";
      return reject(resp);
    }
  });
};

const cakeBotAction = (chatId, words) => {
  return new Promise((resolve, reject) => {
    let resp;
    if (words.length >= 2) {
      const machineName = words[0];
      const cmd = words[1];
      if (cmd === "echo") {
        findMachineAndPost(machineName, "/machine/echo", words)
          .then((msg) => {
            return resolve(msg);
          })
          .catch((err) => {
            return reject(err);
          });
      } else if (cmd === "soldout") {
        findMachineAndPost(machineName, "/machine/soldout", words)
          .then((msg) => {
            return resolve(msg);
          })
          .catch((err) => {
            return reject(err);
          });
      } else if (cmd === "disable") {
        findMachineAndPost(machineName, "/machine/disable", words)
          .then((msg) => {
            return resolve(msg);
          })
          .catch((err) => {
            return reject(err);
          });
      } else if (cmd === "enable") {
        findMachineAndPost(machineName, "/machine/enable", words)
          .then((msg) => {
            return resolve(msg);
          })
          .catch((err) => {
            return reject(err);
          });
      } else if (cmd === "get") {
        getCmdHandler(machineName, words, chatId)
          .then((msg) => {
            return resolve(msg);
          })
          .catch((err) => {
            return reject(err);
          });
      } else if (cmd === "set") {
        setCmdHandler(machineName, words)
          .then((msg) => {
            return resolve(msg);
          })
          .catch((err) => {
            return reject(err);
          });
      } else if (cmd === "bake") {
        findMachineAndPost2(machineName, "/recipe/start/original")
          .then((msg) => {
            return resolve(msg);
          })
          .catch((err) => {
            return reject(err);
          });
      } else {
        resp = "sorry, I dont understand";
        return reject(resp);
      }
    } else {
      if (words.length == 1) {
        const cmd = words[0];
        if (cmd === "list") {
          resp = "machine list: [\n";
          machineMap.forEach(function (value, key) {
            resp += value.name + "(" + value.ver + "): " + value.ip + "\n";
          });
          resp += "]";
          return resolve(resp);
        } else if (cmd === "clear") {
          machineMap.clear();
          return resolve("ok");
        }
      } else {
        resp = "missing arguments";
        return reject(resp);
      }
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
