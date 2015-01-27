var ws   = require('..');
var http = require('http');

var app = function(client ,request){
    client.on('message', function(message){
        console.log(message);
        client.send('I have received your message ' + message);
    });
}

http.createServer(function(req, res){
    res.write("Look, the page on port 8023 is available");
    res.end();
}).acceptWebsocket(app).listen(8023,function(){
    console.log("Listening at port 8023...");   
});
