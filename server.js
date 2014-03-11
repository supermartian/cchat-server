var serverPort = 8888;

var m = require('./message.js');
var u = require('./user.js');
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 8888});

var roomList = new Array();
var userList = new Array();

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

wss.on('connection', function(ws) {
    ws.on('message', function(buf) {
        var msgBuf = new m.CMessage(buf);
        switch(msgBuf.type[0]) {
            case 0x1:
                /* Join */
                msgBuf = new m.JoinMessage(buf);
                var rid = ab2str(msgBuf.rid);
                var cid = ab2str(msgBuf.cid);
                var user, room;

                if (userList[ws]) {
                    break;
                } else {
                    user = new u.CUser(ws, id);
                    userList[ws] = user;
                }

                if (roomList[rid] == undefined) {
                    room = new u.CRoom(rid);
                    roomList[rid] = room;
                } else {
                    room = roomList[rid];
                }

                user.setRoom(rid);
                room.add(user);
                break;
            case 0x2:
                /* Leave */
                CRoom.del(userList[ws].id)
                break;
            case 0x4:
                /* Chat */
                msgBuf = new m.ChatMessage(buf);
                var user = userList[ws];
                var room = roomList[user.getRoom()];
                room.send(msgBuf.content);
                break;
            default:
                console.log("yeah");
                break;
        }
    });
    ws.on('open', function(){
        console.log("heheh");
        var buf = new ArrayBuffer(6);
        var msgBuf = new m.CMessage(buf);
        msgBuf.version[0] = 1 << 4; 
        msgBuf.type[0] = 0x6;
        msgBuf.length[0] = 0x5;
        msgBuf.data[1] = 0x6;
        msgBuf.dump();
        msgBuf.send(ws);
    });
    ws.send('something');
});

function sendMessage(socket, type, data) {
    var buf = new Uint8Array(maxBufferLength);
}
