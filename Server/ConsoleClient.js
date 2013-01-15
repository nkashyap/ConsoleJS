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
    this.id = this.socket.id;
    this.room = null;
}

ConsoleClient.prototype.bind = function bind(room) {
    this.room = room;
};

ConsoleClient.prototype.getTransportMode = function getTransportMode() {
    return this.manager.getTransportMode(this.socket);
}

ConsoleClient.prototype.subscribe = function subscribe(name) {
    this.emit('subscribed', { name: name });
    this.socket.join(name);
};

ConsoleClient.prototype.unSubscribe = function unSubscribe(name) {
    //this.broadcast('unsubscribed', { name: name }, name);
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
    this.room.offline();
};

module.exports = ConsoleClient;