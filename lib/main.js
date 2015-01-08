module.exports  = main;

var Client      = require('./client');
var upgrade     = require('./upgrade');

function main(server, listen_args){
    return function(request, socket, head){
        var args = [].slice.call(arguments);
        if(!server._accept_websocket) return;
        var socket = upgrade.apply(server, args);
        var client = new Client(socket);
        return server.emit('websocket', client, request, args);
    }
}
