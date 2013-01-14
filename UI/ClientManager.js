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

ClientManager.prototype.getClient = function getClient(id) {
    var length = this.clients.length;
    while (length > 0) {
        var client = this.clients[--length];
        if (client.id === id) {
            return client;
        }
    }
    return null;
}

ClientManager.prototype.add = function add(id, name) {
    this.clients.push(new Client(this, id, name, this.socket));
}

ClientManager.prototype.remove = function remove(id) {
    var client = this.getClient(id);
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

ClientManager.prototype.log = function log(id, data) {
    var client = this.getClient(id);
    if (client) {
        client.log(data);
    }
}

ClientManager.prototype.command = function command(data) {
    if(this.activeClient){
        this.activeClient.command(data);
    }
}

ClientManager.prototype.join = function join(id, room) {
    var client = this.getClient(id);
    if (client) {
        client.join(room);
    }
}

ClientManager.prototype.leave = function leave(id, room) {
    var client = this.getClient(id);
    if (client) {
        client.leave(room);
    }
}
