/**
 * Created with IntelliJ IDEA.
 * User: Nisheeth
 * Date: 13/01/13
 * Time: 23:15
 * To change this template use File | Settings | File Templates.
 */
ConsoleJS.Utils.namespace("ConsoleJS.Remote.Room");

ConsoleJS.Remote.Room = function Room(manager, data) {
    this.target = $("#clientList");
    this.infoTarget = $('#connection');
    this.manager = manager;
    this.name = data.name;
    this.mode = data.mode;
    this.isSubscribed = false;
    this.isActive = false;
    this.isOnline = false;
    this.console = new ConsoleJS.Remote.Console(this);
    this.link = null;
    this.activeFilters = [];
}

ConsoleJS.Remote.Room.prototype.add = function add() {
    var self = this;
    this.link = $("<li><a href='#' id='link-" + this.name + "'>" + this.name + "</a></li>");

    this.link.find("a").click(function (e) {
        if (self.isSubscribed) {
            self.setActive(true);
        }

        if (!self.isSubscribed && self.isOnline) {
            self.emit('subscribe', { name: self.name });
        }
    });

    this.target.append(this.link);
    this.online();
};

ConsoleJS.Remote.Room.prototype.emit = function emit(eventName, data) {
    if (this.isOnline && eventName === 'unsubscribe') {
        this.unSubscribed();
    } else {
        this.manager.emit(eventName, data);
    }
};

ConsoleJS.Remote.Room.prototype.online = function online() {
    this.link.removeClass('offline');
    this.link.addClass('online');
    this.isOnline = true;
    if (this.isSubscribed) {
        this.console.online();
    }
};

ConsoleJS.Remote.Room.prototype.offline = function offline() {
    this.link.removeClass('online');
    this.link.addClass('offline');
    this.isOnline = false;
    if (this.isSubscribed) {
        this.console.offline();
    }
};

ConsoleJS.Remote.Room.prototype.setActive = function setActive(flag) {
    this.isActive = flag;
    if (this.isActive) {
        this.link.addClass('active');
    } else {
        this.link.removeClass('active');
    }
    this.manager.setActive(this);
    if (this.isActive) {
        this.show();
    }
};

ConsoleJS.Remote.Room.prototype.command = function command(data) {
    if (data === 'console.clear()') {
        this.console.clear();
    }

    if (data.indexOf('filter:') === 0) {
        data = data.split(":");
        this.filterLog(data[1], data[2] === "true");
        return false;
    }

    if (this.isSubscribed) {
        this.emit('command', { name: this.name, data: data });
    }
};

ConsoleJS.Remote.Room.prototype.filterLog = function filterLog(type, state) {
    this.console.filter(type, state);
};

ConsoleJS.Remote.Room.prototype.log = function log(data) {
    if (this.isSubscribed && this.activeFilters.indexOf(data.guid) === -1) {
        this.console.log(data, !this.isActive);
    }
};

ConsoleJS.Remote.Room.prototype.subscribed = function subscribed() {
    this.isSubscribed = true;
    this.console.add();
    this.setActive(true);
};

ConsoleJS.Remote.Room.prototype.unSubscribed = function unSubscribed() {
    this.isSubscribed = false;
    this.console.remove();
    this.setActive(false);
};

ConsoleJS.Remote.Room.prototype.getTransportMode = function getTransportMode() {
    var transport = this.manager.socket.socket.transport,
        list = this.manager.socket.socket.transports,
        mode = '',
        length;

    if (list) {
        length = list.length;
        while (length > 0) {
            mode = list[--length];
            if (transport[mode]) {
                break;
            }
        }
    }

    return mode;
};

ConsoleJS.Remote.Room.prototype.show = function show() {
    this.mode = this.mode || this.getTransportMode();

    if (this.mode) {
        var i = 0,
            mode = this.mode.split(","),
            length = mode.length;

        this.resetConnectionInfo();

        while (i < length) {
            var item = mode[i++].split(":"),
                id = item[0],
                label = item[1],
                link = $("<li class='active'><a href='#' id='info-" + id + "' title='" + id + "'>" + (i + ". " + (label || id)) + "</a></li>");

            link.find("a").click($.proxy(this.filter, this));
            this.infoTarget.append(link);
        }
    }

    this.console.show();
};

ConsoleJS.Remote.Room.prototype.filter = function filter(e) {
    var item = $(e.target),
        id = item.attr("title"),
        parent = item.parent(),
        index = this.activeFilters.indexOf(id);

    if (index > -1) {
        this.activeFilters.splice(index, 1);
        parent.addClass('active');
    } else {
        this.activeFilters.push(id);
        parent.removeClass('active');
    }
};

ConsoleJS.Remote.Room.prototype.resetConnectionInfo = function resetConnectionInfo() {
    var length = this.infoTarget.children().length;

    while (length > 1) {
        --length;
        this.infoTarget.children().last().remove();
    }
};
