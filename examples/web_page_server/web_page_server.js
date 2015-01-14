var http = require('http');
var path = require('path');

var html = require('fs').readFileSync(path.join(__dirname, 'ws.html'));

http.createServer(function(req, res){
    res.write(html);
    res.end();
}).listen(8024);
