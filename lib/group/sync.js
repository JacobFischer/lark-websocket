module.exports = Sync;

function Sync(group){
    this.group = group;
    upgrade(group, this);
};

Sync.upgrade = function(Group){
    Group.prototype.sync = function(){
        if(!this.syncObj){
            this.syncObj = new Sync(this);
        }
        return this.syncObj;
    };

    Group.prototype.isSync = function(){
        return !!this.syncObj;
    };
};

function upgrade(group, sync){
    group._none_sync_emit = group.emit;
    group.emit = function(){
        var args = [].slice.call(arguments);
        if(!sync.send) return this.emit.apply(this, args);
        var msg = JSON.stringify(args);
        sync.send(msg);
        return this;
    };
    sync.receive = function(message){
        var args = JSON.parse(message);
        group._none_sync_emit.apply(group, args);
    };
};
