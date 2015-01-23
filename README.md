# vi-websocket
A websocket framework for mobile web apps.

## Get Started
For the most common case, you can start a websocket server by creating a websocket server just like using http module.

    var ws = require('vi-websocket');
    ws.createServer(function(client, request){
        //Handle the connection with client and request
    }).listen(8023, function(){
        console.log("Listening for websocket connections on port 8023 ...");
    }

The arg `client` is an instance of `Client` which encapsulate an instance of `net.Socket` to handle the details of communication with websocket protocal. Typically, `client.on('message',on_message)` is used to handle each message from the browser. `client.send(message)` is used to send message to the browser.

    var ws = require('vi-websocket');
    ws.createServer(function(client, request){
        console.log("A connection has established");
        client.send("Welcome to my site!");
        client.on('message',function(msg){
            console.log("A message received : " + msg);
            client.send("I have received your message : " + msg);
        });
    }).listen(8023, function(){
        console.log("Listening for websocket connections on port 8023 ...");
    });

Then you can start a new websocket connection on the browser:

    var ws = new WebSocket("ws://localhost:8023/");
    ws.onmessage = function(e){
        console.log("Data received : " + e.data);
    };
    ws.onopen = function(){
        ws.send("Nice to meet you, my name is Jack");
    }

## To Be Continued ...
