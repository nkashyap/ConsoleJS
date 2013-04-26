/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 14/01/13
 * Time: 15:31
 * To change this template use File | Settings | File Templates.
 */

function ConsoleClient(manager, socket) {
    this.manager = manager;
    this.socket = socket;
    this.id = this.socket.handshake.guid || this.socket.id;
    this.room = null;
}

ConsoleClient.prototype.join = function join(room) {
    if (this.room) {
        this.leave();
    }

    this.room = room;
    this.room.join(this);
    this.subscribe(this.room.name);
};

ConsoleClient.prototype.leave = function leave() {
    if (this.room) {
        this.unSubscribe(this.room.name);
        this.room.leave(this);
        this.room = null;
    }
};

ConsoleClient.prototype.getTransportMode = function getTransportMode() {
    return this.id + ":" + this.manager.getTransportMode(this.socket);
};

ConsoleClient.prototype.subscribe = function subscribe(name) {
    this.emit('subscribed', { name: name });
    this.socket.join(name);
};

ConsoleClient.prototype.unSubscribe = function unSubscribe(name) {
    this.socket.leave(name);
    this.emit('unsubscribed', { name: name });
};

ConsoleClient.prototype.emit = function emit(eventName, data) {
    this.socket.emit(eventName, data);
};

ConsoleClient.prototype.broadcast = function broadcast(eventName, data, room) {
    this.socket.broadcast.to(room).emit(eventName, data);
};

ConsoleClient.prototype.remove = function remove() {
    this.leave();
};

module.exports = ConsoleClient;