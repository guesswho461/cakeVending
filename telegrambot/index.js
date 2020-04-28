//todo: shutdown
//todo: polling all machines's alive
//todo: save all machines's ip address as a list

const version = "cakeVendingServer v1.0";

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

const httpsOptions = {
  key: fs.readFileSync("./ssl_files/server-key.pem"),
  ca: [fs.readFileSync("./ssl_files/cert.pem")],
  cert: fs.readFileSync("./ssl_files/server-cert.pem"),
};

const bot = new TelegramBot(process.env.TELEGRAM_ACCESS_TOKEN, {
  polling: true,
});

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

const PORT = process.env.PORT || process.env.SERVER_PORT;
http.createServer(app).listen(PORT, () => {
  console.log(version + " listening on port " + PORT);
});

// https.createServer(httpsOptions, app).listen(PORT, () => {
//   console.log(version + " listening on port " + PORT);
// });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

bot.sendMessage(process.env.TELEGRAM_CHAT_ID, version + " online");
