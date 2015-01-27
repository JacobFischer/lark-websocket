var ws = require('..');

var wsRouter = ws.createRouter();

var wsApp = ws.createApp();

var global = ws.createGroup('global');

global.on('error',function(err){
    console.log(err);
    global.all().send("Error : " + err);
});

wsApp.on('connect',function(client,request){
    this.name = request.path_param.name;
    this.profession = request.path_param.profession;
    this.addr = request.path_param.addr;
    global.add(this.name, this);
    global.all().send("User " + this.name + " has connected");
});

global.setHandler('programmers', function(client){
    return client.profession == 'programmer';
});

global.setHandler('in china', function(client){
    return client.addr == 'china';
});

wsApp.on('message',function(message){
    global.all('in china').send(message).send("#CHINA#");
    global.all().send('#ALL#');
    return this;
});
   
/*
setInterval(function(){
    global.emit("error","Hahaha");
},5000);
*/

wsRouter.route('/iam/:name/:addr', wsApp);

ws.createServer(wsRouter).listen(8023);
