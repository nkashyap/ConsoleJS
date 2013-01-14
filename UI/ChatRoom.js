/**
 * Created with IntelliJ IDEA.
 * User: Nisheeth
 * Date: 13/01/13
 * Time: 23:16
 * To change this template use File | Settings | File Templates.
 */

function ChatRoom(client, id, name, room) {
    this.target = $("#connectRooms");
    this.contentTarget = $("#connectRoomsContent");
    this.id = id;
    this.name = name;
    this.client = client;
    this.room = room;
    this.tab = null;
    this.content = null;
    this.table = null;

    this.add();
}

ChatRoom.prototype.add = function add() {
    this.tab = $("<li><a href='#" + this.id + "Tab' data-toggle='tab'>" + this.name + "</a></li>");
    this.content = $("<div class='tab-pane fade' id='" + this.id + "Tab'></div>");
    this.table = $("<table id='" + this.id + "Log' class='table table-hover table-condensed'></table>");

    var self = this;
    this.tab.click(function (e) {
        self.show();
    });

    this.content.append(this.table);
    this.contentTarget.append(this.content);
    this.target.append(this.tab);
    this.show();
}

ChatRoom.prototype.show = function show() {
    var index = this.target.find("li").index(this.tab),
        content = this.contentTarget.find('> div'),
        activeContent = this.contentTarget.find('> div:eq(' + index + ')');

    this.target.find("li").removeClass();
    content.removeClass('fade active');
    content.hide();

    this.tab.addClass('selected active');
    activeContent.show();
    activeContent.addClass('active');

    this.client.active(true);
}

ChatRoom.prototype.remove = function remove() {
    if (this.tab) {
        this.tab.remove();
    }
    if (this.content) {
        this.content.remove();
    }
    this.client.active(false);
}

ChatRoom.prototype.leave = function leave() {
    console.log('Left' + this.room);
}

ChatRoom.prototype.addLog = function addLog(data) {
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
    var msg = $('<td><p class="text ' + (css ? 'text-' + css : '') + '">' + (data.message || '') + '</p></td>');

    row.append(title);
    row.append(msg);
    this.table.prepend(row);
}