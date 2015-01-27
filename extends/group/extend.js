var Group = require('./');

module.exports = function(websocket){
    websocket.createGroup = function(name){
        return new Group(name);
    }
};
