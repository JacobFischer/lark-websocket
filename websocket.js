'use strict';
/**
 * Export websocket
 **/
var websocket   = module.exports = {};

/**
 * Dependencies
 **/
var util        = require('util');
var net         = require('net');
var NetServer   = require('net').Server;
var HttpServer  = require('http').Server;

var websocket_server = require('./server.js');
var main        = require('./lib/main');
var Application = require('./lib/application');
var Client      = require('./lib/client');
var Router      = require('./lib/router');
var Group       = require('./lib/group');

websocket_server(NetServer);

NetServer.prototype.onListen  = function(){
    var args = [].slice.call(arguments);
    main.net(this, args);
};

HttpServer.prototype.onListen = function(){
    var args = [].slice.call(arguments);
    main.http(this, args);
};

HttpServer.prototype.acceptHttp = function(app){
    return this.on('request', app);
};

websocket.http = {};
websocket.net  = {};
/**
 * Support   'ws.createServer(wsApp).listen(port)'
 * short for 'ws.http.createServer(wsApp).listen(port)'
 * to create a http server with websocket supported
 **/
websocket.http.createServer =
websocket.createHttpServer  =
websocket.createServer = function(wsApp){
    return new HttpServer().acceptWebsocket(wsApp);
};

/**
 * Support   'ws.createNetServer(wsApp).listen(port)'
 * short for 'ws.net.createServer(wsApp).listen(port)'
 * to create a socket server with websocket supported
 **/
websocket.net.createServer =
websocket.createNetServer = function(wsApp){
    return new NetServer().acceptWebsocket(wsApp);
};

websocket.net.connect = 
websocket.connectNet = function(){
    var socket = net.connect.apply(net, [].slice.call(arguments));
    var client = new Client(socket);
    return client;
};

websocket.createClient = function(socket){
    return new Client(socket);
};

websocket.createServerClient = function(socket){
    return new Client(socket, { role : 'server'});
};

/**
 * Support 'ws.createApp() or ws.createApplication()'
 **/
websocket.createApp = websocket.createApplication = function(){
    return new Application([].slice.call(arguments));
}

/**
 * Support 'ws.createRouter()'
 **/
websocket.createRouter = function(){
    return new Router([].slice.call(arguments));
}

/**
 * Support 'ws.createGroup(name)'
 **/
websocket.createGroup = function(name){
    return new Group(name);
};
