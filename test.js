var m = require('./message.js');
var u = require('./user.js');
var crypto = require('crypto');
var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:8888');

function tb2str(buf) {
    return String.fromCharCode.apply(null, buf);
}

ws.on('open', function() {
    /* Test Join */
    testJoin(ws, Math.random().toString(), "room1");
    /* Test Message */
    testMsg(ws, "yes");
    /* Test Message */
    testMsg(ws, "no");
    /* Test Message */
    testMsg(ws, "a long long long long message" + Math.random().toString());
    /* Test Message */
});
ws.on('message', function(data, flags) {
    var msgBuf = new m.CMessage(new Buffer(data));
    console.log("-----------incoming message----------");
    msgBuf.dump();
});
ws.on('error', function(reason, code) {
    console.log('socket error: reason ' + reason + ', code ' + code);
});

var testMsg = function(ws, msg) {
    var message = msg;
    var buf = new Buffer(3 + message.length);
    var chatMsg = new m.ChatMessage(buf);
    chatMsg.setHeader(0x4, 3 + message.length);
    (new Buffer(message)).copy(chatMsg.content);
    console.log("----------outgoing message------");
    chatMsg.dump();
    chatMsg.send(ws);
}

var testJoin = function(ws, name, room) {
    var buf = new Buffer(83);
    var joinMsg = new m.JoinMessage(buf);
    var cid = crypto.createHash('sha1').update(name).digest('hex');
    var rid = crypto.createHash('sha1').update(room).digest('hex');
    joinMsg.setHeader(0x1, 83);
    (new Buffer(cid)).copy(joinMsg.cid);
    (new Buffer(rid)).copy(joinMsg.rid);
    console.log("----------outgoing message------");
    joinMsg.dump();
    joinMsg.send(ws);
}
