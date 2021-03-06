'use strict';
/**
 * Upgrade emitters, handlers will be bond with `me` using the return function
 * emitter.emitMe = emitterWithThis(emitter);
 * emitter.emitMe(me, event [,arg1 [,arg2 ... ]])
 **/
exports.emitterWithThis = function(emitter){
    return function(){
        var args = [].slice.call(arguments);
        var me = args.shift();
        var e  = args.shift();
        this.listeners(e).forEach(function(listener){
            listener.apply(me, args);
        });
    }.bind(emitter);
}
