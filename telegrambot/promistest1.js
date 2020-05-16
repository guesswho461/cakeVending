const axios = require("axios");
require("dotenv").config();

const postWebAPI = (url, payload) => {
  return new Promise((resolve, reject) => {
    axios({
      method: "post",
      baseURL: url,
      headers: {
        Authorization: "Bearer " + process.env.CAKE_ACCESS_TOKEN,
        "content-type": "text/plain",
      },
      data: payload,
    })
      .then((res) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.message);
      });
  });
};

postWebAPI("http://localhost:8081/machine/echo", "test123")
  .then((msg) => {
    console.log(msg);
  })
  .catch((err) => {
    return reject(err.message);
  });
