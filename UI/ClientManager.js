/**
 * Created with IntelliJ IDEA.
 * User: Nisheeth
 * Date: 13/01/13
 * Time: 23:15
 * To change this template use File | Settings | File Templates.
 */

function ClientManager(socket) {
    this.clients = [];
    this.socket = socket;
    this.activeClient = null;
}

ClientManager.prototype.getClient = function getClient(data) {
    var length = this.clients.length;
    while (length > 0) {
        var client = this.clients[--length];
        if (client.name === data.name) {
            return client;
        }
    }
    return null;
}

ClientManager.prototype.add = function add(data) {
    this.clients.push(new Client(this, data, this.socket));
}

ClientManager.prototype.remove = function remove(data) {
    var client = this.getClient(data);
    if (client) {
        this.clients.splice(this.clients.indexOf(client), 1);
        client.remove();
    }
}

ClientManager.prototype.active = function active(client) {
    if(client.isActive && this.activeClient){
        if(this.activeClient !== client){
            this.activeClient.isActive = false;
        }
    }
    this.activeClient = client;
}

ClientManager.prototype.log = function log(data) {
    var client = this.getClient(data);
    if (client) {
        client.log(data);
    }
}

ClientManager.prototype.command = function command(data) {
    if(this.activeClient){
        this.activeClient.command(data);
    }
}

ClientManager.prototype.join = function join(data) {
    var client = this.getClient(data);
    if (client) {
        client.join();
    }
}

ClientManager.prototype.leave = function leave(data) {
    var client = this.getClient(data);
    if (client) {
        client.leave();
    }
}
