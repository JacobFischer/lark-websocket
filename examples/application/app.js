var ws = require('..');

var app = ws.createApp();

app.on('connect', function(client, request){
    console.log('An user has connected, url is ' + request.url);
});

app.on('message', function(message){
    console.log("Received : " + message);
    this.send("I have received your message : " + message);
});

app.on('close', function(){
    console.log('An user has disconnected');
});

ws.createServer(app).listen(8023);
