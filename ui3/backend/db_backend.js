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
      "CREATE TABLE IF NOT EXISTS totalData (time TEXT, price INTEGER, discount INTEGER, tenCnt INTEGER, fiveCnt INTEGER, firstTime TEXT, star INTEGER, sex TEXT, age INTEGER, batchNo TEXT, receiptNo TEXT, tradeNo TEXT, transAmount TEXT, transDate TEXT, transTime TEXT, info_1 TEXT, info_2 TEXT, payType TEXT, other1 TEXT, other2 TEXT, other3 TEXT)"
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

const updateToLastRowOfDBs = (columnName1, data1, columnName2, data2) => {
  const statement = util.format(
    "UPDATE totalData set %s = '%s', %s = '%s' WHERE _rowid_ = (SELECT MAX(_rowid_) FROM totalData)",
    columnName1,
    data1,
    columnName2,
    data2
  );
  db.run(statement);
};

const setToDB = (
  price,
  discount,
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
  payType
) => {
  return new Promise((resolve, reject) => {
    const statement = util.format(
      "INSERT INTO totalData VALUES ('%s', %s, %s, %s, %s, NULL, NULL, NULL, NULL, %s, %s, %s, %s, %s, %s, %s, %s, '%s', NULL, NULL, NULL)",
      getTime(),
      price,
      discount,
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
      payType
    );

    db.run(statement, [], (err, value) => {
      if (err) {
        return reject(err.message);
      } else {
        return resolve("OK");
      }
    });
  });
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
          "SELECT discount, COUNT(*) FROM totalData t WHERE strftime(" +
            dateFormat +
            ",t.time) = strftime(" +
            dateFormat +
            ",?) GROUP BY discount",
          date
        );
      })
      .then((result2) => {
        finalResult += result2 + "\n";
        return getFromDB(
          "SELECT firstTime, COUNT(*) FROM totalData t WHERE strftime(" +
            dateFormat +
            ",t.time) = strftime(" +
            dateFormat +
            ",?) GROUP BY firstTime",
          date
        );
      })
      .then((result3) => {
        finalResult += result3 + "\n";
        return getFromDB(
          "SELECT star, COUNT(*) FROM totalData t WHERE strftime(" +
            dateFormat +
            ",t.time) = strftime(" +
            dateFormat +
            ",?) GROUP BY star",
          date
        );
      })
      .then((result4) => {
        finalResult += result4 + "\n";
        return getFromDB(
          "SELECT sex, COUNT(*) FROM totalData t WHERE strftime(" +
            dateFormat +
            ",t.time) = strftime(" +
            dateFormat +
            ",?) GROUP BY sex",
          date
        );
      })
      .then((result5) => {
        finalResult += result5 + "\n";
        return getFromDB(
          "SELECT payType, COUNT(*) FROM totalData t WHERE strftime(" +
            dateFormat +
            ",t.time) = strftime(" +
            dateFormat +
            ",?) GROUP BY payType",
          date
        );
      })
      .then((result6) => {
        finalResult += result6 + "\n";
        return getTurnover(date, mdt);
      })
      .then((result7) => {
        finalResult += "NTD " + result7;
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
    isToday = req.body.isToday;
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
    vol = parseInt(req.body.vol);
    setParToDB("scriptArgu", vol);
    res.sendStatus(200);
  }
);

app.post(
  "/sells",

  (req, res) => {
    price = parseInt(req.body.price);
    discount = parseInt(req.body.discount);
    tenCnt = parseInt(req.body.tenCnt);
    fiveCnt = parseInt(req.body.fiveCnt);
    batchNo = req.body.batchNo;
    receiptNo = req.body.receiptNo;
    tradeNo = req.body.tradeNo;
    transAmount = req.body.transAmount;
    transDate = req.body.transDate;
    transTime = req.body.transTime;
    info_1 = req.body.info_1;
    info_2 = req.body.info_2;
    payType = req.body.payType;

    console.log(req.body);

    setToDB(
      price,
      discount,
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
      payType
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
    chk = req.body.chk;
    star = req.body.star;
    updateToLastRowOfDBs("firstTime", chk, "star", star);
    res.sendStatus(200);
  }
);

app.post(
  "/thisOrder/age",

  (req, res) => {
    sex = req.body.sex;
    age = req.body.age;
    updateToLastRowOfDBs("sex", sex, "age", age);
    res.sendStatus(200);
  }
);

app.get(
  "/sells/vol",

  (req, res) => {
    let date = getDate();
    isToday = req.body.isToday;
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
    let mdt = "D";

    mode = req.body.mode;
    if (mode === "today") {
      mdt = "D";
      date = getDate();
    } else if (mode === "ytd") {
      mdt = "D";
      date = getYesterdayDate();
    } else if (mode === "month") {
      mdt = "M";
      date = req.body.date;
    } else if (mode === "select") {
      mdt = "D";
      date = req.body.date;
    }

    console.log(mode);
    console.log(mdt);
    console.log(date);

    getSellsDetail(date, mdt)
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);
