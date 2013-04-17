'use strict';

var pageDebug = require('debug')('page');
var path = require('path');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = (function () {

  function WebPage(ph) {
    if (!(ph.constructor && ph.constructor.name === 'Phantom')) {
      throw new Error('ph is not a instance of Bridge');
    }
    this.phantom = ph;
    this.id = 'page-' + Date.now().toString() + Math.ceil(Math.random() * 10000).toString();
    ph.pages[this.id] = this;
  }

  util.inherits(WebPage, EventEmitter);

  WebPage.prototype.id = null;
  WebPage.prototype.phantom = null;

  function sendCmd(cmd, args, cb) {
    if (typeof args === 'function') {
      cb = args;
      args = null;
    }
    if (!args) {
      args = [];
    }
    args.unshift(this.id);
    this.phantom.cmd(cmd, args, cb);
  }

  WebPage.prototype.cmd = function (cmd, args, cb) {
    var that = this;
    var outArgs = arguments;
    pageDebug(this.id + ' 第一次執行 cmd');
    this.create(function (err) {
      if (err) {
        return (typeof args === 'function' ? args : cb)(err);
      }
      sendCmd.apply(that, outArgs);
      that.cmd = sendCmd;
    });
  };

  WebPage.prototype.viewportSize = function (obj, cb) {
    switch (arguments.length) {
    case 1:
      this.cmd('page.get.viewportSize', obj);
      break;
    case 2:
      if (typeof obj !== 'object') {
        cb(new Error('arguments[0] should be an object'));
      }
      this.cmd('page.set.viewportSize', [obj], cb);
      break;
    }
  };

  WebPage.prototype.content = function (content, cb) {
    switch (arguments.length) {
    case 1:
      this.cmd('page.get.content', content);
      break;
    case 2:
      this.cmd('page.set.content', [content], cb);
      break;
    }
  };

  WebPage.prototype.clipRect = function (obj, cb) {
    switch (arguments.length) {
    case 1:
      this.cmd('page.get.clipRect', obj);
      break;
    case 2:
      if (typeof obj !== 'object') {
        cb(new Error('arguments[0] should be an object'));
      }
      this.cmd('page.set.clipRect', [obj], cb);
      break;
    }
  };

  WebPage.prototype.cookies = function (obj, cb) {
    switch (arguments.length) {
    case 1:
      this.cmd('page.get.cookies', obj);
      break;
    case 2:
      if (typeof obj !== 'object') {
        cb(new Error('arguments[0] should be an object'));
      }
      this.cmd('page.set.cookies', [obj], cb);
      break;
    }
  };

  WebPage.prototype.customHeaders = function (obj, cb) {
    if (typeof obj !== 'object') {
      cb(new Error('arguments[0] should be an object'));
    }
    this.cmd('page.set.customHeaders', [obj], cb);
  };

  WebPage.prototype.paperSize = function (obj, cb) {
    switch (arguments.length) {
    case 1:
      this.cmd('page.get.paperSize', obj);
      break;
    case 2:
      if (typeof obj !== 'object') {
        cb(new Error('arguments[0] should be an object'));
      }
      this.cmd('page.set.paperSize', [obj], cb);
      break;
    }
  };

  WebPage.prototype.plainText = function (cb) {
    this.cmd('page.get.plainText', cb);
  };

  WebPage.prototype.scrollPosition = function (obj, cb) {
    switch (arguments.length) {
    case 1:
      this.cmd('page.get.scrollPosition', obj);
      break;
    case 2:
      if (typeof obj !== 'object') {
        cb(new Error('arguments[0] should be an object'));
      }
      this.cmd('page.set.scrollPosition', [obj], cb);
      break;
    }
  };

  WebPage.prototype.settings = function (obj, cb) {
    switch (arguments.length) {
    case 1:
      this.cmd('page.get.settings', obj);
      break;
    case 2:
      if (typeof obj !== 'object') {
        cb(new Error('arguments[0] should be an object'));
      }
      this.cmd('page.set.settings', [obj], cb);
      break;
    }
  };

  WebPage.prototype.url = function (cb) {
    this.cmd('page.get.url', cb);
  };

  WebPage.prototype.zoomFactor = function (number, cb) {
    switch (arguments.length) {
    case 1:
      this.cmd('page.get.zoomFactor', number);
      break;
    case 2:
      if (typeof number !== 'number') {
        cb(new Error('arguments[0] should be an number'));
      }
      this.cmd('page.set.zoomFactor', [number], cb);
      break;
    }
  };

  WebPage.prototype.create = function (cb) {
    sendCmd.apply(this, ['page.create', cb]);
  };

  WebPage.prototype.open = function (url, cb) {
    if (typeof url !== 'string') {
      return cb(new Error('arguments[0] should be a string'));
    }
    this.cmd('page.open', [url], cb);
  };

  WebPage.prototype.close = function (cb) {
    this.cmd('page.close', cb);
    this.emit('closing', {id: this.id});
  };

  WebPage.prototype.addCookie = function (cookie, cb) {
    if (typeof cookie !== 'object') {
      return cb(new Error('arguments[0] should be a json object'));
    }
    this.cmd('page.addCookie', [cookie], cb);
  };

  WebPage.prototype.clearCookies = function (cb) {
    this.cmd('page.clearCookies', cb);
  };

  WebPage.prototype.deleteCookie = function (cookieName, cb) {
    if (typeof cookieName !== 'function') {
      return cb(new Error('arguments[0] should be a string'));
    }
    this.cmd('page.deleteCookie', [cookieName], cb);
  };

  WebPage.prototype.evaluateJavascript = function (str, cb) {
    if (typeof str !== 'string') {
      return cb(new Error('arguments[0] should be a string'));
    }
    this.cmd('page.evaluateJavascript', [str], cb);
  };

  WebPage.prototype.evaluate = function (args, func, cb) {
    if (typeof args === 'function') {
      cb = func;
      func = args;
      args = [];
    }
    if (!(args instanceof Array)) {
      return cb(new Error('arguments[0] should be an array'));
    }
    args.unshift(func.toString());
    this.cmd('page.evaluate', args, cb);
  };

  WebPage.prototype.go = function (index, cb) {
    if (typeof index !== 'number') {
      return cb('index should be a number');
    }
    this.cmd('page.go', [index], cb);
  };

  WebPage.prototype.goBack = function (cb) {
    this.cmd('page.goBack', cb);
  };

  WebPage.prototype.goForward = function (cb) {
    this.cmd('page.goForward', cb);
  };

  WebPage.prototype.includeJs = function (url, cb) {
    if (typeof url !== 'string') {
      return cb('url should be a string');
    }
    this.cmd('page.includeJs', [url], cb);
  };

  WebPage.prototype.injectJs = function (filename, cb) {
    if (typeof filename !== 'string') {
      return cb('filename should be a string');
    }
    this.cmd('page.injectJs', [filename], cb);
  };

  WebPage.prototype.openUrl = function (url, httpConf, settings, cb) {
    if (typeof url !== 'string') {
      return cb('url should be a string');
    }
    this.cmd('page.openUrl', [url, httpConf, settings], cb);
  };

  WebPage.prototype.reload = function (cb) {
    this.cmd('page.reload', cb);
  };

  WebPage.prototype.render = function (filename, cb) {
    var ext = ['png', 'gif', 'jpeg', 'pdf'];
    if (ext.indexOf(path.extname(filename.toString()).slice(1).toLocaleLowerCase()) === -1) {
      return cb(new Error('Supported formats include: ' + ext.join(', ')));
    }
    this.cmd('page.render', [filename], cb);
  };

  WebPage.prototype.renderBase64 = function (format, cb) {
    var ext = ['png', 'gif', 'jpeg'];
    if (ext.indexOf(format.toString()) === -1) {
      return cb(new Error('Supported formats include: ' + ext.join(', ')));
    }
    this.cmd('page.renderBase64', [format], cb);
  };

  WebPage.prototype.setContent = function (content, url, cb) {
    if (typeof content !== 'string') {
      return cb('content should be a string');
    }
    if (typeof url !== 'string') {
      return cb('url should be a string');
    }
    this.cmd('page.setContent', [content, url], cb);
  };

  WebPage.prototype.stop = function (cb) {
    this.cmd('page.stop', cb);
  };

  WebPage.prototype.fileUpload = function (selector, filename, cb) {
    if (typeof selector !== 'string') {
      return cb('selector should be a string');
    }
    if (typeof filename !== 'string') {
      return cb('filename should be a string');
    }
    this.cmd('page.fileUpload', [selector, filename], cb);
  };

  return WebPage;
}());
