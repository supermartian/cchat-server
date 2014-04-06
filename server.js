var serverPort = 8888;

var dbg = require("./dbg.js");
var u = require('./user.js');
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 8888, noServer: true});

var roomList = new Array();
var userList = new Array();

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
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
                /* Join */
                var rid = msg.chatroom;
                var cid = msg.clientid;
                var user, room;

                if (userList[ws_key]) {
                    /* A user with a same websocket key is here. */
                    errMsg.errcode = 0x4;
                    ws.send(JSON.stringify(errMsg));
                    ws.close();
                    break;
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
                        break;
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
                break;
            case "leave":
                /* Leave */
                CRoom.del(userList[ws_key].id)
                ws.send(JSON.stringify(errMsg));
                ws.close();
                break;
            case "message_0":
                /* Chat */
                var user = userList[ws_key];
                var room = roomList[user.getRoom()];
                if (room != undefined) {
                    room.send(msg, ws);
                }
                break;
            default:
                dbg.dbg_print("Unknown message type");
                errMsg.errcode = 0x8;
                ws.send(JSON.stringify(errMsg));
                break;
        }
    });

    ws.on('close', function(){
        var user = userList[ws_key];
        if (user != undefined) {
            dbg.dbg_print("A user is leaving: " + user.id);
            roomList[user.getRoom()].del(user.id);
            delete userList[ws_key];
        }
    });

    ws.on('error', function(reason, code) {
        dbg.dbg_print("socket error: " + reason);
        dbg.dbg_print("still has: " + Object.keys(userList).length);
    });
});
