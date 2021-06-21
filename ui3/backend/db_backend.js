require("dotenv").config({ path: "../frontend/.env" });

const VERSION = "db_backend v1.0"; //May 13, 2021
const port = process.env.DB_BACKEND_PORT;

const dbPath = "mydatebase.db";

const log4js = require("log4js");
const logger = log4js.getLogger(VERSION);
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const jwt = require("express-jwt");
const util = require("util");
const sqlite3 = require("sqlite3").verbose();
const { stringify } = require("comment-json");

log4js.configure({
  appenders: {
    file: {
      type: "dateFile",
      filename: "log/cakeVending.log",
      maxLogSize: 2000000, // 1 MB
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

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.text());
app.use(log4js.connectLogger(logger, { level: "info" }));

http.createServer(app).listen(port, "localhost", () => {
  logger.info(VERSION + " listening on port " + port);
});

const getYesterdayDate = () => {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return (
    "[" +
    now.getFullYear() +
    "-" +
    Appendzero(now.getMonth() + 1) +
    "-" +
    Appendzero(now.getDate()) +
    "]"
  );
};

const getDate = () => {
  const now = new Date();
  return (
    now.getFullYear() +
    "-" +
    Appendzero(now.getMonth() + 1) +
    "-" +
    Appendzero(now.getDate())
  );
};

const getTime = () => {
  const now = new Date();
  return (
    now.getFullYear() +
    "-" +
    Appendzero(now.getMonth() + 1) +
    "-" +
    Appendzero(now.getDate()) +
    " " +
    Appendzero(now.getHours()) +
    ":" +
    Appendzero(now.getMinutes()) +
    ":" +
    Appendzero(now.getSeconds()) +
    "." +
    Appendzero(now.getMilliseconds())
  );
};

function Appendzero(obj) {
  if (obj < 10) return "0" + "" + obj;
  else return obj;
}

let tableName = "totalData";

let db = new sqlite3.Database(dbPath, function (err) {
  if (err) throw err;
});

const setParToDB = (name, value) => {
  let _tableName = "PAR";
  const statement = util.format(
    'UPDATE %s SET %s="%s"',
    _tableName,
    name,
    value
  );
  db.run(statement);
};

const getParFromDB = (name) => {
  let _tableName = "PAR";
  return new Promise((resolve, reject) => {
    const statement = util.format("SELECT %s FROM %s", name, _tableName);
    db.get(statement, [], (err, value) => {
      if (err) {
        return reject(err.message);
      } else {
        return resolve(value[name]);
      }
    });
  });
};

const chkParFromDB = (name) => {
  let _tableName = "PAR";
  return new Promise((resolve, reject) => {
    const statement = util.format("SELECT %s FROM %s", name, _tableName);
    db.get(statement, [], (err, value) => {
      if (err) {
        return reject(err.message);
      } else {
        return resolve(value);
      }
    });
  });
};

const createTableToDB = () => {
  return new Promise((resolve, reject) => {
    const statement = util.format(
      "CREATE TABLE IF NOT EXISTS totalData (time TEXT, price INTEGER, tenCnt INTEGER, fiveCnt INTEGER, firstTime TEXT, star INTEGER, batchNo TEXT, receiptNo TEXT, tradeNo TEXT, transAmount TEXT, transDate TEXT, transTime TEXT, info_1 TEXT, info_2 TEXT, payType TEXT, posID TEXT)"
    );
    db.run(statement, (err) => {
      if (err) {
        return reject(err.message);
      } else {
        return resolve("OK");
      }
    });
  });
};

const createTableToParDB = () => {
  let _tableName = "PAR";
  return new Promise((resolve, reject) => {
    const statement = util.format(
      "CREATE TABLE IF NOT EXISTS %s (scriptArgu INTEGER)",
      _tableName
    );
    db.run(statement, (err) => {
      if (err) {
        return reject(err.message);
      } else {
        return resolve("OK");
      }
    });
  });
};

const insToParDB = () => {
  let _tableName = "PAR";
  const statement = util.format("INSERT INTO %s VALUES (30)", _tableName);
  db.run(statement);
};

const updateToLastRowOfDB = (columnName, data) => {
  const statement = util.format(
    "UPDATE totalData set %s = '%s' WHERE _rowid_ = (SELECT MAX(_rowid_) FROM totalData)",
    columnName,
    data
  );
  db.run(statement);
};

const setToDB = (
  price,
  tenCnt,
  fiveCnt,
  batchNo,
  receiptNo,
  tradeNo,
  transAmount,
  transDate,
  transTime,
  info_1,
  info_2,
  payType,
  posID
) => {
  const statement = util.format(
    "INSERT INTO totalData VALUES ('%s', %s, %s, %s, NULL, NULL, %s, %s, %s, %s, %s, %s, %s, %s, '%s', %s)",
    getTime(),
    price,
    tenCnt,
    fiveCnt,
    batchNo,
    receiptNo,
    tradeNo,
    transAmount,
    transDate,
    transTime,
    info_1,
    info_2,
    payType,
    posID
  );
  db.run(statement);
};

const getTurnover = (date, mdt) => {
  return new Promise((resolve, reject) => {
    const filed = "SUM(price)";
    let dateFormat = "'%Y-%m-%d'";
    if (mdt === "M") dateFormat = "'%Y-%m'";
    const statement =
      "SELECT " +
      filed +
      " FROM totalData t WHERE strftime(" +
      dateFormat +
      ",t.time) = strftime(" +
      dateFormat +
      ",?)";
    db.get(statement, [date], (err, value) => {
      if (err) {
        return reject(err.message);
      } else {
        return resolve(value[filed]);
      }
    });
  });
};

const getSellsVol = (date) => {
  return new Promise((resolve, reject) => {
    const statement =
      "SELECT COUNT(*) FROM totalData t WHERE strftime('%Y-%m-%d',t.time) = strftime('%Y-%m-%d',?)";
    db.get(statement, [date], (err, value) => {
      if (err) {
        return reject(err.message);
      } else {
        return resolve(value["COUNT(*)"]);
      }
    });
  });
};

const getFromDB = (template, date) => {
  return new Promise((resolve, reject) => {
    db.all(template, [date], (err, value) => {
      if (err) {
        return reject(err.message);
      } else {
        return resolve(stringify(value));
      }
    });
  });
};

const getSellsDetail = (date, mdt) => {
  return new Promise((resolve, reject) => {
    let finalResult;
    let dateFormat = "'%Y-%m-%d'";
    if (mdt === "M") dateFormat = "'%Y-%m'";
    getFromDB(
      "SELECT price, COUNT(*) FROM totalData t WHERE strftime(" +
        dateFormat +
        ",t.time) = strftime(" +
        dateFormat +
        ",?) GROUP BY price",
      date
    )
      .then((result1) => {
        finalResult = result1 + "\n";
        return getFromDB(
          "SELECT firstTime, COUNT(*) FROM totalData t WHERE strftime(" +
            dateFormat +
            ",t.time) = strftime(" +
            dateFormat +
            ",?) GROUP BY firstTime",
          date
        );
      })
      .then((result2) => {
        finalResult += result2 + "\n";
        return getFromDB(
          "SELECT star, COUNT(*) FROM totalData t WHERE strftime(" +
            dateFormat +
            ",t.time) = strftime(" +
            dateFormat +
            ",?) GROUP BY star",
          date
        );
      })
      .then((result3) => {
        finalResult += result3 + "\n";
        return getTurnover(date, mdt);
      })
      .then((result4) => {
        finalResult += "NTD " + result4;
        return resolve(finalResult);
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

db.serialize(function () {
  createTableToDB();
  createTableToParDB();

  chkParFromDB("scriptArgu").then((value) => {
    if (value == undefined) insToParDB();
  });
});

app.get("/version", (req, res) => {
  res.send(VERSION);
});

app.get(
  "/turnover",

  (req, res) => {
    let date = getDate();
    isToday = req.body;
    //isToday = "today";
    if (isToday === "today") {
      date = getDate();
    } else {
      date = getYesterdayDate();
    }
    getTurnover(date, "D")
      .then((msg) => {
        res.status(200).send("NTD " + msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/recipe/argu",

  (req, res) => {
    getParFromDB("scriptArgu")
      .then((value) => {
        res.status(200).send("Argu " + value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post(
  "/recipe/argu",

  (req, res) => {
    vol = parseInt(req.body);
    //vol = 28;
    setParToDB("scriptArgu", vol);
    res.sendStatus(200);
  }
);

app.post(
  "/sells",

  (req, res) => {
    price = parseInt(req.body.price);
    tenCnt = parseInt(req.body.tenCnt);
    fiveCnt = parseInt(req.body.fiveCnt);
    batchNo = req.body.batchNo;
    receiptNo = req.body.receiptNo;
    tradeNo = req.body.tradeNo;
    transAmount = req.body.transAmount;
    transDate = req.body.transDate;
    transTime = req.body.transTime;
    info_1 = req.body.info1;
    info_2 = req.body.info2;
    payType = req.body.payType;
    posID = req.body.posID;
    /*
    price = 30;
    tenCnt = 2;
    fiveCnt = 2;
    batchNo = "000007";
    receiptNo = "000007";
    tradeNo = "21060906140362892";
    transAmount = "100";
    transDate = "210618";
    transTime = "181403";
    info_1 = "1585624672";
    info_2 = "0";
    payType = "VISA";
    posID = "31001498";
*/
    setToDB(
      price,
      tenCnt,
      fiveCnt,
      batchNo,
      receiptNo,
      tradeNo,
      transAmount,
      transDate,
      transTime,
      info_1,
      info_2,
      payType,
      posID
    );
    res.sendStatus(200);
  }
);

app.get("/db", (req, res) => {
  res.download(dbPath);
});

app.post(
  "/thisOrder/firstTimeBuy",

  (req, res) => {
    chk = req.body;
    //chk = "no";
    updateToLastRowOfDB("firstTime", chk);
    res.sendStatus(200);
  }
);

app.post(
  "/thisOrder/star",

  (req, res) => {
    rating = req.body;
    //rating = 4;
    updateToLastRowOfDB("star", rating);
    res.sendStatus(200);
  }
);

app.get(
  "/sells/vol",

  (req, res) => {
    let date = getDate();
    isToday = req.body;
    //isToday = "today";
    if (isToday === "today") {
      date = getDate();
    } else {
      date = getYesterdayDate();
    }
    getSellsVol(date)
      .then((msg) => {
        res.status(200).send("PCS " + msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/sells/detail",

  (req, res) => {
    let date = getDate();
    isToday = req.body;
    //isToday = "today";
    if (isToday === "today") {
      date = getDate();
    } else {
      date = getYesterdayDate();
    }
    getSellsDetail(date, "D")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/sells/detail/day",

  (req, res) => {
    let date = req.body;
    //date = "2021-06-22";
    getSellsDetail(date, "D")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/sells/detail/month",

  (req, res) => {
    let date = req.body;
    //date = getDate();
    getSellsDetail(date, "M")
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);
