/**
 * Exports Group
 **/
module.exports = Group;

/**
 * Dependencies
 **/
var util          = require('util');
var EventEmitter  = require('events').EventEmitter;

var Client        = require('../../lib/client');
var Members       = require('./group/members');
var Sync          = require('./group/sync');

util.inherits(Group, EventEmitter);
Object.assign(Group, new EventEmitter());
function Group(name){
    this.name = name;
    this.member = {};

    this._emit = this.emit;

    Group.emit('new', this);
};

Sync.upgrade(Group);
Members.upgrade(Group);

Group.on('new', function(instance){
    instance.syncEvents.push(/^v:.*$/);
});

Group.prototype.add = function(id, client){
    if(!id || (typeof id != 'number' && typeof id != 'string')){
        return this.emit('error', new Error('Id must be a number or a string'));
    }
    if(!client || !(client instanceof Client)){
        return this.emit('error', new Error('Client must be an instance of Client'));
    }
    if(this.member[id]){
        return this.emit('error', new Error('Member id already in use'));
    }
    this.member[id] = client;
    client.once('close',function(){
        this.remove(id);
    }.bind(this));
    return this;
};

Group.prototype.remove = function(id){
    if(!this.member[id]){
        return this.emit('error', new Error('Member ' + id + ' not exist'));
    }
    delete this.member[id];
    return this;
};
