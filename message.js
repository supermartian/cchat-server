var util = require("util");
exports.maxBufferLength = 2048;
/* buf: ArrayBuffer */
exports.CMessage = function (buf) {
    this.version = new Uint8Array(buf, 0, 1);
    this.type = new Uint8Array(buf, 1, 1);
    this.length = new Uint8Array(buf, 2, 1);
    this.data = new Uint8Array(buf, 3);

    this.send = function(socket) {
        socket.send(buf, 'binary');
    }

    this.dump = function() {
        console.log("Version:"+this.version[0]+"\n"+
                "Type:"+this.type[0]+"\n"+
                "Length:"+this.length[0]+"\n"+
                "Data:"+this.data+"\n"
                );
    }
}

exports.JoinMessage = function (buf) {
    this.cid = new Uint8Array(buf, 3, 20);
    this.rid = new Uint8Array(buf, 23, 20);
}
exports.LeaveMessage = function (buf) {
}
exports.ChatMessage = function (buf) {
    this.content = new Uint8Array(buf, 3);
}
exports.ErrorMessage = function (buf) {
    this.content = new Uint8Array(buf, 3);
}
util.inherits(exports.JoinMessage, exports.CMessage);
util.inherits(exports.LeaveMessage, exports.CMessage);
util.inherits(exports.ChatMessage, exports.CMessage);
util.inherits(exports.ErrorMessage, exports.CMessage);
