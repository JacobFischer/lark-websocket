'use strict';

var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var Server       = require('net').Server;

var init         = require('./init');

module.exports = Server;

/**
 * Make websocket requests acceptable for the server
 * Both server.acceptWebsocket(app) and
 *      server.on('websocket', app)
 * are supported
 **/
Server.prototype.acceptWebsocket = function(app){
    this._accept_websocket = true;
    if(typeof app != 'function'){
        if(app.toWebsocketApplication && typeof app.toWebsocketApplication == 'function'){
            app = app.toWebsocketApplication();
        }
        else if (app.toWebsocketApp && typeof app.toWebsocketApp == 'function'){
            app = app.toWebsocketApp();
        }
    }
    
    return this.on('websocket', app);
};

/**
 * Modify server.listen to accept websocket when
 * _accept_websocket is true
 * Specify this.onListen to do the work
 **/
Server.prototype.listen = (function(listen){
    return function(){
        var args = [].slice.call(arguments);
        this.onListen.apply(this, args);
        return listen.apply(this, args);
    };
})(Server.prototype.listen);

/**
 *
 **/
Server.prototype.onListen = function(){
    var args = [].slice.call(arguments);
    init.net(this, args);
};
