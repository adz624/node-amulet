'use strict';

var Phantom = require('./phantom');
var Bridge = require('./bridge');
var WebPage = require('./webpage');
var bridge;

Phantom.port = '3001';

Phantom.Bridge = Bridge;

Phantom.WebPage = WebPage;

Phantom.create = function (opts) {

  if (!bridge) {
    bridge = new Bridge(Phantom.port);
  }

  return new Phantom(bridge, opts);
};

module.exports = Phantom;
