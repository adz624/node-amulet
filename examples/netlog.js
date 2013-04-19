'use strict';

var Phantom = require('../lib');
var ph = new Phantom();
var page = new Phantom.WebPage(ph);
var address;

if (process.argv.length === 2) {
  console.log('Usage: loadspeed.js <some URL>');
  ph.exit();
} else {
  address = process.argv[2];

  page.on('resourceRequested', function (req) {
    console.log(req);
  });

  page.on('resourceReceived', function (res) {
    console.log(res);
  });

  page.open(address, function (err, status) {
    if (status !== 'success') {
      console.log('FAIL to load the address');
    }
    ph.exit();
    process.exit();
  });
}
