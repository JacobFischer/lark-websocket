/*
var redis_host = 'replace here with redis host';
var redis_port = 'replace here with redis port';
*/
/*eg:*/
var redis_host = 'dbl-wise-rdtest18.vm';
var redis_port = 6379;
/**/

var redis = require('redis');

var redisClient = redis.createClient(redis_port, redis_host);

var ws = require('..');

var wsRouter = ws.createRouter();

var wsApp = ws.createApp();

var global = ws.createGroup('global');

global.persistence().set = function(key, value, callback){
    redis.hset('ws:'+global.name, key, value, callback);
};

global.persistence().get = function(key, callback){
    redis.hget('ws:'+global.name, key, callback);
};

wsApp.on('connect',function(client,request){
    this.name = request.path_param.name;
    global.add(this.name, this);
});

wsApp.on('message',function(message){
    global.all().send(this.name + ':' + message);
    return this;
});
   
wsRouter.route('/iam/:name', wsApp);

ws.createServer(wsRouter).listen(8023);
