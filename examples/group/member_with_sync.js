/*
var redis_host = 'replace here with redis host';
var redis_port = 'replace here with redis port';
*/
/*eg:*/
var redis_host = 'dbl-wise-rdtest18.vm';
var redis_port = 6379;
/**/

var os    = require('os');
var redis = require('redis');

var redisSend = redis.createClient(redis_port, redis_host);
var redisRecv = redis.createClient(redis_port, redis_host);

var ws = require('..');

var wsRouter = ws.createRouter();

var wsApp = ws.createApp();

var global = ws.createGroup('global');

global.sync().send = function(message){
    redisSend.publish('ws',message);
};

redisRecv.subscribe('ws');
redisRecv.on('message',function(channel, message){
    if(channel != 'ws') return;
    global.sync().receive(message);
});

global.on("error", function(err){
    console.log(err);
    global.all().connectedWithMe().send("Server ["+ os.hostname() + " pid : " +process.pid+ "] Group Error : " + err.message);
}.bind(this));

wsApp.on('connect',function(client,request){
    this.name = request.path_param.name;
    this.profession = request.path_param.profession;
    this.addr = request.path_param.addr;
    this.send("You have connected with " + os.hostname() + " at pid " + process.pid);
    global.add(this.name, this);
    global.all().send("User " + this.name + " has connected");
});

global.setHandler('programmers', function(client){
    return client.profession == 'programmer';
});

global.setHandler('in china', function(client){
    return client.addr == 'china';
});

wsApp.on('message',function(message){
    global.all('in china').send(message).send("#CHINA#");
    global.all().send('#ALL#');
    global.emit('error', new Error("ERROR"));
    return this;
});
   
/*
setInterval(function(){
    global.emit("error","Hahaha");
},5000);
*/

wsRouter.route('/iam/:name/:addr', wsApp);

ws.createServer(wsRouter).listen(8023);
