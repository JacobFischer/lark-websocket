var crypto = require('crypto');

var upgrade = module.exports = function(request, socket, head){
    var shasum = crypto.createHash('sha1');
    var key = request.headers['sec-websocket-key'];
    key += '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    key = shasum.update(key).digest('base64');
    var responseHeader = 
            'HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
            'Upgrade: WebSocket\r\n' +
            'Connection: Upgrade\r\n' +
            'Sec-WebSocket-Accept: ' + key + '\r\n' +
            '\r\n';

    socket.write(responseHeader);

    return socket;
}
