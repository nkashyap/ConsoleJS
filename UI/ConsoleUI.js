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
    this.table = null;
}

ConsoleUI.prototype.add = function add() {
    var self = this;
    this.tab = $("<li><a href='#Tab-" + this.name + "' data-toggle='tab'>" + this.name + "</a></li>");
    this.content = $("<div class='tab-pane fade' id='Content-" + this.name + "'></div>");
    this.table = $("<table id='Log-" + this.name + "' class='table table-hover table-condensed'></table>");

    this.tab.click(function (e) {
        self.room.show();
    });

    this.content.append(this.table);
    this.contentTarget.append(this.content);
    this.target.append(this.tab);
    this.online();
};

ConsoleUI.prototype.remove = function remove() {
    if(this.table){
        this.table.remove();
    }
    if(this.content){
        this.content.remove();
    }
    if(this.tab){
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
    var row = $("<tr></tr>"),
        css = '';

    //success
    switch (data.type) {
        case 'assert':
        case 'error':
            css = 'important';
            break;
        case 'warn':
            css = 'warning';
            break;
        case 'info':
            css = 'info';
            break;
        case 'trace':
        case 'debug':
            css = 'inverse';
            break;

    }

    var title = $('<td><span class="label ' + (css ? 'label-' + css : '') + '">' + (data.type || '') + '</span></td>');
    var msg = $('<td><code class="prettyprint">' + (data.message || '') + '</code></td>');

    row.append(title);
    row.append(msg);
    this.table.prepend(row);

    prettyPrint();

    if(notify){
        this.tab.find('a').addClass('notify');
    }
};