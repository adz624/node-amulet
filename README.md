# node-amulet

當 Node.js 遇上鬼 !! (驚

node-amulet 利用 websocket 溝通 node.js phantom.js，跟 [node-phantom](https://github.com/alexscheelmeyer/node-phantom) 作法相同，既然有現成的那幹嘛自己再做一個？純粹是為了滿足自幹的欲望... 有然後順便可以了解 phantom.js 的詳細用法、API。

## 安裝 Installation

    npm install node-amulet

## 用法 Usage

require

    var Phantom = require('node-amulet');

建立 phantomjs

    var ph = new Phantom();

    // or

    var ph = new Phantom('3001'); // 3001 是 websocket 的 port

    // or
    
    var bridge = new Phantom.Bridge('3001');
    var ph = new Phantom(bridge);

    // or

    var ph = Phantom.create();

新增 WebPage

    var page = new Phantom.WebPage(ph);

    // or

    var page = ph.createPage();

開網址

    page.open('httP://google.com/', function (err, status) {
    });

監聽事件

    page.on('loadFinished', function (data) {
      console.log(data.status);
    });

## License

(The MIT License)

Copyright (c) 2013 Po-Ying Chen
