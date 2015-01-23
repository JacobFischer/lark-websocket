/**
 * Exports member class, which execute
 * actions for all members selected
 **/
module.exports = Members;

/**
 * Dependencies
 **/
var extend  = require('extend');

var Client  = require('../client');

function Members(group){
    this.group   = group;
    this.steps   = [];
    this._no_run_events = false;
    this._reset();
};

Members.upgrade = function(Group){
    Group.on('new', function(group){
        group.on('v:members:execute', function(steps){
            group.getMembers().execute(steps);
        });
    });

    Group.prototype.getMembers = function(filter){
        var members = new Members(this);
        if(!filter) return members;
        return members.all(filter);
    };

    /**
     * Bind member iterators to Group
     * So that use group.all() or group.find() will return the members object
     * for further actions
     **/
    Object.keys(Members.iterator).forEach(function(key){
        Members.iterator[key].forEach(function(func){
            Group.prototype[func] = function(){
                var args    = [].slice.call(arguments);
                var members = this.getMembers();
                if(typeof members[func] != 'function') return this.emit("error",new Error("Function " + func + " not found"));
                return members[func].apply(members, args);
            };
        });
    });

    Group.prototype.handler = {};

    Group.prototype.setHandler = function(id, handler){
        if(typeof id != 'string' || typeof handler != 'function') return this.emit('error', new Error('Id and handler not correct'));
        if(this.handler[id]) return this.emit('error', 'Handler ' + id + ' already exist');
        this.handler[id] = handler;
        return this;
    };
};

Members.prototype.getHandler = function(id){
    if(!id) return null;
    if(typeof id == 'function') return id;
    else if(typeof id == 'string' && this.group.handler[id]) return this.group.handler[id];
    else {
        this.group.emit('error', new Error('Handler ' + id + ' not found'));
        return null;
    }
};

Members.prototype._reset = function(){
    this.target = extend({}, this.group.member);
    return this;
};

Members.prototype._to = function(id){
    var result = {};
    if(this.target[id]){
        result[id] = this.target[id];
    }
    this.target = result;
    return this;
};

Members.prototype._each = filter(null);
Members.prototype._in   = filter(false);
Members.prototype._no   = filter(true);

function filter(del){
    return function(handler){
        handler = this.getHandler(handler);
        if(handler && typeof handler == 'function'){
            for(var id in this.target){
                var client = this.target[id];
                if(del === handler.call(client, client, id) && typeof del == 'boolean') delete this.target[id];
            }
        }
        return this;
    };
}

Members.iterator = {};
Members.iterator.reset = ['reset', 'and'];
Members.iterator.to    = ['to', 'get', 'find'];
Members.iterator.in    = ['in', 'each', 'all', 'which', 'satisfy', 'filter'];
Members.iterator.no    = ['no', 'not', 'exclude', 'except'];
Members.iterator.each  = ['each', 'every', 'foreach', 'forEach'];
Members.iterator.private = ['private', 'here','onThisProcess', 'connectedWithMe'];

Object.keys(Members.iterator).forEach(function(key){
    Members.iterator[key].forEach(function(recorder){
        var options = [];
        if(key == 'each') options.push('execute');
        Members.prototype[recorder] = Members.prototype[key] || step(key, options);
    });
});

for(var func in Client.prototype){
    if(typeof Client.prototype[func] != 'function') continue;
    Members.prototype[func] = step(func, ['execute']);
    Members.prototype['_' + func] = clientActions(func);
};

function step(key, stepOptions){
    if(key == 'private'){
        return function(){
            this._no_run_events = true;
            return this;
        };
    }
    stepOptions = stepOptions || [];
    return function(handler, options){
        options = options || {};
        var args = [].slice.call(arguments);
        this.steps.push([key].concat(args));
        if(stepOptions.indexOf('execute') >= 0){
            this.run();
        }
        return this;
    };
};

function clientActions(func){
    return function(){
        for(var id in this.target){
            var args = [].slice.call(arguments);
            var client = this.target[id];
            client[func].apply(client, args);
        };
        return this;
    };
};

Members.prototype.run = function(exec){
    if(!exec && !this._no_run_events){
        this.group.emit('v:members:execute', this.steps);
        /**
         * In event model(for sync model), they don't record the iterator
         * after any emit, so need to record the previous
         * iterator steps for further actions
         **/
        this.steps.pop();
        return this;
    }
    console.log(this.steps);
    var step = null;
    while(step = this.steps.shift()){
        this['_' + step.shift()].apply(this, step);
    }
};

Members.prototype.execute = function(steps){
    if(!steps || !Array.isArray(steps)) throw new Error("Invalid steps for member execution");
    this.steps = steps;
    this.run(true);
};
