'use strict';

var http = require('http');
var io = require('socket.io');
var fs = require('fs');
var path = require('path');
var Phantom = require('./phantom');

module.exports = (function () {
  function Bridge(port) {
    this.port = port || '3001';
  }

  Bridge.prototype.started = false;
  Bridge.prototype.phantoms = {};

  Bridge.prototype.stop = function () {
    this.started = false;
    if (this.server) {
      this.server.close();
    }
  };

  Bridge.prototype.start = function (cb) {
    this.started = true;
    var that = this;

    var app = http.createServer(function (req, res) {
      fs.readFile(path.join(__dirname, 'index.html'),
        function (err, data) {
          if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
          }
          data = data.toString().replace('<!--{{ script }}-->', "<script>var port = " + that.port + ";var socket = io.connect('http://localhost:' + port);</script>");
          res.writeHead(200, {"Content-Type": "text/html"});
          res.end(data);
        });
    });

    app.listen(this.port);
    this.io = io.listen(app);
    this.io.set('log level', 0);

    this.io.sockets.on('connection', function (socket) {
      socket.on('hello', function (data) {
        var ph = that.phantoms[data.phid];
        if (ph) {
          var i;
          for (i in data.properties) {
            if (data.properties.hasOwnProperty(i)) {
              ph[i] = data.properties[i];
            }
          }
          ph.emit('hello', socket);
        }
      });

      socket.on('cmd', function (data) {
        that.phantoms[data.phid].emit('cmd', data.id, data.cmd, data.args);
      });

      socket.on('error', function (data) {
        that.phantoms[data.phid].emit('error', data.msg, data.trace);
      });

      var pageEvents = [
        'alert',
        'consoleMessage',
        'confirm',
        'error',
        'filePicker',
        'initialized',
        'loadFinished',
        'loadStarted',
        'navigationRequested',
        'prompt',
        'pageCreated',
        'resourceRequested',
        'resourceReceived',
        'urlChanged',
        'resourceError'
      ];

      pageEvents.forEach(function (v) {
        socket.on('page.' + v, function (data) {
          that.phantoms[data.phid].pages[data.id].emit(v, data);
        });
      });
    });

    this.server = app;

    cb(null, this);
  };

  Bridge.prototype.addPgantom = function (ph) {
    ph.bridge = this;
    ph.id = 'ph-' + Date.now().toString() + Math.ceil(Math.random() * 10000).toString();
    this.phantoms[ph.id] = ph;
  };

  return Bridge;
}());
