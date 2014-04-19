var dbg = require("./dbg.js");
var crypto = require("crypto");

UserTreeNode = function() {
    this.val;
    this.isLeaf = false;
}

UserTree = function () {
    this.n = 0;
    this.nodes = new Array();

    this.add = function(node) {

        n++;
    }
}

exports.CUser = function (socket, id) {
    this.socket = socket;
    this.id = id;
    this.room = undefined;
    this.authrounds = 1;
    this.keyintrmdt = undefined;

    this.setRoom = function(rid) {
        this.room = rid;
    }

    this.getRoom = function() {
        return this.room;
    }

    this.descAuth = function() {
        this.authrounds--;
    }

    this.setAuthRound = function(r) {
        this.authrounds = r;
    }

    this.updatePrime = function(prime) {
        var msg = {
            ver:1,
            type:"keyxchg_0",
            number: prime
        };

        var msgstr = JSON.stringify(msg);
        this.socket.send(msgstr);
    }

    this.requestAuth = function(g, changesecret, prime) {
        var msg = {
            ver:1,
            type:"keyxchg_1",
            roundleft:this.authrounds,
            changesecret:changesecret,
            keyintrmdt:g.toString(16),
            prime: prime
        };

        dbg.dbg_print("I'm out:----------------");
        var msgstr = JSON.stringify(msg);
        dbg.dbg_print("I'm out:"+ msgstr);
        this.socket.send(msgstr);
    }
}

exports.CRoom = function (id) {
    this.id = id;
    this.list = new Array();
    this.tree = new UserTree();
    this.keyready = 2;
    this.newuser = undefined;
    this.roompublic = undefined;

    var df = crypto.createDiffieHellman(192);
    this.prime = df.getPrime("hex");

    df.generateKeys("hex");
    this.roompublic = "02";

    this.add = function(user) {
        if (this.size() == 0) {
            this.keyready = 0;
            user.setAuthRound(0);
            user.requestAuth(this.roompublic, true, this.prime);
            (this.list)[user.id] = user;
            return;
        }
        this.newuser = user;

        user.setAuthRound(1);
        this.newuser.requestAuth(this.roompublic, true, this.prime);
        user.setAuthRound(0);

        this.keyready = 2;
        var sent = true;
        for (var u in this.list) {
            var u = (this.list)[u];
            // Only needs to send to one of the existing users.
            if (sent) {
                u.setAuthRound(1);
                u.requestAuth(this.roompublic, false, this.prime);
                sent = false;
            }
            u.setAuthRound(0);
        }

        (this.list)[user.id] = user;
    }

    this.get = function(id) {
        return (this.list)[id];
    }

    this.del = function(id) {
        delete (this.list[id]);
    }

    this.size = function() {
        return Object.keys(this.list).length;
    }

    this.updateAuth = function(g) {
        for (var u in this.list) {
            var user = (this.list)[u];
            user.requestAuth(g, true, this.prime);
        }
    }

    this.send = function(message, ws) {
        /* Construct the message */
        message.type = "message_1";
        var msgstr = JSON.stringify(message);
        var i = 0;
        for (var u in this.list) {
            dbg.dbg_print((this.list)[u].authrounds);
            if ((this.list)[u].authrounds == 0) {
              (this.list)[u].socket.send(msgstr);
            } else {
            }
        }
    }
}
