var ws   = require('..');
var http = require('http');

var app = ws.createApp();

app.on('connect', function(){
    console.log('An ws connected');
});

app.on('message', function(message){
    this.send('I have received your message ' + message);
});

http.createServer(function(req, res){
    console.log("HTTP REQUEST RECEIVED");
    res.write("Look, the page on port 8023 is available");
    res.end();
}).acceptWebsocket(app).listen(8023);
