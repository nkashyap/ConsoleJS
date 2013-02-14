/**
 * Created with IntelliJ IDEA.
 * User: Nisheeth
 * Date: 13/01/13
 * Time: 23:16
 * To change this template use File | Settings | File Templates.
 */

function ConsoleUI(room) {
    this.target = $("#connectRooms");
    this.contentTarget = $("#connectRoomsContent");
    this.room = room;
    this.name = this.room.name;
    this.tab = null;
    this.content = null;
    this.count = 0;
    this.styles = {};
}

ConsoleUI.prototype.add = function add() {
    var self = this;
    this.tab = $("<li><a href='#Tab-" + this.name + "' data-toggle='tab'>" + this.name + "&nbsp;<button class='close'>&times;</button></a></li>");
    this.content = $("<div class='tab-pane fade' id='Content-" + this.name + "'></div>");

    this.tab.click(function (e) {
        if (e.target.tagName.toLowerCase() === 'button') {
            self.emit('unsubscribe', { name: self.name });
        } else {
            self.room.setActive(true);
        }
    });

    this.contentTarget.append(this.content);
    this.target.append(this.tab);
    this.online();
};

ConsoleUI.prototype.remove = function remove() {
    if (this.content) {
        this.content.remove();
        this.content = null;
    }
    if (this.tab) {
        this.tab.remove();
        this.tab = null;
    }
};

ConsoleUI.prototype.emit = function emit(eventName, data) {
    this.room.emit(eventName, data);
};

ConsoleUI.prototype.clear = function clear() {
    if (this.content) {
        this.content.empty();
    }
};

ConsoleUI.prototype.online = function online() {
    this.tab.removeClass('offline');
    this.tab.addClass('online');
};

ConsoleUI.prototype.offline = function remove() {
    this.tab.removeClass('online');
    this.tab.addClass('offline');
};

ConsoleUI.prototype.show = function show() {
    var index = this.target.find("li").index(this.tab),
        content = this.contentTarget.find('> div'),
        activeContent = this.contentTarget.find('> div:eq(' + index + ')');

    this.target.find("li").removeClass('selected active');
    content.removeClass('fade active');
    content.hide();

    this.tab.find('a').removeClass('notify');
    this.tab.addClass('selected active');
    activeContent.show();
    activeContent.addClass('active');
};

ConsoleUI.prototype.log = function log(data, notify) {
    var tag = 'code',
        css = data.type,
        message = this.stripBrackets(data.message);

    // check if asset failed
    if (data.type === "assert") {
        var asset = this.stripBrackets(message).split(",");
        if (asset[0].toLowerCase() !== "true") {
            css = "assert-failed";
        }
    }

    // for Opera and Maple browser
    message = message.replace(/%20/img, " ");

    // switch to pre mode if message contain object
    if (message.indexOf("{") > -1 && message.indexOf("}") > -1) {
        tag = 'pre';
    }

    message = prettyPrintOne(message);

    if (data.stack) {
        var stack = data.stack.split(",")
            .join("\n")
            .replace(/"/img, '')
            .replace(/%20/img, ' ');

        message += '\n';
        message += prettyPrintOne(this.stripBrackets(stack));
    }

    if (['assert', 'dir', 'dirxml', 'error', 'trace'].indexOf(data.type) > -1) {
        tag = 'pre';
    }

    var msg = $('<' + tag + ' class="console type-' + css + ' ' + this.getStyles(data.guid) + '">' + (message || '.') + '</' + tag + '>');

    this.content.prepend(msg);

    if (notify) {
        this.tab.find('a').addClass('notify');
    }

    this.count++;
    this.cleanUp();
};

ConsoleUI.prototype.getStyles = function getStyles(id) {
    if (id) {
        var className = "log-" + id;

        if (!this.styles[id]) {
            this.styles[id] = $('<style type="text/css">.' + className + '::before { content: "' + id + '"; }</style>');
            $('html > head').append(this.styles[id]);
        }

        return className;
    }

    return (id || "none");
};

ConsoleUI.prototype.stripBrackets = function stripBrackets(data) {
    var last = data.length - 1;
    if (data.charAt(0) === '[' && data.charAt(last) === ']') {
        return data.substring(1, last);
    }
    return data;
};

ConsoleUI.prototype.cleanUp = function cleanUp() {
    if (this.count > Config.cacheCount) {
        do {
            this.content.children().last().remove();
            this.count--;
        } while (this.count >= Config.maxLogs);
    }
};