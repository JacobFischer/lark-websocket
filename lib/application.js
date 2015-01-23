/**
 * Exports Application
 **/
module.exports = Application;

/**
 * Dependencies
 **/
var util          = require('util');
var EventEmitter  = require('events').EventEmitter;

var utils         = require('./utils');

util.inherits(Application, EventEmitter);
function Application(){
    this.emitMe = utils.emitterWithThis(this);    
};

/**
 * Returns a function that will emit every
 * event together with the client events
 **/
Application.prototype.toWebsocketApp = function(){
    var wsApp = this;
    return function(client, request, socket, head){
        wsApp.client = client;
        client.emit = (function(old){
            return function(){
                var args = [].slice.call(arguments);
                old.apply(client, args);
                args.unshift(client);
                wsApp.emitMe.apply(wsApp, args);
            };
        })(client.emit);
        return wsApp.emitMe(client, 'connect', client, request, socket, head);
    };
};
