var ws = require('..');

var wsRouter = ws.createRouter();

var wsApp = ws.createApp();

var global = ws.createGroup();

wsApp.on('connect',function(client, request){
    this.name = request.path_param.name;
    global.add(this.name, this);
});

wsApp.on('message',function(message){
    global.all().send(this.name + ':' + message);
    return this;
});
   
wsRouter.route('/iam/:name', wsApp);

ws.createServer(wsRouter).listen(8023);
