/**
 * Created with IntelliJ IDEA.
 * User: Nisheeth
 * Date: 13/01/13
 * Time: 23:15
 * To change this template use File | Settings | File Templates.
 */

function Client(manager, id, name, socket) {
    this.target = $("#clientList");
    this.manager = manager;
    this.id = id;
    this.name = name;
    this.socket = socket;
    this.subscribe = false;
    this.isActive = false;
    this.link = null;
    this.chatRoom = null;

    this.add();
}

Client.prototype.add = function add() {
    var self = this;
    this.link = $("<li><a href='#' id='" + this.id + "'>" + this.name + "</a></li>");
    this.link.find("a").click(function (e) {

        if (self.subscribe && self.chatRoom) {
            self.chatRoom.show();
        }

        if (!self.subscribe) {
            console.log('Subscribing to room', { id: self.id, room: self.name });
            self.socket.emit('subscribe', { id: self.id, room: self.name });
            self.subscribe = true;
        }
    });

    this.target.append(this.link);
}

Client.prototype.remove = function remove() {
    if (self.subscribe) {
        console.log('unsubscribe', { id: self.id, room: self.name });
        self.socket.emit('unsubscribe', { id: self.id, room: self.name });
    }

    if (this.link) {
        this.link.remove();
    }
    this.manager.active(this, false);
}

Client.prototype.active = function active(flag) {
    this.isActive = flag;
    this.manager.active(this);
}

Client.prototype.command = function command(data) {
    console.log('command', { id: this.id, room: this.name, data: data });
    this.socket.emit('command', { id: this.id, room: this.name, data: data });
}

Client.prototype.log = function log(data) {
    if (this.chatRoom) {
        this.chatRoom.addLog(data);
    }
}

Client.prototype.join = function join(room) {
    this.chatRoom = new ChatRoom(this, this.id, this.name, room);
}

Client.prototype.leave = function leave(room) {
    if (this.chatRoom) {
        this.chatRoom.leave(room);
    }
}

