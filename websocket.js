'use strict';

/**
 * Dependencies
 **/
var main  = require('./lib/main');

var application = require('./extends/application/extend');
var router      = require('./extends/router/extend');
var group       = require('./extends/group/extend');

/**
 * Export websocket
 **/
var websocket = module.exports = main;

/**
 * Extend websocket with Application/Router/Group/...
 **/
websocket.extend(application);
websocket.extend(router);
websocket.extend(group);
