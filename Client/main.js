/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 22/01/13
 * Time: 16:51
 * To change this template use File | Settings | File Templates.
 */
var domReady = false;

function init() {

    "use strict";

    if (domReady) {
        return;
    }

    domReady = true;

    var log = document.getElementById('log'),
        connectionMode = document.getElementById('ConnectionMode'),
        debug = document.getElementById('debug'),
        maxItems = 50,
        removeItems = 30,
        currentItem = 0,
        currentIndex = 0,
        Commands = [
            "console.log('log test');",
            "console.info('info test');",
            "console.warn('warn test');",
            "console.debug('debug test');",
            "console.assert(1 === 1, 'assert test');",
            "console.assert(1 !== 1, 'assert test');",
            "console.dir(document.getElementById('dummy'));",
            "console.dirxml(document.getElementById('dummy'));",
            "console.time('test');",
            "console.time('test-child');",
            "console.count('test');",
            "console.count('test-child');",
            "console.count('test-child');",
            "console.count('test');",
            "console.timeEnd('test-child');",
            "console.timeEnd('test');",
            "console.trace();",
            "console.error();"
        ],
        length = Commands.length;

    setInterval(function () {
        if (currentIndex < length) {
            eval(Commands[currentIndex++]);
            eval(Commands[currentIndex++]);
        } else {
            currentIndex = 0;
        }
    }, 3000);

    //    ConsoleJS.config({
    //        nativeOverride: true,
    //        nativeEnabled: true
    //    });

    window.onerror = function (msg, url, line) {
        debug.innerHTML += '<br/>Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + line;
        return true;
    };

    function stripBrackets(data) {
        var last = data.length - 1;
        if (data.charAt(0) === '[' && data.charAt(last) === ']') {
            return data.substring(1, last);
        }
        return data;
    }

    function parse(data) {
        var message = stripBrackets(data.message);

        // for Opera and Maple browser
        message = message.replace(/%20/img, " ");

        if (data.stack) {
            var stack = data.stack.split(",")
                .join("\n")
                .replace(/"/img, '')
                .replace(/%20/img, ' ');

            message += '\n';
            message += stripBrackets(stack);
        }

        return message;
    }

    ConsoleJS.on('console', function (data) {
        var i = 0,
            connection = '',
            li = document.createElement("li");

        if (SocketJS) {
            connection = SocketJS.getConnectionStatus() + ' : ' + SocketJS.getConnectionMode();
        }

        connectionMode.innerHTML = 'Info: ' + connection;
        li.innerHTML = '<b>' + data.type + ':</b> ' + parse(data);
        log.insertBefore(li, log.firstElementChild || log.firstChild);
        currentItem++;

        if (currentItem > maxItems) {
            while (i < removeItems) {
                log.removeChild(log.lastElementChild || log.lastChild);
                i++;
            }
            currentItem -= removeItems;
        }
    });
}

ConsoleJS.ready(init);