var crypto = require("crypto");
var serverPort = 8888;

var dbg = require("./dbg.js");
var u = require('./user.js');
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 8888, noServer: true});

var g = 2;

var roomList = new Array();
var userList = new Array();

function check_join(key) {
    var user = userList[key];
    if (user == undefined) {
        return false;
    }

    return true;
}

function handle_join(msg, ws) {
    /* Join */
    var ws_key = (ws.upgradeReq.headers)['sec-websocket-key'];
    var rid = msg.chatroom;
    var cid = msg.clientid;
    var user, room;
    var errMsg = {ver:1, type:'error', errcode:0};

    if (userList[ws_key]) {
        /* A user with a same websocket key is here. */
        errMsg.errcode = 0x4;
        ws.send(JSON.stringify(errMsg));
        ws.close();
        return;
    } else {
        var dup = false;
        dbg.dbg_print("Here comes a new user! " + "[" + cid + "]");
        for (var i in userList) {
            if (userList[i].id == cid) {
                /* Found a duplicate user with same ID. */
                dup = true;
                break;
            }
        }

        if (!dup) {
            userList[ws_key] = new u.CUser(ws, cid);
        } else {
            /* A user with a same id is here. */
            errMsg.errcode = 0x4;
            ws.send(JSON.stringify(errMsg));
            ws.close();
            return;
        }
    }

    if (roomList[rid] == undefined) {
        room = new u.CRoom(rid);
        roomList[rid] = room;
    } else {
        room = roomList[rid];
    }
    userList[ws_key].setRoom(rid);

    room.add(userList[ws_key]); /* Here adds the new user! */
    ws.send(JSON.stringify(errMsg));
}

function handle_leave(ws, close) {
    /* Leave */
    var ws_key = (ws.upgradeReq.headers)['sec-websocket-key'];
    var errMsg = {ver:1, type:'error', errcode:0};
    var user = userList[ws_key];
    if (user == undefined) {
        return;
    }

    var room = roomList[userList[ws_key].room];
    room.del(userList[ws_key].id);
    if (room.size() == 0) {
        delete roomList[room.id]
    }
    delete userList[ws_key];

    if (!close) {
        ws.send(JSON.stringify(errMsg));
        ws.close();
    }

    dbg.dbg_print("Leaving:" + ws_key);
}

function handle_message_0(msg, ws) {
    /* Chat */
    var ws_key = (ws.upgradeReq.headers)['sec-websocket-key'];
    var errMsg = {ver:1, type:'error', errcode:0};
    var user = userList[ws_key];
    if (user == undefined) {
        /* This user has not joined any room. */
        errMsg.errcode = 0x5;
        ws.send(JSON.stringify(errMsg));
        ws.close();
        return;
    }

    dbg.dbg_print(user.authrounds);
    if (user.authrounds != 0) {
        /* This user has not finished the key neogotiation. */
        errMsg.errcode = 0x10;
        ws.send(JSON.stringify(errMsg));
        return;
    }

    var room = roomList[user.getRoom()];
    if (room != undefined) {
        room.send(msg, ws);
    }
}

function handle_keyxchg_2(msg, ws) {
    var ws_key = (ws.upgradeReq.headers)['sec-websocket-key'];
    var errMsg = {ver:1, type:'error', errcode:0};
    var user = userList[ws_key];
    if (user == undefined) {
        dbg.dbg_print("yo");
        /* This user has not joined any room. */
        errMsg.errcode = 0x5;
        ws.send(JSON.stringify(errMsg));
        ws.close();
        return;
    }

    if (msg.keyintrmdt == "" && msg.roundleft == 0) {
        return;
    }

    var room = roomList[user.getRoom()];
    var uu;

    if (user != room.newuser && room.newuser != undefined) {
        uu = room.newuser;
        uu.requestAuth(msg.keyintrmdt, false, room.prime);
        uu.setAuthRound(uu.authrounds-1);
    } else if (room.newuser != undefined) {
        for (var u in room.list) {
            var nu = (room.list)[u];
            if (nu == room.newuser)
                continue;
            nu.requestAuth(msg.keyintrmdt, false, room.prime);
            nu.setAuthRound(nu.authrounds-1);
        }
    }
}

wss.on('connection', function(ws) {
    /* Get this unique key from ws object. */
    var ws_key = (ws.upgradeReq.headers)['sec-websocket-key'];
    dbg.dbg_print("key is here: " + ws_key);
    ws.on('message', function(buf) {
        var errMsg = {ver:1, type:'error', errcode:0};
        var msg;
        try {
            msg = JSON.parse(buf);
        } catch (e) {
            errMsg.errcode = 0xbeef;
            ws.send(JSON.stringify(errMsg));
            dbg.dbg_print("ERROR" + e);
            return;
        }
        dbg.dbg_print("Incoming message");
        dbg.dbg_print(JSON.stringify(msg));

        if (msg.type == undefined) {
            errMsg.errcode = 0xbeef;
            ws.send(JSON.stringify(errMsg));
            return;
        }

        switch(msg.type) {
            case "join":
                handle_join(msg, ws);
                break;
            case "leave":
                handle_leave(ws, false);
                break;
            case "message_0":
                handle_message_0(msg, ws);
                break;
            case "keyxchg_2":
                handle_keyxchg_2(msg, ws);
                break;
            default:
                dbg.dbg_print("Unknown message type");
                errMsg.errcode = 0x8;
                ws.send(JSON.stringify(errMsg));
                break;
        }
    });

    ws.on('close', function(){
        handle_leave(ws, true);
    });

    ws.on('error', function(reason, code) {
        dbg.dbg_print("socket error: " + reason);
        dbg.dbg_print("still has: " + Object.keys(userList).length);
    });
});
