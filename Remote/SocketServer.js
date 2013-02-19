/**
 * Created with IntelliJ IDEA.
 * User: Nisheeth
 * Date: 13/01/13
 * Time: 23:14
 * To change this template use File | Settings | File Templates.
 */
ConsoleJS.Utils.namespace("ConsoleJS.Remote.SocketServer");

ConsoleJS.Remote.SocketServer = function SocketServer(url) {
    this.url = url || window.location.origin;
    this.name = 'ConsoleJS';
    this.socket = null;
    this.manager = null;
    this.room = null;
}

ConsoleJS.Remote.SocketServer.prototype.start = function start() {
    var scope = this;
    this.socket = (this.url.indexOf("https") > -1) ? io.connect(this.url, { secure: true }) : io.connect(this.url);
    this.manager = new ConsoleJS.Remote.RoomManager(this, this.socket);

    this.manager.online({ name: this.name });
    this.room = this.manager.getRoom({ name: this.name });
    this.room.subscribed();
    this.room.offline();

    this.socket.on('connect', function () {
        scope.room.online();
        scope.emit('info', 'Connected to the Server');
    });
    this.socket.on('reconnect', function () {
        scope.room.online();
        scope.emit('info', 'Reconnected to the Server');
    });
    this.socket.on('disconnect', function () {
        scope.room.offline();
        scope.emit('info', 'Disconnected from the Server');
    });
    this.socket.on('connect_failed', function () {
        scope.emit('warn', 'Failed to connect to the Server');
    });
    this.socket.on('error', function () {
        scope.emit('error', 'Socket Error');
    });

    this.socket.on('online', function (data) {
        scope.emit('log', 'online: ' + data.name + ', mode: ' + data.mode);
        scope.manager.online(data);
    });
    this.socket.on('offline', function (data) {
        scope.emit('log', 'offline: ' + data.name + ', mode: ' + data.mode);
        scope.manager.offline(data);
    });

    this.socket.on('subscribed', function (data) {
        scope.emit('log', 'Subscribed to ' + data.name);
        scope.manager.subscribed(data);
    });
    this.socket.on('unsubscribed', function (data) {
        scope.emit('log', 'Unsubscribed from ' + data.name);
        scope.manager.unSubscribed(data);
    });

    this.socket.on('console', function (data) {
        scope.manager.log(data);
    });
};

ConsoleJS.Remote.SocketServer.prototype.emit = function emit(eventName, message) {
    this.manager.log({
        name: this.name,
        type: eventName || 'log',
        message: message
    });
};

ConsoleJS.Remote.SocketServer.prototype.request = function request(data) {
    this.manager.command(data);
};
