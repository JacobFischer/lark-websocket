/**
 * Exports Router
 **/
module.exports = Router;

/**
 * Dependencies
 **/
var util          = require('util');
var EventEmitter  = require('events').EventEmitter;

var utils         = require('../../common/utils');

util.inherits(Router, EventEmitter);
function Router(){
    this.emitMe = utils.emitterWithThis(this);    
};

Router.prototype.toWebsocketApp = function(){
    var wsRouter = this;
    return function(client, request, socket, head){
        var url = request.url;
        
        var result = getApp(wsRouter, url);

        if(!result){
            client.close();
            return this;
        }

        var app = result.app;
        var param = result.args;
        
        
        if(typeof app != 'function'){
            if(app.toWebsocketApplication && typeof app.toWebsocketApplication == 'function'){
                app = app.toWebsocketApplication();
            }
            else if(app.toWebsocketApp && typeof app.toWebsocketApp == 'function'){
                app = app.toWebsocketApp();
            }
        }

        request.path_param = param || {};
        request.querystring = request.url.slice(request.url.split('?')[0].length);

        var args = [].slice.call(arguments);
        app.apply(this, args);

        client.once('close', function(){
            return wsRouter.emitMe(client, 'close', client);
        });
        wsRouter.emitMe(client, 'connect', client, request, socket, head);
        return this;
    };
};

Router.prototype.route = function(route, app){
    if(!this.routes || !Array.isArray(this.routes)){
        this.routes = [];
    }
    if(!(route instanceof RegExp)){
        route = urlToRegExp(route);
    }
    else{
        route = {
            regexp : route,
            name   : [],
        };
    }
    this.routes.push({
        route : route,
        app  : app,
    });
    return this;
};

function urlToRegExp(route){
    if(route[0] != '/') route = '/' + route;
    if(route[route.length - 1] == '/') route = route.slice(0, route.length - 1);
    var match = route.match(/(\/|^)(:[^\/]*?|\*.*?)(?=\/|$)/g);
    var routeRegExp = route.replace(/(\/|^)(:[^\/]*?|\*.*?)(?=\/|$)/g, '$1(.*?)');
    if(match){
        for(var i = 0; i < match.length; i++){
            if(match[i][0] == '/'){
                match[i] =  match[i].slice(2);
            }
            else{
                match[i] = match[i].slice(1);
            }
        }
    }
    var regexp = new RegExp('^' + routeRegExp.replace(/\//g,"\\/") + '$');
    return {
        regexp: regexp,
        name  : match,
    };
};

function getApp(wsRouter, url){
    if(!url) url = '';
    url = url.split('?')[0];
    if(url[0] != '/') url = '/' + url;
    if(url[url.length - 1] == '/') url = url.slice(0, url.length - 1);
    var routes = wsRouter.routes;
    for(var i = 0; i < routes.length; i++){
        var match = matchRoute(routes[i].route, url);
        if(match){
            return {
                app : routes[i].app,
                args : match,
            };
        }
    }
    return null;
};

function matchRoute(route, url){
    var regexp = route.regexp;
    var name   = route.name;
    var match = url.match(regexp);
    if(!match) return null;
    var result = {};
    for(var i = 1; i < match.length; i ++){
        if(name[i - 1]){
            result[name[i - 1]] = match[i];
        }
        else{
            result[i] = match[i];
        }
    }
    return result;
};
