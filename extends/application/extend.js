var Application = require('./');

module.exports = function(websocket){
    websocket.createApp = websocket.createApplication = function(){
        return new Application();
    } 
}
