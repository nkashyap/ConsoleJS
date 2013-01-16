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

    var message = this.getData(data.type, data.message); //getMessage(data.type, data.message);

    //var title = $('<td><span class="label ' + (css ? 'label-' + css : '') + '">' + (data.type || '') + '</span></td>');
    var msg = $('<td><span class="label ' + (css ? 'label-' + css : '') + '">' + (data.type || '') + '</span><code>' + (message || '') + '</code></td>');
    //var msg = $('<td><code style="padding-left:20px;" class="prettyprint">' + (message || '') + '</code></td>');

    //row.append(title);
    row.append(msg);
    this.table.prepend(row);

    //prettyPrint();

    if(notify){
        this.tab.find('a').addClass('notify');
    }
};

ConsoleUI.prototype.stripBrackets = function stripBrackets(data) {
    var last = data.length - 1;
    if(data.charAt(0) === '[' && data.charAt(last) === ']'){
        return data.substring(1, last);
    }
    return data;
};

ConsoleUI.prototype.getData = function getData(type, data) {
    data = this.stripBrackets(data);
    switch (type) {
        case 'trace':
        case 'error':
        case 'assert':
        case 'debug':
        case 'time':
        case 'warn':
        case 'info':
        case 'log':
            break;
    }
    return data;
}

function JSONParse(data) {
    try {
        return JSON.parse(data);
    } catch (ex) {
        return data;
    }
}

function getMessage(data){
    var message = JSONParse(data);
    var type =  getType(message);
    switch (type) {
        case 'StringArray':
            message = message.join(',');
            break;
        case 'StringJSONArray':
            //message = getStringJON(message);
            break;
        case 'StringArrayObject':
            break;
        case 'ArrayMix':
            break;
        case 'String':
            break;
        default:
            break;
    }
    console.log(type, message);
    return message;
}

function getStringJON(data){
    var result = [];
    forEach(data, function(item){
        var type = typeof item;
        if(['number','string','boolean','null','undefined'].indexOf(type) > -1){
            result.push(item);
        }else{
            var json = [];
            for(var prop in item){
                if(item.hasOwnProperty(prop)){
                    json.push(prop +": "+ item[prop]);
                }
            }

            result.push("{ " + json.join(",") + " }");
        }
    });
    return result.join(",");
}

function getType(data){
    var type;
    if(isArray(data)){
        if(isStringOnly(data)){
            type = 'StringArray';
//        }else if(isStringJSONOnly(data)){
//            type = 'StringJSONArray';
        }else{
            type = 'ArrayMix';
        }
    } else if (typeof data === 'string'){
        type = 'String';
    }else{
        type = 'Unknown';
    }
    return type;
}

function isStringOnly(data){
    var list = filter(data, function(item){
        return (item && typeof(item) === 'object');
    });

    return list.length === 0;
}

function isStringJSONOnly(data){
    var list = filter(data, function(item){
        var type = typeof item;
        if(['number','string','boolean','null','undefined'].indexOf(type) > -1){
            return false;
        }

        return (item.constructor !== 'Object');
    });

    return list.length === 0;
}


function isArray(data){
    return Object.prototype.toString.call(data) === '[object Array]';
}

var filter  = (function(){
    if(Array.prototype.filter){
        return function(array, callback){
            return array.filter(callback);
        }
    }else{
        return function(array, callback){
            var i = 0, length = array.length, result = [];
            if(length){
                do{
                    var value = array[i];
                    if(callback.call(array, value, i, array)){
                        result.push(value);
                    }
                }while(i < length)
            }
            return result;
        }
    }
}());

var forEach  = (function(){
    if(Array.prototype.forEach){
        return function(array, callback){
            array.forEach(callback);
        }
    }else{
        return function(array, callback){
            var i = 0, length = array.length;
            if(length){
                do{
                    callback.call(array, array[i], i, array);
                }while(i < length)
            }
        }
    }
}());