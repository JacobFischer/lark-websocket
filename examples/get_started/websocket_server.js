var ws = require('..');

var server = module.exports = ws.createServer(function(client, request){
    console.log("User connected " + request.url);
    client.send("Welcome to my site");
    client.on('message', function(message){
        console.log("Received : " + message);
        client.send("I have received your message : " + message);
    });
    client.on('close', function (client) {
        console.log("Connection closed!");
    });

    var interval = setInterval(function(){
        !client.closed && client.send("#SYSTEM#");
    },20000);
});

server.listen(8023,function(){
    console.log("Listening at 8023 ...");
});
