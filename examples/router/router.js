var ws = require('..');

var wsRouter = ws.createRouter();
var wsAppBoy      = ws.createApp();
var wsAppGirl     = ws.createApp();

var wsAppAnonymous  = function(client, req){
    console.log("An anonymous has connected");

    console.log(req.path_param);
    this.on('message', function(message){
        console.log("Message[Anony] : " + message);
        this.send("^_^");
    });

    this.on('close', function(){
        console.log("An anonymous client has disconnected");
    });
};

wsAppBoy.on('connect',function(client, req){
    console.log(req.path_param);
    console.log(req.querystring);

    console.log("A client has connected with boy");
    this.send("Welcome to my site, boy");
});

wsAppBoy.on('message', function(message){
    this.send("^_^");
    console.log("Message[Boy] : " + message);
});

wsAppBoy.on('close', function(){
    console.log("A client has disconnected from boy");
});

wsAppGirl.on('connect',function(client, req){
    console.log("A client has connected with girl");
    console.log(req.path_param);
    console.log(req.querystring);
    this.send("Welcome to my site, girl");
});

wsAppGirl.on('message', function(message){
    this.send("^_^");
    console.log("Message[Girl] : " + message);
});

wsAppBoy.on('close', function(){
    console.log("A client has disconnected from girl");
});

wsRouter
  .route('/boy/:grade/:name',   wsAppBoy)
  .route(':name/girl',  wsAppGirl)
  .route('/vip/*ext/welcome/*ext2',    wsAppAnonymous);

ws.createServer(wsRouter).listen(8023);
