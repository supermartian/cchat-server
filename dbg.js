var dbg = true;

exports.dbg_print = function(message) {
    if (!dbg) {
        return;
    }

    console.log("[" + Date.now() + "] - " + message);
}
