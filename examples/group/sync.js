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

global.on('error',function(err){
    global.all.send('Error : ' + err.getMessage());
    console.log(err);
});

global.sync().send = function(message){
    redisSend.publish('ws',message);
};

redisRecv.subscribe('ws');
redisRecv.on('message',function(channel, message){
    if(channel != 'ws') return;
    global.sync().receive(message);
});

wsApp.on('connect',function(client,request){
    this.name = request.path_param.name;
    global.add(this.name, this);
    this.send("You have connected with " + os.hostname() + " at pid " + process.pid);
});

wsApp.on('message',function(message){
    console.log("Broad cast received from client : " + message);
    global.broadcast('message', message, this.name);
});

global.onbroadcast('message', function(message, sendername){
    console.log("Broad cast received from sync system : " + message);
    for(var name in global.member){
        global.member[name].send(sendername + ":" + message);
    }
});

wsRouter.route('/iam/:name', wsApp);

ws.createServer(wsRouter).listen(8023);
