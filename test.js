var u = require('./user.js');
var dbg = require('./dbg.js');
var crypto = require('crypto');
var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:8888');
var secret = Math.random().toString(16);
var df;
var first = true;
var r = 0;

function tb2str(buf) {
    return String.fromCharCode.apply(null, buf);
}

ws.on('open', function() {
    /* Test Join */
    testJoin(ws, Math.random().toString(), "room1");
});

ws.on('message', function(data, flags) {
    dbg.dbg_print("Incoming:" + data);
    var msg = JSON.parse(data);
    console.log("haha:" + msg.type);
    if (msg.type == "keyxchg_1") {
        testDiffieHellman(ws, msg);
    }
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

var testDiffieHellman = function(ws, msg) {
    if (df == undefined) {
        df = crypto.createDiffieHellman(msg.prime, "hex");
        df.generateKeys(); 
        secret = df.getPrivateKey("hex");
    }

    secret = df.computeSecret(msg.keyintrmdt, "hex", "hex");
    var intr = "";
    if (msg.roundleft == 0) {
        df.setPrivateKey(secret, "hex");
        intr = "";
    } else {
        intr = secret;
    }
    var ret = {
        ver:1,
        type:"keyxchg_2",
        roundleft:msg.roundleft,
        keyintrmdt: intr 
    };

    ws.send(JSON.stringify(ret));
    dbg.dbg_print("out" + JSON.stringify(ret));
    dbg.dbg_print("secret:-----" + secret);
}
