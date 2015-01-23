var ws = require('..');

var client = ws.net.connect(8023,'localhost');

client.on('error', function(err){
    console.log('Got an Error : '+err.message);
});

client.on('close', function(){
    console.log("Connection closed");
});

client.send("How are you");

client.on('message',function(msg){
    console.log("Receive:"+msg);
});
