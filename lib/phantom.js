'use strict';

var Bridge = require('./bridge');
var WebPage = require('./webpage');
var binPath = require('phantomjs').path;
var childProcess = require('child_process');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var connDebug = require('debug')('connect');
var phDebug = require('debug')('phantom');

module.exports = (function () {
  function Phantom(bridge, opts) {
    switch (typeof bridge) {
    case 'string':
    case 'number':
      bridge = new Bridge(bridge);
      break;
    }
    if (!(bridge instanceof Bridge)) {
      throw new Error('bridge is not a instance of Bridge');
    }
    if (typeof opts !== 'object') {
      opts = {};
    }
    this.opts = opts;
    bridge.addPgantom(this);
    EventEmitter.call(this);
  }

  util.inherits(Phantom, EventEmitter);

  Phantom.prototype.id = null;
  Phantom.prototype.bridge = null;
  Phantom.prototype.socket = null;
  Phantom.prototype.opts = null;
  Phantom.prototype.opened = false;
  Phantom.prototype.cmdId = 0;
  Phantom.prototype.cmdCb = {};
  Phantom.prototype.args = null;
  Phantom.prototype.cookiesEnabled = null;
  Phantom.prototype.libraryPath = null;
  Phantom.prototype.scriptName = null;
  Phantom.prototype.version = null;
  Phantom.prototype.pages = {};

  Phantom.prototype.open = function (cb) {
    var that = this;

    if (!this.bridge) {
      return cb(new Error('this.bridge is not defined'));
    }

    connDebug(that.id + ' 開始連接 nodejs、phantomjs');

    function open() {
      var timer = setTimeout(function () {
        connDebug(that.id + ' 連接失敗');
        cb(new Error('timeout of 2000ms exceeded'));
      }, 2000);

      that.on('hello', function (socket) {
        that.opened = true;
        that.socket = socket;
        clearTimeout(timer);
        connDebug(that.id + ' 連接成功');
        cb();
      });

      that.on('cmd', function (id, cmd, args) {
        if (!that.cmdCb.hasOwnProperty(cmd + id)) {
          return;
        }
        that.cmdCb[cmd + id].apply(null, args);
        delete that.cmdCb[cmd + id];
      });

      var args = [];
      var i;
      for (i in that.opts) {
        if (that.opts.hasOwnProperty(i)) {
          args.push('--' + i + '=' + that.opts[i]);
        }
      }

      args = args.concat([
        path.join(__dirname, '../ph/bridge.js'),
        that.bridge.port,
        that.id
      ]);

      var phantom = childProcess.spawn(binPath, args);

      phantom.stdout.on('data', function (data) {
        phDebug('stdout: ' + data);
      });

      phantom.stderr.on('data', function (data) {
        phDebug('stderr: ' + data);
      });

      phantom.on('exit', function (code) {
        phDebug('exit code: ' + code);
        that.exit();
      });
    }

    if (!this.bridge.started) {
      this.bridge.start(function (err) {
        open();
      });
    }
  };

  Phantom.prototype.exit = function () {
    if (!this.opened) {
      return;
    }
    this.opened = false;
    this.cmd('exit');
    this.emit('exit');
  };

  Phantom.prototype.addCookie = function (cookie, cb) {
    if (typeof cookie !== 'object') {
      return cb(new Error('cookie should be a json object'));
    }
    this.cmd('addCookie', [cookie], cb);
  };

  Phantom.prototype.clearCookies = function (cb) {
    this.cmd('clearCookies', cb);
  };
  
  Phantom.prototype.deleteCookie = function (cookieName, cb) {
    if (typeof cookieName !== 'function') {
      return cb(new Error('cookieName should be a string'));
    }
    this.cmd('deleteCookie', [cookieName], cb);
  };
  
  Phantom.prototype.injectJs = function (filename, cb) {
    if (typeof filename !== 'string') {
      return cb(new Error('filename should be a string'));
    }
    this.cmd('injectJs', [filename], cb);
  };
  
  Phantom.prototype.cookies = function (cb) {
    this.cmd('cookies', cb);
  };

  // 執行第一次命令之後替換掉 Phantom.prototype.cmd
  function sendCmd(cmd, args, cb) {
    if (typeof args === 'function') {
      cb = args;
      args = [];
    }
    args = args || [];
    this.socket.emit('cmd', {cmd: cmd, id: this.cmdId, args: args});
    if (cb) {
      this.cmdCb[cmd + this.cmdId] = cb;
    }
    this.cmdId += 1;
  }
  
  Phantom.prototype.cmd = function (cmd, args, cb) {
    var that = this;
    var outArgs = arguments;
    phDebug(this.id + '第一次執行 cmd');
    this.open(function (err) {
      if (err) {
        return (typeof args === 'function' ? args : cb)(err);
      }
      sendCmd.apply(that, outArgs);
      that.cmd = sendCmd;
    });
  };

  Phantom.prototype.createPage = function () {
    var page = new WebPage(this);
    return page;
  };

  return Phantom;
}());
