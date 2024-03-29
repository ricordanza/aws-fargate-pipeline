var XRay = require('aws-xray-sdk');
var AWS = XRay.captureAWS(require('aws-sdk'));

const express = require('express');

// Constants
const PORT = 80;

// App
const app = express();

XRay.config([XRay.plugins.ECSPlugin]);
XRay.middleware.enableDynamicNaming();

app.use(XRay.express.openSegment('service-b'));

function randomIntInc(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low);
}

function sleep(callback) {
  var now = new Date().getTime();
  while (new Date().getTime() < now + randomIntInc(0, 1000)) { /* */ }
  callback();
}

app.get('/', function(req, res) {
  res.status(200).send("Healthy");
});

app.post('/create', function(req, res) {
  res.setHeader('Content-Type', 'application/json');

  var r = randomIntInc(1, 10)
  var st = 0;
  if (r % 2 == 0) {
    st = 200;
  } else {
    st = 403;
  }

  var data = {
    request: randomIntInc(1, 10000),
    status: st,
    time: new Date().getTime()
  };

  for (var i = 0; i < 5; i++) {
    sleep(function() {});
  }

  if (st == 200) {
      res.json(data);
  } else {
    res.status(st).send(data);
  }

});

app.use(XRay.express.closeSegment());

app.listen(PORT);
console.log('Running on http://0.0.0.0:' + PORT);
