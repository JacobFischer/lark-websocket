var http = require('http');
var path = require('path');
var fs   = require('fs');

var file = 'ws.html';

var html = fs.readFileSync(path.join(__dirname, file));

http.createServer(function(req, res){
    res.write(html);
    res.end();
}).listen(8024);
