var ws = require('..');

var server = ws.createServer(function(client, request){
    console.log("User connected " + request.url);
    client.send("Welcome to my site");
    client.on('message', function(message){
        console.log("Received : " + message);
        client.send("I have received your message : " + message);
    });

    var interval = setInterval(function(){
        client.send("#SYSTEM#");
    },20000);
});

server.listen(8023);
