var util         = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = Client;

util.inherits(Client, EventEmitter);
function Client(socket){
    this._socket    = socket;
    listen(this);
}

Client.prototype.receive = function(callback){
    this.on('receive', callback);
    return this;
};

Client.prototype.send = function(data, type){
    if(!type) type = 'text';
    if(type == 'text'){
        data = new Buffer(data);
    }
    this.emit('send', data, type, this);
    send(this, data, type);
    return this;
};

Client.prototype.close = function(){
    this._socket.end();
    return this;
};

function listen(client){
    var data = new Buffer(0);
    var frame = {};
    client._socket.on('data',function(chunk){
        //console.log("On Data");
        //console.log(chunk);
        data = Buffer.concat([data,chunk]);

        if(frame.wait > chunk.length){
            frame.wait -= chunk.length;
            //console.log('wait');
            return;
        }

        frame = tr2ori(data);

        if(frame.wait){
            //console.log("Wait");
            return;
        }

        //console.log("On Frame");
        //console.log("FIN:"+frame.FIN);
        //console.log("OPCODE:"+frame.OPCODE);

        if(frame.next){
            data = frame.next;
            delete frame.next;
        }
        else{
            data = Buffer(0);
        }

        if(frame.OPCODE == 8){
            return client._socket.end();
        }

        if(frame.OPCODE == 0x9){
            console.log("Ping from client ...");
            var pong = ori2tr('pong');
            return client._socket.write(pong);
        }

        if(frame.OPCODE == 0xA){
            console.log("Pong from client ...");
            return;
        }

        if(frame.FIN){
            client.emit('receive', frame.DATA, client);
            if(frame.OPCODE == 1){
                client.emit('message', frame.DATA.toString(), client);
            }
            frameData = '';
        }
    });

    var pingTime = client._socket.server.timeout / 4;
    if(pingTime < 10000) pingTime = pingTime * 2;
    var inter = setInterval(function(){
        console.log("Ping client ...");
        var ping = ori2tr('ping');
        client._socket.write(ping);
    },client._socket.server.timeout / 2);

    client._socket.on('close',function(){
        console.log("Close");
        clearInterval(inter);
        client.emit('close', client);
    });
}

function send(client, data, type){
    var trasportData = ori2tr(type, data);
    client._socket.write(trasportData);
}

function tr2ori(buffer){
    return data2result(buffer);
}

function ori2tr(op, data){
    op = op || 'text';

    if(op == 'extra') OPCODE = 0x0;
    if(op == 'text')  OPCODE = 0x1;
    if(op == 'bin')   OPCODE = 0x2;
    if(op == 'ping')  OPCODE = 0x9;
    if(op == 'pong')  OPCODE = 0xA;

    var result = {};

    result.DATA = data || null;

    result.FIN  = 1;
    result.RSV1 = 0;
    result.RSV2 = 0;
    result.RSV3 = 0;
    result.OPCODE = OPCODE;
    result.MASK = 0;
    
    return result2data(result);
}

function data2result(data){
    if(data.length < 1) return {wait: true};

    var iterator = 0;
    var DATA = data[iterator++];

    var result = {};

    result.FIN    = (DATA & 0x80) >> 7;
    result.RSV1   = (DATA & 0x40) >> 6;
    result.RSV2   = (DATA & 0x20) >> 5;
    result.RSV3   = (DATA & 0x10) >> 4;
    result.OPCODE = (DATA & 0x0f) >> 0;

    if(result.OPCODE == 8) return result;

    var DATA = data[iterator++];

    result.MASK   = (DATA & 0x80) >> 7;
    result.PL     = (DATA & 0x7f) >> 0;

    if(result.PL == 126){
        DATA = data.slice(iterator, iterator + 2);
        iterator += 2;
        var epl = 0;
        for(var i = 0; i < DATA.length; i++){
            epl = (epl << 8) + DATA[i];
        }
        result.EPL = epl;
    }
    else if(result.PL == 127){
        DATA = data.slice(iterator, iterator + 8);
        iterator += 8;
        var epl = 0;
        for(var i = 0; i < DATA.length; i++){
            epl = (epl << 8) + DATA[i];
        }
        result.EPL = epl;
    }
    result.PLL = result.EPL || result.PL;

    if(result.MASK){
        DATA = data.slice(iterator, iterator + 4);
        iterator += 4;
        result.MK = DATA;
    }

    result.PLD = data.slice(iterator, iterator + result.PLL);

    if(result.PLD.length < result.PLL){
        result.wait = result.PLL - result.PLD.length;
        return result;
    }
    
    if(data.length > iterator + result.PLL){
        result.next = data.slice(iterator + result.PLL);
    }

    if(result.MASK){
        result.DATA = unmask(result.PLD, result.MK);
    }
    else{
        result.DATA = result.PLD;
    }

    return result;

}

function result2data(result){
    var data = result.DATA || new Buffer(0);
    if(data && data.length >= 0xffff){
        result.PL  = 127;
        result.EPL = data.length;
    }
    else if(data && data.length >= 126){
        result.PL  = 126;
        result.EPL = data.length;
    }
    else{
        result.PL  = data.length;
    }

    result.PLL = result.EPL || result.PL;

    var len    = 2;
    if(result.PL == 126){
        len += 2;
    }
    if(result.PL == 127){
        len += 8;
    }
    var buffer = new Buffer(len);

    var iterator = 0;
    buffer[iterator++] = 
        ((result.FIN  << 7) & 0x80) | 
        ((result.RSV1 << 6) & 0x40) | 
        ((result.RSV2 << 5) & 0x20) |
        ((result.RSV3 << 4) & 0x10) |
        ((result.OPCODE << 0) & 0x0f);

    buffer[iterator++] =
        ((result.MASK << 7) & 0x80) |
        ((result.PL   << 0) & 0x7f);

    if(result.PL == 126){
        var mask = 0xff00;
        for(var i = 0; i < 2; i++){
            buffer[iterator++] = result.PLL & mask;
            mask = mask >> 8;
        }
    }
    else if(result.PL == 127){
        var mask = 0xff00000000000000;
        for(var i = 0; i < 8; i++){
            buffer[iterator++] = result.PLL & mask;
            mask = mask >> 8;
        }
    }

    if(data){
        buffer = Buffer.concat([buffer, data]);
    }

    return buffer;
}

function unmask(payloadData, maskingKey){
    var resBuffer = new Buffer(payloadData.length);

    for(var i = 0; i < payloadData.length; i++){
        var j = i % 4;
        resBuffer[i] = payloadData[i] ^ maskingKey[j];
    }

    return resBuffer;
}
