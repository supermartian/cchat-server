var serverPort = 8888;

var m = require('./message.js');
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
    console.log(Date.now() + ":key!!!!!!!!!!!!!!!:" + ws_key);
    ws.on('message', function(buf) {
        var msgBuf = new m.CMessage(new Buffer(buf));
        var errMsg = new m.ErrorMessage(new Buffer(5));
        errMsg.setHeader(0xfe, 5);
        errMsg.setErrno(0);
        console.log(Date.now() + ":-----------incoming message----------");
        msgBuf.dump();
        switch(msgBuf.type) {
            case 0x1:
                /* Join */
                msgBuf = new m.JoinMessage(buf);
                var rid = (msgBuf.rid).toString();
                var cid = (msgBuf.cid).toString();
                var user, room;

                if (userList[ws_key]) {
                    /* A user with a same websocket key is here. */
                    errMsg.setErrno(0x4);
                    errMsg.send(ws);
                    ws.close();
                    break;
                } else {
                    var dup = false;
                    console.log(Date.now() + "-------Here comes new user! " + cid + "------");
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
                        errMsg.setErrno(0x4);
                        errMsg.send(ws);
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
                room.add(userList[ws_key]);
                errMsg.send(ws);
                break;
            case 0x2:
                /* Leave */
                CRoom.del(userList[ws_key].id)
                errMsg.send(ws);
                ws.close();
                break;
            case 0x4:
                /* Chat */
                msgBuf = new m.ChatMessage(buf);
                var user = userList[ws_key];
                var room = roomList[user.getRoom()];
                room.send(msgBuf.content);
                break;
            default:
                console.log(Date.now() + "yeah");
                break;
        }
    });

    ws.on('close', function(){
        var user = userList[ws_key];
        if (user != undefined) {
            roomList[user.getRoom()].del(user.id);
            delete userList[ws_key];
        }
    });

    ws.on('error', function(reason, code) {
        console.log('socket error: reason ' + reason + ', code ' + code);
        console.log("still has:" + Object.keys(userList).length);
    });
});


function sendMessage(socket, type, data) {
    var buf = new Uint8Array(maxBufferLength);
}
