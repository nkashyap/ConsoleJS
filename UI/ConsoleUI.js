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
}

ConsoleUI.prototype.add = function add() {
    var self = this;
    this.tab = $("<li><a href='#Tab-" + this.name + "' data-toggle='tab'>" + this.name + "</a></li>");
    this.content = $("<div class='tab-pane fade' id='Content-" + this.name + "'></div>");

    this.tab.click(function (e) {
        self.room.show();
    });

    this.contentTarget.append(this.content);
    this.target.append(this.tab);
    this.online();
};

ConsoleUI.prototype.remove = function remove() {
    if (this.content) {
        this.content.remove();
    }
    if (this.tab) {
        this.tab.remove();
    }

    this.room.setActive(false);
};

ConsoleUI.prototype.online = function online() {
    this.tab.removeClass('offline');
    this.tab.addClass('online');
}

ConsoleUI.prototype.offline = function remove() {
    this.tab.removeClass('online');
    this.tab.addClass('offline');
}

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

    this.room.setActive(true);
};

ConsoleUI.prototype.log = function log(data, notify) {
    var css = '', tag = 'pre';
    var message = this.stripBrackets(data.message);
    message = prettyPrintOne(message);

    if (data.stack) {
        message += '\n';
        message += prettyPrintOne(this.stripBrackets(data.stack.split(",").join("\n").replace(/"/img, '')));
    }

    var msg = $('<' + tag + ' class="console type-' + data.type + ' ' + css + '">' + (message || '') + '</' + tag + '>');
    this.content.prepend(msg);

    if (notify) {
        this.tab.find('a').addClass('notify');
    }
};

ConsoleUI.prototype.stripBrackets = function stripBrackets(data) {
    var last = data.length - 1;
    if (data.charAt(0) === '[' && data.charAt(last) === ']') {
        return data.substring(1, last);
    }
    return data;
};

//function isArray(data) {
//    return Object.prototype.toString.call(data) === '[object Array]';
//}
//
//var filter = (function () {
//    if (Array.prototype.filter) {
//        return function (array, callback) {
//            return array.filter(callback);
//        }
//    } else {
//        return function (array, callback) {
//            var i = 0, length = array.length, result = [];
//            if (length) {
//                do {
//                    var value = array[i];
//                    if (callback.call(array, value, i, array)) {
//                        result.push(value);
//                    }
//                } while (i < length)
//            }
//            return result;
//        }
//    }
//}());
//
//var forEach = (function () {
//    if (Array.prototype.forEach) {
//        return function (array, callback) {
//            array.forEach(callback);
//        }
//    } else {
//        return function (array, callback) {
//            var i = 0, length = array.length;
//            if (length) {
//                do {
//                    callback.call(array, array[i], i, array);
//                } while (i < length)
//            }
//        }
//    }
//}());