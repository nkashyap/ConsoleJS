var ControlClient = require('./ControlClient'),
    ConsoleClient = require('./ConsoleClient');

function ConnectionManager(server){
    this.server = server;
    this.clients = [];
    this.consoles = [];
}

ConnectionManager.prototype.isControlClient = function isControlClient(socket){
    //TODO check shortcut to xdomain
    return socket.manager.handshaken[socket.id].xdomain;
};

ConnectionManager.prototype.add = function add(socket){
    if(this.isControlClient(socket)){
        this.clients.push(new ControlClient(this, socket));
    }else{
        this.consoles.push(new ConsoleClient(this, socket));
    }
};

ConnectionManager.prototype.remove = function remove(socket){
    var removeFrom = (this.isControlClient(socket)) ? this.clients : this.consoles;
    var list = removeFrom.filter(function(item){
        return (item.id === socket.id)
    });
    removeFrom = removeFrom.filter(function(item){
        if(list.indexOf(item) >-1){
            item.remove();
            return false;
        }
        return true;
    });
};


ConnectionManager.prototype.subscribe = function subscribe(socket, data){

};

ConnectionManager.prototype.unSubscribe = function unSubscribe(socket, data){

};


ConnectionManager.prototype.console = function console(socket, data){

};

ConnectionManager.prototype.command = function command(socket, data){

};

module.exports = ConnectionManager;