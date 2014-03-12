var util = require("util");
var ver = 1;

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function tb2str(buf) {
    return String.fromCharCode.apply(null, buf);
}

exports.maxBufferLength = 2048;

/* buf: ArrayBuffer */
exports.CMessage = function (buf) {
    this.buf = buf;
    this.version = (this.buf)[0];
    this.type = (this.buf)[1];
    this.length = (this.buf)[2];
    this.data = (this.buf).slice(3); 

    (this.buf)[0] = ver << 4;

    this.setHeader = function(type, length) {
        (this.buf)[1] = type;
        (this.buf)[2] = length;
    }

    this.send = function(socket) {
        socket.send(this.buf, 'binary');
    }

    this.dump = function() {
        if (true) {
        console.log("raw:"+ab2str(this.buf));
        console.log("Version:"+this.version+"\n"+
                "Type:"+this.type+"\n"+
                "Length:"+this.length+"\n"+
                "Data:"+ab2str(this.data));
        }
    }
}

exports.JoinMessage = function (buf) {
    this.buf = buf;
    exports.JoinMessage.super_.call(this, this.buf);
    this.cid = (this.buf).slice(3, 42);
    this.rid = (this.buf).slice(43, 82);
}
exports.LeaveMessage = function (buf) {
    this.buf = buf;
    exports.LeaveMessage.super_.call(this, this.buf);
}
exports.ChatMessage = function (buf) {
    this.buf = buf;
    exports.ChatMessage.super_.call(this, this.buf);
    this.content = (this.buf).slice(3);
}
exports.ErrorMessage = function (buf, buf) {
    this.buf = buf;
    exports.ChatMessage.super_.call(this, this.buf);
    this.content = (this.buf).slice(3);
}
util.inherits(exports.JoinMessage, exports.CMessage);
util.inherits(exports.LeaveMessage, exports.CMessage);
util.inherits(exports.ChatMessage, exports.CMessage);
util.inherits(exports.ErrorMessage, exports.CMessage);
