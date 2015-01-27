var ws = require('..');

var app = function(client, request){
    client.on('connect', function(){
        console.log("A raw websocket connection established");
    });

    client.on('message', function(msg){
        console.log("Received : " + msg);
        client.send("OK");
    });
}

var server = ws.net.createServer(app);

server.listen(8023);
