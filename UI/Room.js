/**
 * Created with IntelliJ IDEA.
 * User: Nisheeth
 * Date: 13/01/13
 * Time: 23:15
 * To change this template use File | Settings | File Templates.
 */

function Room(manager, data) {
    this.target = $("#clientList");
    this.manager = manager;
    this.name = data.name;
    this.isSubscribed = false;
    this.isActive = false;
    this.isOnline = false;
    this.console = new ConsoleUI(this);
    this.link = null;
}

Room.prototype.add = function add() {
    var self = this;
    this.link = $("<li><a href='#' id='link-" + this.name + "'>" + this.name + "</a></li>");

    this.link.find("a").click(function (e) {
        if (self.isSubscribed) {
            self.show();
        }

        if (!self.isSubscribed) {
            self.manager.emit('subscribe', { name: self.name });
        }
    });

    this.target.append(this.link);
    this.online();
}

Room.prototype.online = function online() {
    this.link.removeClass('offline');
    this.link.addClass('online');
    this.isOnline = true;
    if (this.isSubscribed) {
        this.console.online();
    }
}

Room.prototype.offline = function offline() {
    this.link.removeClass('online');
    this.link.addClass('offline');
    this.isOnline = false;
    if (this.isSubscribed) {
        this.console.offline();
    }
}

Room.prototype.setActive = function setActive(flag) {
    this.isActive = flag;
    if(this.isActive){
        this.link.addClass('active');
    }else{
        this.link.removeClass('active');
    }
    this.manager.setActive(this);
}

Room.prototype.command = function command(data) {
    if(this.isSubscribed){
        this.manager.emit('command', { name: this.name, data: data });
    }
}

Room.prototype.log = function log(data) {
    if(this.isSubscribed){
        this.console.log(data);
    }
}

Room.prototype.subscribed = function subscribed() {
    this.isSubscribed = true;
    this.console.add();
    this.console.show();
}

Room.prototype.unsubscribed = function unsubscribed() {
    this.isSubscribed = false;
    this.console.remove();
}

Room.prototype.show = function show() {
    this.console.show();
};

