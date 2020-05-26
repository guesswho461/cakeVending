require("dotenv").config();
const axios = require("axios");
const https = require("https");
const fs = require("fs");

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
        console.log("POST " + url + " " + payload + " " + res.status);
        return resolve(res.data);
      })
      .catch((err) => {
        console.log(err.message);
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

getFileWebAPI("localhost", "/db").then((data) => {
  data.pipe(fs.createWriteStream("test.db"));
});
