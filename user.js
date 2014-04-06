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

    this.send = function(message, ws) {
        /* Construct the message */
        message.type = "message_1";
        var msgstr = JSON.stringify(message);
        var i = 0;
        for (var u in this.list) {
            (this.list)[u].socket.send(msgstr);
        }
    }
}
