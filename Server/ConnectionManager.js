var ControlClient = require('./ControlClient'),
    ConsoleClient = require('./ConsoleClient'),
    Room = require('./Room');

function ConnectionManager(server, config) {
    this.server = server;
    this.config = config;
    this.clients = [];
    this.consoles = [];
    this.rooms = [];
}

ConnectionManager.prototype.isConsoleClient = function isConsoleClient(socket) {
    return socket.manager.handshaken[socket.id].headers.referer.indexOf(this.config.port) === -1;
};

ConnectionManager.prototype.getTransportMode = function getTransportMode(socket) {
    var mode = this.server.transports[socket.id];
    return mode ? mode.name : '';
}

ConnectionManager.prototype.add = function add(socket) {
    if (this.isConsoleClient(socket)) {
        this.consoles.push(new ConsoleClient(this, socket));
    } else {
        var control = new ControlClient(this, socket);
        this.consoles.forEach(function (item) {
            if (item.room) {
                control.emit('online', { name: item.room.name, mode: item.getTransportMode() });
            }
        });
        this.clients.push(control);
    }
};

ConnectionManager.prototype.remove = function remove(socket) {
    var index, item;
    if (this.isConsoleClient(socket)) {
        item = this.getConsole(socket);
        index = this.consoles.indexOf(item);
        if (index > -1) {
            item.remove();
            this.consoles.splice(index, 1);
        }
    } else {
        item = this.getClient(socket);
        index = this.clients.indexOf(item);
        if (index > -1) {
            item.remove();
            this.clients.splice(index, 1);
        }
    }
};

ConnectionManager.prototype.subscribe = function subscribe(socket, data) {
    if (this.isConsoleClient(socket)) {
        var currentConsole = this.getConsole(socket);
        var room = this.getRoom(data);

        if (room) {
            room.bind(currentConsole);
        } else {
            room = new Room(this, currentConsole, data);
            this.rooms.push(room);
        }

        room.online();
    } else {
        var self = this;
        this.rooms.forEach(function (room) {
            if (room.name === data.name) {
                room.subscribe(self.getClient(socket));
            }
        });
    }
};

ConnectionManager.prototype.unSubscribe = function unSubscribe(socket, data) {
    if (this.isConsoleClient(socket)) {
        this.rooms.forEach(function (room) {
            if (room.name === data.name) {
                room.offline();
            }
        });
    } else {
        var self = this;
        this.rooms.forEach(function (room) {
            if (room.name === data.name) {
                room.unSubscribe(self.getClient(socket));
            }
        });
    }
};

ConnectionManager.prototype.console = function console(socket, data) {
    var room = this.getRoom(data);
    if (room) {
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

ConnectionManager.prototype.getClient = function getClient(socket) {
    var list = this.clients.filter(function (client) {
        return client.id === socket.id;
    });

    return list.length > 0 ? list[0] : null;
};

ConnectionManager.prototype.getConsole = function getConsole(socket) {
    var list = this.consoles.filter(function (console) {
        return console.id === socket.id;
    });

    return list.length > 0 ? list[0] : null;
};

ConnectionManager.prototype.getRoom = function getRoom(data) {
    var list = this.rooms.filter(function (room) {
        return room.name === data.name;
    });

    return list.length > 0 ? list[0] : null;
};


module.exports = ConnectionManager;