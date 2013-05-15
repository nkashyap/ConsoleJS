/**
 * Created with IntelliJ IDEA.
 * User: Nisheeth
 * Date: 13/01/13
 * Time: 23:16
 * To change this template use File | Settings | File Templates.
 */
ConsoleJS.Utils.namespace("ConsoleJS.Remote.Console");

ConsoleJS.Remote.Console = function Console(room) {
    this.target = $("#connectRooms");
    this.contentTarget = $("#connectRoomsContent");
    this.room = room;
    this.name = this.room.name;
    this.tab = null;
    this.content = null;
    this.count = 0;
    this.styles = {};
    this.filters = [];
    var store = ConsoleJS.Remote.Store.Memory.get(this.name);
    this.preservedLogs = store ? store.length : 0;
}

ConsoleJS.Remote.Console.prototype.add = function add() {
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

ConsoleJS.Remote.Console.prototype.remove = function remove() {
    if (this.content) {
        this.content.remove();
        this.content = null;
    }
    if (this.tab) {
        this.tab.remove();
        this.tab = null;
    }
};

ConsoleJS.Remote.Console.prototype.emit = function emit(eventName, data) {
    this.room.emit(eventName, data);
};

ConsoleJS.Remote.Console.prototype.clear = function clear() {
    if (this.content) {
        this.content.empty();
    }
};

ConsoleJS.Remote.Console.prototype.online = function online() {
    this.tab.removeClass('offline');
    this.tab.addClass('online');
};

ConsoleJS.Remote.Console.prototype.offline = function remove() {
    this.tab.removeClass('online');
    this.tab.addClass('offline');
};

ConsoleJS.Remote.Console.prototype.show = function show() {
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

ConsoleJS.Remote.Console.prototype.filter = function filter(type, state) {
    var index = this.filters.indexOf(type),
        css = '.console.type-' + type;

    if (state) {
        if (index === -1) {
            this.filters.push(type);
            $(css).addClass("hidden");
        }
    } else {
        if (index > -1) {
            this.filters.splice(index, 1);
            $(css).removeClass("hidden");
        }
    }
};

ConsoleJS.Remote.Console.prototype.log = function log(data, notify) {
    var tag = 'code',
        css = data.type,
        stackMessage,
        messagePreview,
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

    messagePreview = prettyPrintOne(message);

    if (data.stack) {
        var stack = data.stack.split(",")
            .join("\n")
            .replace(/"/img, '')
            .replace(/%20/img, ' ');

        stackMessage = this.stripBrackets(stack);
        messagePreview += '\n' + prettyPrintOne(stackMessage);
    }

    // store in session memory
    //this.store(data.type, message, stackMessage);

    if (['assert', 'dir', 'dirxml', 'error', 'trace'].indexOf(data.type) > -1) {
        tag = 'pre';
    }

    if (this.filters.indexOf(css) > -1) {
        css += ' hidden';
    }

    var msg = $('<' + tag + ' class="console type-' + css + ' ' + this.getStyles(data.guid) + '">' + (messagePreview || '.') + '</' + tag + '>');

    this.content.prepend(msg);

    if (notify) {
        this.tab.find('a').addClass('notify');
    }

    this.count++;
    this.cleanUp();
};

ConsoleJS.Remote.Console.prototype.getStyles = function getStyles(id) {
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

ConsoleJS.Remote.Console.prototype.stripBrackets = function stripBrackets(data) {
    var last = data.length - 1;
    if (data.charAt(0) === '[' && data.charAt(last) === ']') {
        return data.substring(1, last);
    }
    return data;
};

ConsoleJS.Remote.Console.prototype.store = function store(type, message, stack) {
    var preserveLogs = ConsoleJS.Remote.Config.get("preserveLogs"),
        maxLogPreserved = ConsoleJS.Remote.Config.get("maxLogPreserved"),
        storeCache = ConsoleJS.Remote.Config.get("storeCache");

    // store in session memory
    if (preserveLogs) {
        ConsoleJS.Remote.Store.Memory.append(this.name, { type: type, message: message, stack: stack });
        this.preservedLogs++;

        if (this.preservedLogs > storeCache) {
            var store = ConsoleJS.Remote.Store.Memory.get(this.name);
            store.splice(0, storeCache - maxLogPreserved);
            ConsoleJS.Remote.Store.Memory.set(this.name, store);
        }
    }
};

ConsoleJS.Remote.Console.prototype.cleanUp = function cleanUp() {
    var maxLogs = ConsoleJS.Remote.Config.get("maxLogs");
    if (this.count > ConsoleJS.Remote.Config.get("logCache")) {
        do {
            this.content.children().last().remove();
            this.count--;
        } while (this.count >= maxLogs);
    }
};