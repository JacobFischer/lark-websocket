'use strict';

module.exports = websocket_server;

var util         = require('util');
var EventEmitter = require('events').EventEmitter;

var Application = require('./extend/application');
var Router      = require('./extend/router');

function websocket_server(Server){
    /**
     * Make websocket requests acceptable for the server
     * Both server.acceptWebsocket(app) and
     *      server.on('websocket', app)
     * are supported
     **/
    Server.prototype.acceptWebsocket = function(app){
        this._accept_websocket = true;
        if(app instanceof Application || app instanceof Router){
            app = app.toWebsocketApp();
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

    return Server;
};
