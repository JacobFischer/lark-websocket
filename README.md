# lark-websocket
Websocket webserver framework in nodejs. *Under development, unstable*

Modified by Jacob Fischer to add in client pausing/resuming so they can be passed between child processes without the pings breaking

## Install

    npm install lark-websocket

## Get started
The following example creates a new websocket server, and send a message back when received one

    var ws = require('lark-websocket');
    ws.createServer(function(client, request){
        client.on('message',function(msg){
            client.send("Received you message : " + msg);
        });
    }).listen(8023);

## Attach
Attach websocket server to an HTTP server

    require('lark-websocket');
    var http = require('http');
    http.createServer(function(req,res){...})
        .acceptWebsocket(function(client, request){...})
        .listen(8023);

*Note that requiring websocket will extend require('net').Server with acceptWebsocket. I'm still considering, maybe will remove this later*

## Extend
You can extend/modify lark-websocket directly, or use the following syntactic sugar:

    var websocket = require('lark-websocket');
    websocket.extend(function(ws){
        ws.sayHello = function(){...};
    });

By default lark-websocket has been extended with `application`, `router` and `group`

## Client
Inherits events.EventEmitter, encapsulated socket.

* `new Client(socket)`  to create a new client
* `client.send` send a message, emit `send`
* `client.receive` to receive frames. Usage `client.receive(callback)`, `callback` is called when a frame received, emit `receive`
* `client.message` to receive message. Usage `client.receive(callback)`, `callback` is called when a text frame  received, emit `message`
* `client.ping` to ping. Unfortunately, no events for this action
* `client.close` to close, emit `close`
* `client.pause` to pauses pinging and sending events. Useful to pass the socket between threads
* `client.resume` to resume from a pause
* Event `error`, emit when socket event `error` emitted
