const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser')
const exec = require('child_process').exec;

const port = 8081;
const version = 'v1.0';

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/version', (req, res) => {
  res.send(version);
});

app.post('/recipe/start', (req, res) => {
  exec(req.body.cmd, function (err, stdout, stderr) {
    console.log(req.body.cmd);
    res.send(stdout);
  });
});

app.post('/recipe/start/original', (req, res) => {
  exec("node ~/codes/cakeVending/recipes/test.js", function (err, stdout, stderr) {
    console.log(req.body.cmd);
    res.send(stdout);
  });
});

app.listen(port, () => {
  console.log('Listing on port ' + port);
});

