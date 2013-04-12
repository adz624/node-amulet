/*global phantom*/

'use strict';

var webpage = require('webpage');
var system = require('system');
var port = system.args[1] || '80';
var phid = system.args[2] || null;

if (!phid) {
  phantom.exit();
}

var indexPage = webpage.create();

indexPage.open('http://localhost:' + port, function (status) {
  if (status !== 'success') {
    phantom.exit();
  }

  var pages = {};

  console.log(phid + ' phantom 開始執行');

  indexPage.evaluate(function (phid, properties) {
    socket.emit('hello', {phid: phid, properties: properties});

    socket.on('cmd', function (data) {
      alert(JSON.stringify(data));
    });
  }, phid, {
    args: phantom.args,
    cookiesEnabled: phantom.cookiesEnabled,
    libraryPath: phantom.libraryPath,
    scriptName: phantom.scriptName,
    version: phantom.version
  });

  function respond(data) {
    data.phid = phid;
    indexPage.evaluate(function (data) {
      socket.emit('cmd', data);
    }, data);
  }

  function emit(event, data) {
    data.phid = phid;
    indexPage.evaluate(function (event, data) {
      socket.emit(event, data);
    }, event, data);
  }

  var cmds = {
    'exit': function () {
      phantom.exit();
    },
    'cookies': function (data) {
      data.args = [null, phantom.cookies];
      respond(data);
    },
    'addCookie': function (data) {
      var err = null, success;
      try {
        success = phantom.addCookie(data.args[0]);
      } catch (e) {
        err = e;
      }
      data.args = [err, success];
      respond(data);
    },
    'clearCookies': function (data) {
      phantom.clearCookies();
      data.args = [];
      respond(data);
    },
    'deleteCookie': function (data) {
      if (typeof data.args[0] !== 'string') {
        data.args = [new Error('cookieName should be a string')];
        respond(data);
        return;
      }
      data.args = [null, phantom.deleteCookie(data.args[0])];
      respond(data);
    },
    'injectJs': function (data) {
      if (typeof data.args[0] !== 'string') {
        data.args = [new Error('filename should be a string')];
        respond(data);
        return;
      }
      data.args = [null, phantom.injectJs(data.args[0])];
      respond(data);
    },
    'page.create': function (data) {
      var page = webpage.create();
      var id = data.args[0];
      page.onAlert = function (msg) {
        emit('page.alert', {
          id: id,
          msg: msg
        });
      };
      page.onConfirm = function (msg) {
        emit('page.confirm', {
          id: id,
          msg: msg
        });
      };
      page.onConsoleMessage = function (msg, lineNum, sourceId) {
        emit('page.consoleMessage', {
          id: id,
          msg: msg,
          lineNum: lineNum,
          sourceId: sourceId
        });
      };
      page.onError = function (msg, trace) {
        emit('page.error', {
          id: id,
          msg: msg,
          trace: trace
        });
      };
      page.onFilePicker = function () {
        emit('page.filePicker', {
          id: id
        });
      };
      page.onInitialized = function () {
        emit('page.initialized', {
          id: id
        });
      };
      page.onLoadFinished = function (status) {
        emit('page.loadFinished', {
          id: id,
          status: status
        });
      };
      page.onLoadStarted = function () {
        emit('page.loadStarted', {
          id: id
        });
      };
      page.onNavigationRequested = function (url, type, willNavigate, main) {
        emit('page.navigationRequested', {
          id: id,
          url: url,
          type: type,
          willNavigate: willNavigate,
          main: main
        });
      };
      page.onPageCreated = function (newPage) {
        emit('page.pageCreated', {
          id: id,
          newPage: newPage
        });
      };
      page.onPrompt = function (msg, defaultVal) {
        emit('page.prompt', {
          id: id,
          msg: msg,
          defaultVal: defaultVal
        });
      };
      page.onResourceRequested = function (requestData, networkRequest) {
        emit('page.resourceRequested', {
          id: id,
          requestData: requestData,
          networkRequest: networkRequest
        });
      };
      page.onResourceReceived = function (response) {
        emit('page.resourceReceived', {
          id: id,
          response: response
        });
      };
      page.onUrlChanged = function (targetUrl) {
        emit('page.urlChanged', {
          id: id,
          targetUr: targetUrl
        });
      };
      page.onResourceError = function (resourceError) {
        emit('page.resourceError', {
          id: id,
          resourceError: resourceError
        });
      };
      pages[data.args[0]] = page;
      data.args = [];
      respond(data);
    },
    'page.close': function (data) {
      var id = data.args[0];
      pages[id].close();
      delete pages[id];
      data.args = [];
      respond(data);
    },
    'page.open': function (data) {
      var page = pages[data.args[0]];
      page.open(data.args[1], function (status) {
        data.args = [null, status];
        respond(data);
      });
    },
    'page.evaluate': function (data) {
      var page = pages[data.args[0]];
      var val = page.evaluate.apply(page, data.args.slice(1));
      data.args = [null, val];
      respond(data);
    },
    'page.addCookie': function (data) {
      var err = null, success;
      try {
        success = pages[data.args[0]].addCookie(data.args[1]);
      } catch (e) {
        err = e;
      }
      data.args = [err, success];
      respond(data);
    },
    'page.clearCookies': function (data) {
      pages[data.args[0]].clearCookies();
      data.args = [];
      respond(data);
    },
    'page.deleteCookie': function (data) {
      var success = pages[data.args[0]].deleteCookie(data.args[1]);
      data.args = [null, success];
      respond(data);
    },
    'page.evaluateJavascript': function (data) {
      pages[data.args[0]].evaluateJavascript(data.args[1]);
      data.args = [];
      respond(data);
    },
    'page.go': function (data) {
      pages[data.args[0]].go(data.args[1]);
      data.args = [];
      respond(data);
    },
    'page.goBack': function (data) {
      pages[data.args[0]].goBack();
      data.args = [];
      respond(data);
    },
    'page.goForward': function (data) {
      pages[data.args[0]].goForward();
      data.args = [];
      respond(data);
    },
    'page.includeJs': function (data) {
      pages[data.args[0]].includeJs(data.args[1], function () {
        data.args = [];
        respond(data);
      });
    },
    'page.injectJs': function (data) {
      var success = pages[data.args[0]].injectJs(data.args[1]);
      data.args = [null, success];
      respond(data);
    },
    'page.openUrl': function (data) {
      pages[data.args[0]].openUrl(data.args[1], data.args[2], data.args[3]);
      data.args = [];
      respond(data);
    },
    'page.reload': function (data) {
      pages[data.args[0]].reload();
      data.args = [];
      respond(data);
    },
    'page.render': function (data) {
      pages[data.args[0]].render(data.args[1]);
      data.args = [];
      respond(data);
    },
    'page.renderBase64': function (data) {
      var base64 = pages[data.args[0]].renderBase64(data.args[1]);
      data.args = [null, base64];
      respond(data);
    },
    'page.setContent': function (data) {
      pages[data.args[0]].setContent(data.args[1], data.args[2]);
      data.args = [];
      respond(data);
    },
    'page.stop': function (data) {
      pages[data.args[0]].stop();
      data.args = [];
      respond(data);
    },
    'page.uploadFile': function (data) {
      pages[data.args[0]].uploadFile(data.args[1], data.args[2]);
      data.args = [];
      respond(data);
    }
  };

  phantom.onError = function (msg, trace) {
  };

  indexPage.onAlert = function (data) {
    data = JSON.parse(data);
    console.log('cmd: ' + data.cmd);
    if (cmds.hasOwnProperty(data.cmd)) {
      cmds[data.cmd](data);
    }
  };
});
