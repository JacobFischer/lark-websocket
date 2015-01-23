var main = module.exports  = {};

var Client      = require('./client');
var upgrade     = require('./upgrade');

main.http = function(server, listen_args){
    server.on('upgrade',function(request, socket, head){
        if(!server._accept_websocket) return;
        var args = [].slice.call(arguments);
        var socket = upgrade.apply(server, args);
        var client = new Client(socket,{role:'server'});
        return server.emit('websocket', client, request, socket, head);
    });
}

main.net = function(server, listen_args){
    server.on('connection', function(socket){
        if(!server._accept_websocket) return;
        var args = [].slice.call(arguments);
        var client = new Client(socket,{role:'server'});
        return server.emit('websocket', client);
    });
};
