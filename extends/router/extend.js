var Router = require('./');

module.exports = function(websocket){
    websocket.createRouter = function(){
        return new Router();
    }
};
