/**
 * Created with IntelliJ IDEA.
 * User: Nisheeth
 * Date: 13/01/13
 * Time: 23:15
 * To change this template use File | Settings | File Templates.
 */

function RoomManager(server, socket) {
    this.server = server;
    this.socket = socket;
    this.rooms = [];
    this.activeRoom = null;
}

RoomManager.prototype.online = function online(data) {
    var room = this.getRoom(data);
    if (!room) {
        room = new Room(this, data);
        this.rooms.push(room);
        room.add();
    } else {
        room.mode = data.mode;
        room.online();
    }
};

RoomManager.prototype.offline = function offline(data) {
    var room = this.getRoom(data);
    if (room) {
        room.mode = data.mode;
        room.offline();
    }
};

RoomManager.prototype.subscribed = function subscribed(data) {
    var room = this.getRoom(data);
    if (room) {
        room.subscribed();
    }
};

RoomManager.prototype.unSubscribed = function unSubscribed(data) {
    var room = this.getRoom(data);
    if (room) {
        room.unSubscribed();
    }
};

RoomManager.prototype.log = function log(data) {
    var room = this.getRoom(data);
    if (room) {
        room.log(data);
    }
};

RoomManager.prototype.emit = function emit(eventName, data) {
    this.socket.emit(eventName, data);
};

RoomManager.prototype.getRoom = function getRoom(data) {
    var length = this.rooms.length;
    while (length > 0) {
        var room = this.rooms[--length];
        if (room.name === data.name) {
            return room;
        }
    }
    return null;
};

RoomManager.prototype.setActive = function setActive(room) {
    if (this.activeRoom && this.activeRoom !== room && room.isActive) {
        this.activeRoom.setActive(false);
        this.activeRoom = null;
    }

    if (room.isActive && room.isSubscribed) {
        this.activeRoom = room;
    }

    if (!this.activeRoom || !this.activeRoom.isActive) {
        this.activeRoom = this.rooms[0];
        this.activeRoom.show();
    }
};

RoomManager.prototype.command = function command(data) {
    if (this.activeRoom && this.activeRoom.name !== this.server.room.name) {
        this.activeRoom.command(data);
    } else {
        var room,
            length = this.rooms.length;
        while (length > 0) {
            room = this.rooms[--length];
            room.command(data);
        }
    }
};