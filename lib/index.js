'use strict';

var Phantom = require('./phantom');
var Bridge = require('./bridge');
var WebPage = require('./webpage');
var bridge = new Bridge();

Phantom.port = undefined;

Phantom.__defineSetter__('port', function (val) {
  bridge = new Bridge(val);
});

Phantom.__defineGetter__('port', function () {
  return bridge && bridge.port;
});

Phantom.Bridge = Bridge;

Phantom.WebPage = WebPage;

Phantom.create = function (opts) {
  if (!bridge) {
    return;
  }
  return new Phantom(bridge, opts);
};

module.exports = Phantom;
