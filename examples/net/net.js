var ws = require('..');

var app = ws.createApp();

app.on('connect', function(){
    console.log("A raw websocket connection established");
});

app.on('message', function(msg){
    console.log("Received : " + msg);
    this.send("OK");
});

var server = ws.net.createServer(app);

server.listen(8023);
