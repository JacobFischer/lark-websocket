var ws = require('..');

ws.createServer(function(request, client){
    console.log("User connected");
    client.send("Welcome to my site");
    client.on('message', function(message){
        console.log("Received : " + message);
        client.send("I have received your message : " + message);
    });

    var interval = setInterval(function(){
        client.send("#SYSTEM#");
    },20000);
}).listen(8023);
