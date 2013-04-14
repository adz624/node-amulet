## node-amulet

當 Node.js 遇上鬼 !! (驚

node-amulet 利用 websocket 溝通 node.js phantom.js，跟 [node-phantom](https://github.com/alexscheelmeyer/node-phantom) 作法相同，既然有現成的那幹嘛自己再做一個？純粹是為了滿足自幹的欲望... 然後順便可以了解 phantom.js 的詳細用法、API。

### WebPage Properties

* 可以使用

    content viewportSize

* 還不能使用

    clipRect canGoBack canGoForward cookies customHeaders event focusedFrameName frameContent frameName framePlainText frameTitle frameUrl framesCount framesName libraryPath navigationLocked offlineStoragePath offlineStorageQuota ownsPages pages pagesWindowName paperSize plainText scrollPosition settings title url windowName zoomFactor

### 安裝

    npm install node-amulet

### 用法

require

    var Phantom = require('node-amulet');

新增 phantom

    var ph = new Phantom('3001'); // 3001 是 websocket 的 port

    // or
    
    var bridge = new Phantom.Bridge('3001');
    var ph = new Phantom(bridge);

    // or

    var ph = Phantom.create();

新增 page

    var page = new Phantom.WebPage(ph);

    // or

    var page = ph.createPage();

開網址

    page.open('httP://google.com/', function (status) {
    });

監聽事件

    page.on('loadFinished', function (data) {
      console.log(data.status);
    });

### License

(The MIT License)

Copyright (c) 2013 Po-Ying Chen
