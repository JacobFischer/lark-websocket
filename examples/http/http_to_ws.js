var ws   = require('..');
var http = require('http');

var app = function(client, request){
    client.on('connect', function(){
        console.log('An ws connected');
    });

    client.on('message', function(message){
        client.send('I have received your message ' + message);
    });
}

http.createServer(function(req, res){
    console.log("HTTP REQUEST RECEIVED");
    res.write("Look, the page on port 8023 is available");
    res.end();
}).acceptWebsocket(app).listen(8023);
