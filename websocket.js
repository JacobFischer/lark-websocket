/**
 * Export websocket
 **/
var websocket   = module.exports = {};

/**
 * Dependencies
 **/
var util        = require('util');
var HttpServer  = require('http').Server;

var main        = require('./lib/main');
var Application = require('./lib/application');
var Router      = require('./lib/router');
var Group       = require('./lib/group');

/**
 * Extend HttpServer with acceptHttp/acceptWebsocket methods
 * for both http and websocket request
 * Support 'http.createServer(app).acceptWebsocket(wsApp).listen(port)'
 **/
HttpServer.prototype.acceptWebsocket = function(app){
    this._accept_websocket = true;
    if(app instanceof Application || app instanceof Router){
        app = app.toWebsocketApp();
    }
    return this.on('websocket', function(client, request, wsArgs){
        app.call(client, request, client, wsArgs);
    });
};

HttpServer.prototype.acceptHttp = function(app){
    return this.on('request', app);
};

HttpServer.prototype.listen = (function(listen){
    return function(){
        var args = [].slice.call(arguments);
        this.on('upgrade', main(this , args));
        return listen.apply(this, args);
    };
})(HttpServer.prototype.listen);


/**
 * Support 'ws.createServer(wsApp).listen(port)'
 **/
websocket.createServer = function(wsApp){
    return new HttpServer().acceptWebsocket(wsApp);
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
