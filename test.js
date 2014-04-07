var u = require('./user.js');
var dbg = require('./dbg.js');
var crypto = require('crypto');
var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:8888');

function tb2str(buf) {
    return String.fromCharCode.apply(null, buf);
}

ws.on('open', function() {
    /* Test Join */
    testJoin(ws, Math.random().toString(), "room1");
    for (var i = 0; i < 10; i++){
    /* Test Message */
    testMsg(ws, "yes");
    /* Test Message */
    testMsg(ws, "no");}
    /* Test Message */
    testMsg(ws, "a long long long long message" + Math.random().toString());
    /* Test Message */
});
ws.on('message', function(data, flags) {
    dbg.dbg_print(data);
});
ws.on('error', function(reason, code) {
    dbg.dbg_print('socket error: reason ' + reason + ', code ' + code);
});

var testMsg = function(ws, msg) {
    var message = {ver: 1, type: "message_0", content:msg};
    console.log("----------outgoing message------");
    dbg.dbg_print(JSON.stringify(message));
    ws.send(JSON.stringify(message));
}

var testJoin = function(ws, name, room) {
    var joinMsg = {ver: 1, type: "join"};
    var cid = crypto.createHash('sha1').update(name).digest('hex');
    var rid = crypto.createHash('sha1').update(room).digest('hex');
    joinMsg.chatroom = rid;
    joinMsg.clientid = cid;
    dbg.dbg_print(JSON.stringify(joinMsg));
    ws.send(JSON.stringify(joinMsg));
}
