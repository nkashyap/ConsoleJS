/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 14/01/13
 * Time: 15:31
 * To change this template use File | Settings | File Templates.
 */

function ControlClient(manager, socket) {
    this.manager = manager;
    this.socket = socket;
    this.id = this.socket.handshake.guid || this.socket.id;
    this.rooms = [];
}

ControlClient.prototype.join = function join(room) {
    if (this.rooms.indexOf(room) === -1) {
        this.rooms.push(room);
        room.subscribe(this);
        this.subscribe(room.name);
    }
};

ControlClient.prototype.leave = function leave(room) {
    var index = this.rooms.indexOf(room);
    if (index > -1) {
        this.rooms.splice(index, 1);
        room.unSubscribe(this);
        this.unSubscribe(room.name);
    }
};

ControlClient.prototype.subscribe = function subscribe(name) {
    this.emit('subscribed', { name: name });
    this.socket.join(name);
};

ControlClient.prototype.unSubscribe = function unSubscribe(name) {
    this.emit('unsubscribed', { name: name });
    this.socket.leave(name);
};

ControlClient.prototype.emit = function emit(eventName, data) {
    this.socket.emit(eventName, data);
};

ControlClient.prototype.broadcast = function broadcast(eventName, data, room) {
    this.socket.broadcast.to(room).emit(eventName, data);
};

ControlClient.prototype.remove = function remove() {
    var self = this;
    this.rooms.forEach(function (room) {
        self.leave(room);
    });
};

module.exports = ControlClient;