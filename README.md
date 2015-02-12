# vi-websocket
Websocket webserver framework in nodejs. *Under development, unstable*

## Install

    npm install vi-websocket

## Get started
The following example creates a new websocket server, and send a message back when received one

    var ws = require('vi-websocket');
    ws.createServer(function(client, request){
        client.on('message',function(msg){
            client.send("Received you message : " + msg);
        });
    }).listen(8023);

## Attach
Attach websocket server to an HTTP server

    require('vi-websocket');
    var http = require('http');
    http.createServer(function(req,res){...})
        .acceptWebsocket(function(client, request){...})
        .listen(8023);

*Note that requiring websocket will extend require('net').Server with acceptWebsocket. I'm still considering, maybe will remove this later*

## Extend
You can extend/modify vi-websocket directly, or use the following syntactic sugar:

    var websocket = require('vi-websocket');
    websocket.extend(function(ws){
        ws.sayHello = function(){...};
    });

By default vi-websocket has been extended with `application`, `router` and `group`

## Client
Inherits events.EventEmitter, encapsulated socket.

* `new Client(socket)`  to create a new client
* `client.send` send a message, emit `send`
* `client.receive` to receive frames. Usage `client.receive(callback)`, `callback` is called when a frame received, emit `receive`
* `client.message` to receive message. Usage `client.receive(callback)`, `callback` is called when a text frame  received, emit `message`
* `client.ping` to ping. Unfortunately, no events for this action
* `client.close` to close, emit `close`
* Event `error`, emit when socket event `error` emitted
