/**
 * Exports sync
 **/
module.exports = Sync;

var util            = require('util');
var EventEmitter    = require('events').EventEmitter;

/**
 * Define Sync class for sync functions
 * Use Sync.upgarde(group) to upgrade group with sync ability.
 **/
util.inherits(Sync, EventEmitter);
function Sync(group){
    this.group = group;
    upgrade(group, this);
};

/**
 * Upgrade Group class with sync prototypes
 **/
Sync.upgrade = function(Group){
    /**
     * Events in syncEvents will be broadcast
     * Support Regexp
     **/
    Group.prototype.syncEvents = [];

    /**
     * When group.sync is called, create a new Sync object
     * and bind with the group.
     **/
    Group.prototype.sync = function(){
        if(!this.syncObj){
            this.syncObj = new Sync(this);
        }
        return this.syncObj;
    };

    /**
     * If the Sync object is created, means
     * sync model is enabled
     **/
    Group.prototype.isSync = function(){
        return !!this.syncObj;
    };
};

/**
 **/
function upgrade(group, sync){
    broadcast(group, sync);
    syncEvents(group, sync);
};

/**
 **/
function broadcast(group, sync){
    var broadcast = new EventEmitter();
    /**
     **/
    group.broadcast = function(){
        if(!sync.send) return this.emit('error', new Error("Can not broadcast without [function send] undefined"));
        var args = [].slice.call(arguments);
        for(var i = 0; i < args.length; i++){
            var arg = args[i];
            if(typeof arg == 'object' && typeof arg.constructor == 'function'
               && arg.constructor.name != 'Object'
               && arg.constructor.name != 'Array'
               && arg instanceof arg.constructor){
                   return this.emit('error', new Error("Can not broadcast [object " + arg.constructor.name + "]"));
            }
        }
        var msg = JSON.stringify(args);
        sync.emit('send');
        sync.send(msg);
        return this;
    };

    group.onbroadcast = function(){
        broadcast.on.apply(broadcast, [].slice.call(arguments));
    };

    /**
     **/
    sync.receive = function(message){
        var args = JSON.parse(message);
        sync.emit('receive', args);
        broadcast.emit.apply(broadcast, args);
    };
};

function syncEvents(group, sync){
    group.emit = (function(old_emit){
        return function(e){
            var args = [].slice.call(arguments);
            var events = group.syncEvents;
            if(typeof e != 'string' || !Array.isArray(events)) return group._sync_emit.apply(group, args);
            var emitted = false;
            for(var i = 0; i<events.length; i++){
                var eve = events[i];
                if((typeof eve == 'string' && eve == e) ||
                   (eve instanceof RegExp && e.match(eve))){
                   group.broadcast.apply(group, args);
                   emitted = true;
                }
            };
            if(!emitted) return old_emit.apply(group, args);
            return this;
        };
    })(group.emit);

    sync.on('receive', function(args){
        var e = args[0];
        var events = group.syncEvents;
        if(typeof e != 'string' || !Array.isArray(events)) return;
        for(var i = 0; i<events.length; i++){
            var eve = events[i];
            if((typeof eve == 'string' && eve == e) ||
               (eve instanceof RegExp && e.match(eve))){
               group._emit.apply(group, args);
               return this;
            }
        };
        return this;
    });
};
