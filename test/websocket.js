'use strict';

/**
 * Module to test : main module
 **/
var ws = require('..');

/**
 * Dependencies
 **/
var net       = require('net');
var http      = require('http');
var WsServer  = require('../lib/server');
var WsClient  = require('../lib/client');

describe('Websocket', function(){
    it('should be an object', function(done){
        ws.should.be.an.instanceof(Object);
        done();
    });
    it('can create websocket server', function(done){
        ws.createServer.should.be.an.instanceof(Function);
        var server1 = ws.createServer(function(){});
        server1.should.be.an.instanceof(WsServer);
        ws.http.should.be.an.instanceof(Object);
        var server2 = ws.http.createServer(function(){});
        server2.should.be.an.instanceof(WsServer);
        done();
    });
    it('can create websocket client', function(done){
        ws.createClient.should.be.an.instanceof(Function);
        var socket = new net.Socket();
        var client = ws.createClient(socket);
        client.should.be.an.instanceof(WsClient);
        done();
    });
    it('should be extendable', function(done){
        ws.extend.should.be.an.instanceof(Function);
        ws.extend(extendWithHello);
        ws.hello.should.be.an.instanceof(Function);
        ws.hello().should.equal('Hello');
        done();
    });
    it('can create raw websocket server', function(done){
        ws.net.should.be.an.instanceof(Object);
        ws.net.createServer.should.be.an.instanceof(Function);
        ws.createNetServer.should.be.an.instanceof(Function);
        var server1 = ws.net.createServer(function(){});
        server1.should.be.an.instanceof(net.Server);
        var server2 = ws.createNetServer(function(){});
        server2.should.be.an.instanceof(net.Server);
        done();
    });
    it('can create raw websocket connections', function(done){
        ws.net.should.be.an.instanceof(Object);
        ws.net.connect.should.be.an.instanceof(Function);
        ws.connectNet.should.be.an.instanceof(Function);
        done();
    });
});


/**
 * To help test
 **/
function extendWithHello(ws){
    ws.hello = function(){
        return 'Hello';
    }
}
