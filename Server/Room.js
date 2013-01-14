/**
 * Created with IntelliJ IDEA.
 * User: Nisheeth
 * Date: 14/01/13
 * Time: 18:21
 * To change this template use File | Settings | File Templates.
 */

function Room(manager, console, data) {
    this.manager = manager;
    this.console = console;
    this.name = data.name;
    this.enabled = false;
    this.clients = [];

    this.console.bind(this);
}

Room.prototype.bind = function bind(console) {
    this.console = console;
    this.console.bind(this);
};

Room.prototype.online = function online() {
    this.enabled = true;
    this.console.subscribe(this.name);
    this.manager.emit('online', { name: this.name });
};

Room.prototype.offline = function offline() {
    this.enabled = false;
    this.console.unSubscribe(this.name);
    this.manager.emit('offline', { name: this.name });
};

Room.prototype.subscribe = function subscribe(client) {
    if (this.clients.indexOf(client) === -1) {
        this.clients.push(client);
        client.subscribe(this.name);
    }
};

Room.prototype.unSubscribe = function unSubscribe(client) {
    var index = this.clients.indexOf(client);
    if (index > -1) {
        client.unSubscribe(this.name);
        this.clients.splice(index, 1);
    }
};


Room.prototype.log = function log(data) {
    this.clients.forEach(function (client) {
        client.emit('console', data);
    });
};

Room.prototype.command = function command(data) {
    this.console.emit('command', data);
};


Room.prototype.remove = function remove() {
//    var self = this;
//    this.clients.forEach(function (clientSocket) {
//        self.emit('unsubscribed', { name : self.name }, clientSocket);
//        clientSocket.leave(self.name);
//    });
//    this.offline();
//    this.clients = [];
};


module.exports = Room;