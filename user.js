var m = require('./message.js');

exports.CUser = function (socket, id) {
    this.socket = socket;
    this.id = id;
    this.room = undefined;

    this.setRoom = function(rid) {
        this.room = rid;
    }

    this.getRoom = function() {
        return this.room;
    }
}

exports.CRoom = function (id) {
    this.id = id;
    this.list = new Array();

    this.add = function(user) {
        list[user.id] = user;
    }

    this.get = function(id) {
        return list[id];
    }

    this.del = function(id) {
        list[id] = undefined;
    }

    this.send = function(message) {
        /* Construct the message */
        var buf = new ArrayBuffer(message.length + 3);
        var msgBuf = new m.CMessage(buf);
        msgBuf.version[0] = 1 << 4; 
        msgBuf.type[0] = 0x5;
        msgBuf.length[0] = message.length + 3;
        var i = 0;
        for (var b in message) {
            msgBuf.data[i] = message[i];
            i++;
        }

        for (var u in this.list) {
            msgBuf.dump();
            msgBuf.send(u.socket);
        }
    }
}
