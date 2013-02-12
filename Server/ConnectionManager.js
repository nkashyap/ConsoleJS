var ControlClient = require('./ControlClient'),
    ConsoleClient = require('./ConsoleClient'),
    Room = require('./Room');

function ConnectionManager(server, config) {
    this.server = server;
    this.config = config;
    this.controls = [];
    this.consoles = [];
    this.rooms = [];
}

ConnectionManager.prototype.isConsoleClient = function isConsoleClient(socket) {
    var activeSocket = socket.manager.handshaken[socket.id],
        referer = activeSocket.headers.referer;

    return (referer) ? referer.indexOf(this.config.port) === -1 : (activeSocket.address) ? true : false;
};

ConnectionManager.prototype.getTransportMode = function getTransportMode(socket) {
    var mode = this.server.transports[socket.id];
    return mode ? mode.name : '';
};

ConnectionManager.prototype.add = function add(socket) {
    if (this.isConsoleClient(socket)) {
        this.consoles.push(new ConsoleClient(this, socket));
    } else {
        var control = new ControlClient(this, socket);
        this.controls.push(control);

        this.consoles.forEach(function (item) {
            if (item.room) {
                control.emit('online', {
                    name: item.room.name,
                    mode: item.getTransportMode()
                });
            }
        });
    }
};

ConnectionManager.prototype.remove = function remove(socket) {
    var index, list, item;
    if (this.isConsoleClient(socket)) {
        item = this.getConsole(socket);
        list = this.consoles;
    } else {
        item = this.getControl(socket);
        list = this.controls;
    }

    index = list.indexOf(item);
    if (index > -1) {
        item.remove();
        list.splice(index, 1);
    }
};

ConnectionManager.prototype.subscribe = function subscribe(socket, data) {
    var client = this.isConsoleClient(socket) ? this.getConsole(socket) : this.getControl(socket),
        room = this.getRoom(data);

    if (!room) {
        room = new Room(this, data);
        this.rooms.push(room);
    }

    client.join(room);
};

ConnectionManager.prototype.unSubscribe = function unSubscribe(socket, data) {
    var client = this.isConsoleClient(socket) ? this.getConsole(socket) : this.getControl(socket),
        room = this.getRoom(data);

    client.leave(room);
};

ConnectionManager.prototype.log = function log(socket, data) {
    var client = this.isConsoleClient(socket) ? this.getConsole(socket) : this.getControl(socket),
        room = this.getRoom(data);

    if (room) {
        data.guid = client.id;
        room.log(data);
    }
};

ConnectionManager.prototype.command = function command(socket, data) {
    var room = this.getRoom(data);
    if (room) {
        room.command(data);
    }
};

ConnectionManager.prototype.emit = function emit(eventName, data) {
    this.server.sockets.emit(eventName, data);
};

ConnectionManager.prototype.filter = function filter(list, fun) {
    var filteredList = list.filter(fun);
    return filteredList.length > 0 ? filteredList[0] : null;
};

ConnectionManager.prototype.getControl = function getControl(socket) {
    var id = (socket.handshake.guid || socket.id);
    return this.filter(this.controls, function (client) {
        return client.id === id;
    });
};

ConnectionManager.prototype.getConsole = function getConsole(socket) {
    var id = (socket.handshake.guid || socket.id);
    return this.filter(this.consoles, function (client) {
        return client.id === id;
    });
};

ConnectionManager.prototype.getRoom = function getRoom(data) {
    return this.filter(this.rooms, function (room) {
        return room.name === data.name;
    });
};

module.exports = ConnectionManager;