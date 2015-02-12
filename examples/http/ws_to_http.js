var ws   = require('..');

var app = function(client ,request){
    client.on('message', function(message){
        console.log(message);
        client.send('I have received your message ' + message);
    });
}

ws.createServer(app).acceptHttp(function(req, res){
    res.write("Look, the page on port 8023 is available");
    res.end();
}).listen(8023,function(){
    console.log("Listening at port 8023...");   
});
