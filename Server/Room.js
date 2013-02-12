/**
 * Created with IntelliJ IDEA.
 * User: Nisheeth
 * Date: 14/01/13
 * Time: 18:21
 * To change this template use File | Settings | File Templates.
 */

function Room(manager, data) {
    this.manager = manager;
    this.name = data.name;
    this.controls = [];
    this.consoles = [];
}

Room.prototype.join = function join(client) {
    if (this.consoles.indexOf(client) === -1) {
        this.consoles.push(client);
        this.detectState();
    }
};

Room.prototype.leave = function leave(client) {
    var index = this.consoles.indexOf(client);
    if (index > -1) {
        this.consoles.splice(index, 1);
        this.detectState();
    }
};

Room.prototype.subscribe = function subscribe(control) {
    if (this.controls.indexOf(control) === -1) {
        this.controls.push(control);
    }
};

Room.prototype.unSubscribe = function unSubscribe(control) {
    var index = this.controls.indexOf(control);
    if (index > -1) {
        this.controls.splice(index, 1);
    }
};

Room.prototype.detectState = function detectState() {
    if (this.consoles.length > 0) {
        this.online();
    } else {
        this.offline();
    }
};

Room.prototype.getTransportMode = function getTransportMode() {
    var mode = [];
    this.consoles.forEach(function (item) {
        mode.push(item.getTransportMode());
    });
    return mode.join(",");
};

Room.prototype.online = function online() {
    this.manager.emit('online', {
        name: this.name,
        mode: this.getTransportMode()
    });
};

Room.prototype.offline = function offline() {
    this.manager.emit('offline', {
        name: this.name,
        mode: this.getTransportMode()
    });
};

Room.prototype.log = function log(data) {
    this.controls.forEach(function (control) {
        control.emit('console', data);
    });
};

Room.prototype.command = function command(data) {
    this.consoles.forEach(function (item) {
        item.emit('command', data);
    });
};

module.exports = Room;