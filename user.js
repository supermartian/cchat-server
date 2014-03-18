var m = require('./message.js');
var dbg = require("./dbg.js");

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
        (this.list)[user.id] = user;
    }

    this.get = function(id) {
        return (this.list)[id];
    }

    this.del = function(id) {
        delete (this.list[id]);
    }

    this.send = function(message) {
        /* Construct the message */
        var buf = new Buffer(message.length + 3);
        var msgBuf = new m.ChatMessage(buf);
        msgBuf.version[0] = 1 << 4; 
        msgBuf.setHeader(0x5, message.length + 3);
        var i = 0;
        (new Buffer(message)).copy(msgBuf.content);

        for (var u in this.list) {
            msgBuf.send((this.list)[u].socket);
        }
    }
}
