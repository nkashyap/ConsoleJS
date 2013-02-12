/**
 * Created with IntelliJ IDEA.
 * User: Nisheeth
 * Date: 13/01/13
 * Time: 23:14
 * To change this template use File | Settings | File Templates.
 */

function SocketServer(url) {
    this.url = url;
    this.name = 'ConsoleJS';
    this.socket = null;
    this.manager = null;
    this.room = null;
}

SocketServer.prototype.start = function start() {
    var self = this;
    this.socket = io.connect(this.url);
    this.manager = new RoomManager(this, this.socket);

    this.manager.online({ name: this.name });
    this.room = this.manager.getRoom({ name: this.name });
    this.room.subscribed();
    this.room.offline();

    this.socket.on('connect', function () {
        self.room.online();
        self.emit('info', 'Connected to the Server');
    });
    this.socket.on('reconnect', function () {
        self.room.online();
        self.emit('info', 'Reconnected to the Server');
    });
    this.socket.on('disconnect', function () {
        self.room.offline();
        self.emit('info', 'Disconnected from the Server');
    });
    this.socket.on('connect_failed', function () {
        self.emit('warn', 'Failed to connect to the Server');
    });
    this.socket.on('error', function () {
        self.emit('error', 'Socket Error');
    });

    this.socket.on('online', function (data) {
        self.emit('log', 'online: ' + data.name + ', mode: ' + data.mode);
        self.manager.online(data);
    });
    this.socket.on('offline', function (data) {
        self.emit('log', 'offline: ' + data.name + ', mode: ' + data.mode);
        self.manager.offline(data);
    });

    this.socket.on('subscribed', function (data) {
        self.emit('log', 'Subscribed to ' + data.name);
        self.manager.subscribed(data);
    });
    this.socket.on('unsubscribed', function (data) {
        self.emit('log', 'Unsubscribed from ' + data.name);
        self.manager.unSubscribed(data);
    });

    this.socket.on('console', function (data) {
        self.manager.log(data);
    });
};

SocketServer.prototype.emit = function emit(eventName, message) {
    this.manager.log({
        name: this.name,
        type: eventName || 'log',
        message: message
    });
};

SocketServer.prototype.request = function request(data) {
    this.manager.command(data);
};
