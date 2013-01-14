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
    this.id = this.socket.id;
    this.rooms = [];
}

ControlClient.prototype.subscribe = function subscribe(name) {
    if (this.rooms.indexOf(name) === -1) {
        this.rooms.push(name);
        this.emit('subscribed', { name: name });
        this.socket.join(name);
    }
};

ControlClient.prototype.unSubscribe = function unSubscribe(name) {
    var index = this.rooms.indexOf(name);
    if (index > -1) {
        this.broadcast('unsubscribed', { name: name }, name);
        this.socket.leave(name);
        this.rooms.splice(index, 1);
    }
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
        self.manager.unSubscribe(self.socket, { data: room });
    });
};

module.exports = ControlClient;