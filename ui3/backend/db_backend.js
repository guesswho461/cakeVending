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
    "[" +
    now.getFullYear() +
    "-" +
    Appendzero(now.getMonth() + 1) +
    "-" +
    Appendzero(now.getDate()) +
    "]"
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

let tableName = getDate();

let db = new sqlite3.Database(dbPath, function (err) {
  if (err) throw err;
});

const setParToDB = (table, name, value) => {
  const statement = util.format('UPDATE %s SET %s="%s"', table, name, value);
  db.run(statement);
};

const getParFromDB = (table, name) => {
  return new Promise((resolve, reject) => {
    const statement = util.format("SELECT %s FROM %s", name, table);
    db.get(statement, [], (err, value) => {
      if (err) {
        return reject(err.message);
      } else {
        return resolve(value[name]);
      }
    });
  });
};

const chkParFromDB = (table, name) => {
  return new Promise((resolve, reject) => {
    const statement = util.format("SELECT %s FROM %s", name, table);
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
    tableName = getDate();
    const statement = util.format(
      "CREATE TABLE IF NOT EXISTS %s (id INTEGER PRIMARY KEY AUTOINCREMENT, time TEXT, price INTEGER, firstTime TEXT, star INTEGER)",
      tableName
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
  return new Promise((resolve, reject) => {
    let _tableName = "PAR";
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

const setToDB = (table, price) => {
  const statement = util.format(
    "INSERT INTO %s VALUES (NULL, '%s', %s, NULL, NULL)",
    table,
    getTime(),
    price
  );
  db.run(statement);
};

const updateToLastRowOfDB = (table, columnName, data) => {
  const statement = util.format(
    "UPDATE %s set %s = '%s' WHERE _rowid_ = (SELECT MAX(_rowid_) FROM %s)",
    table,
    columnName,
    data,
    table
  );
  db.run(statement);
};

const getTurnover = (table) => {
  return new Promise((resolve, reject) => {
    const filed = "SUM(price)";
    const statement = util.format("SELECT %s FROM %s", filed, table);
    db.get(statement, [], (err, value) => {
      if (err) {
        return reject(err.message);
      } else {
        return resolve(value[filed]);
      }
    });
  });
};

const getSellsVol = (table) => {
  return new Promise((resolve, reject) => {
    const statement = util.format("SELECT COUNT(*) FROM %s", table);
    db.get(statement, [], (err, value) => {
      if (err) {
        return reject(err.message);
      } else {
        return resolve(value["COUNT(*)"]);
      }
    });
  });
};

const getFromDB = (template, table) => {
  return new Promise((resolve, reject) => {
    const statement = util.format(template, table);
    db.all(statement, [], (err, value) => {
      if (err) {
        return reject(err.message);
      } else {
        return resolve(stringify(value));
      }
    });
  });
};

const getSellsDetail = (table) => {
  return new Promise((resolve, reject) => {
    let finalResult;
    getFromDB("SELECT price, COUNT(*) FROM %s GROUP BY price", table)
      .then((result1) => {
        finalResult = result1 + "\n";
        return getFromDB(
          "SELECT firstTime, COUNT(*) FROM %s GROUP BY firstTime",
          table
        );
      })
      .then((result2) => {
        finalResult += result2 + "\n";
        return getFromDB("SELECT star, COUNT(*) FROM %s GROUP BY star", table);
      })
      .then((result3) => {
        finalResult += result3;
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

  chkParFromDB("PAR", "scriptArgu").then((value) => {
    if (value == undefined) insToParDB();
  });
});

app.get("/version", (req, res) => {
  res.send(VERSION);
});

app.post(
  "/db/turnover",

  (req, res) => {
    createTableToDB()
      .then((msg) => {
        logger.debug("create a new turnover: " + msg);
        res.sendStatus(200);
      })
      .catch((err) => {
        logger.error(err);
        res.sendStatus(500);
      });
  }
);

app.get(
  "/db/turnover",

  (req, res) => {
    let table = tableName;
    //isToday = "today";
    isToday = req.body;
    if (isToday === "today") {
      table = tableName;
    } else {
      table = getYesterdayDate();
    }
    getTurnover(table)
      .then((msg) => {
        res.status(200).send("NTD " + msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/db/recipe/argu",

  (req, res) => {
    getParFromDB("PAR", "scriptArgu")
      .then((value) => {
        res.status(200).send("Argu " + value);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.post(
  "/db/recipe/argu",

  (req, res) => {
    //vol = 28;
    vol = parseInt(req.body);
    setParToDB("PAR", "scriptArgu", vol);
    res.sendStatus(200);
  }
);

app.post(
  "/db/sells",

  (req, res) => {
    //cnt = 3;
    cnt = parseInt(req.body.cnt);
    //price = 30;
    price = parseInt(req.body.price);
    setToDB(tableName, price);
    res.sendStatus(200);
  }
);

app.get("/db", (req, res) => {
  res.download(dbPath);
});

app.post(
  "/db/thisOrder/firstTimeBuy",

  (req, res) => {
    //chk = "no";
    chk = req.body;
    updateToLastRowOfDB(tableName, "firstTime", chk);
    res.sendStatus(200);
  }
);

app.post(
  "/db/thisOrder/star",

  (req, res) => {
    //rating = 4;
    rating = req.body;
    updateToLastRowOfDB(tableName, "star", rating);
    res.sendStatus(200);
  }
);

app.get(
  "/db/sells/vol",

  (req, res) => {
    let table = tableName;
    //isToday = "today";
    isToday = req.body;
    if (isToday === "today") {
      table = tableName;
    } else {
      table = getYesterdayDate();
    }
    getSellsVol(table)
      .then((msg) => {
        res.status(200).send("PCS " + msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);

app.get(
  "/db/sells/detail",

  (req, res) => {
    let table = tableName;
    //isToday = "today";
    isToday = req.body;
    if (isToday === "today") {
      table = tableName;
    } else {
      table = getYesterdayDate();
    }
    getSellsDetail(table)
      .then((msg) => {
        res.status(200).send(msg);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
);
