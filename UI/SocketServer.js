/**
 * Created with IntelliJ IDEA.
 * User: Nisheeth
 * Date: 13/01/13
 * Time: 23:14
 * To change this template use File | Settings | File Templates.
 */

function SocketServer(url) {
    this.url = url;
    this.socket = null;
    this.manager = null;
}

SocketServer.prototype.start = function start() {
    var self = this;
    this.socket = io.connect(this.url);
    this.manager = new ClientManager(this.socket);

    this.socket.on('connect', function () {
        console.log('Connected to the Server');
    });
    this.socket.on('reconnect', function () {
        console.log('Reconnected to the Server');
    });
    this.socket.on('disconnect', function () {
        console.log('Disconnected from the Server');
    });
    this.socket.on('connect_failed', function () {
        console.warn('Failed to connect to the Server');
    });
    this.socket.on('error', function () {
        console.warn('Socket Error');
    });
    this.socket.on('clientConnected', function (data) {
        console.log('clientConnected: ', data);
        self.manager.add(data.id, data.room);
    });
    this.socket.on('clientDisconnected', function (data) {
        console.log('clientDisconnected: ', data);
        self.manager.remove(data.id);
    });
    this.socket.on('subscribed', function (data) {
        console.log('subscribed to room', data);
        self.manager.join(data.id, data.room);
    });
    this.socket.on('unsubscribed', function (data) {
        console.log('Unsubscribed from room', data);
        self.manager.leave(data.id, data.room);
    });
    this.socket.on('console', function (data) {
        self.manager.log(data.id, data);
    });
}

SocketServer.prototype.request = function request(data) {
    this.manager.command(data);
}
