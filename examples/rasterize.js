'use strict';

var timers = require('timers');
var Phantom = require('../lib');
var ph = new Phantom();
var page = new Phantom.WebPage(ph);
var address, output, size;

function render() {
  address = process.argv[2];
  output = process.argv[3];
  page.open(address, function (err, status) {
    if (status !== 'success') {
      console.log('Unable to load the address!');
      ph.exit();
      process.exit();
    } else {
      timers.setTimeout(function () {
        page.render(output, function () {
          ph.exit();
          process.exit();
        });
      }, 200);
    }
  });
}

function zoomFactor() {
  if (process.argv.length > 5) {
    page.zoomFactor(process.argv[5], render);
    return;
  }
  render();
}

function pagerSize() {
  if (process.argv.length > 4 && process.argv[3].substr(-4) === ".pdf") {
    size = process.argv[4].split('*');
    page.paperSize(size.length === 2 ? { width: size[0], height: size[1], margin: '0px' } : { format: process.argv[4], orientation: 'portrait', margin: '1cm' }, zoomFactor);
    return;
  }
  zoomFactor();
}

function viewportSize() {
  page.viewportSize({ width: 600, height: 600 }, pagerSize);
}

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage: rasterize.js URL filename [paperwidth*paperheight|paperformat] [zoom]');
  console.log(' paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
  ph.exit();
} else {
  viewportSize();
}
