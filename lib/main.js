var http      = require('http');
var net       = require('net');
var init      = require('./init');
var server    = require('./server');
var Client    = require('./client');

var websocket = module.exports = {};

websocket.extend = function(handler){
    handler(this);
    return this;
};

/**
 * Extend websocket with client,
 * Support 'websocket.createClient(socket)' to create a websocket socket
 **/
websocket.createClient = function(socket){
    if(!(socket instanceof net.Socket)) throw new Error("Param socket of createClient must be an instanceof net.Socket");
    return new Client(socket);
}

/**
 * Extend websocket with net functions
 * Support 'websocket.net.createServer(app)' or 'websocket.createNetServer(app)' to
 *    start a websocket server
 * Support 'websocket.net.connect(port, host)' or 'websocket.connectNet(port, host)'
 *    to connect with a websocket server
 **/
websocket.net = {};
websocket.net.createServer =
websocket.createNetServer = function(app){
    return new net.Server().acceptWebsocket(app);
};

websocket.net.connect =
websocket.conncetNet = function(){
    var socket = net.connect.apply(net, [].slice.call(arguments));
    var client = new Client(socket);
    return client;
}

/**
 * Extend websocket with http functions
 * Support 'websocket.http.createServer(app)' or 'websocket.createServer(app)' to
 *    start a websocket server on a http server
 * Support 'websocket.connect(port, host)' or 'websocket.connect(port, host)'
 *    to connect with a websocket server on http protocol
 **/
http.Server.prototype.onListen = function(){
    var args = [].slice.call(arguments);
    init.http(this, args);
};

http.Server.prototype.acceptHttp = function(app){
    return this.on('request', app);
};

websocket.http = {};
websocket.http.createServer =
websocket.createServer = function(app){
    return new http.Server().acceptWebsocket(app);
};

websocket.http.connect =
websocket.conncet = function(){
}
