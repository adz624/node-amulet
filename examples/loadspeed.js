'use strict';

var Phantom = require('../lib');
var ph = new Phantom('3001');
var page = new Phantom.WebPage(ph);
var t, address;

if (process.argv.length === 2) {
  console.log('Usage: loadspeed.js <some URL>');
  ph.exit();
  process.exit();
} else {
  t = Date.now();
  address = process.argv[2];
  page.open(address, function (err, status) {
    if (status !== 'success') {
      console.log('FAIL to load the address');
    } else {
      t = Date.now() - t;
      page.evaluate(function () {
        return document.title;
      }, function (err, data) {
        console.log('Page title is ' + data);
        console.log('Loading time ' + t + ' msec');
        ph.exit();
        process.exit();
      });
    }
  });
}
