/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 22/01/13
 * Time: 16:51
 * To change this template use File | Settings | File Templates.
 */

var log = document.getElementById('log'),
    connectionMode = document.getElementById('ConnectionMode'),
    maxItems = 50,
    removeItems = 30,
    currentItem = 0;

//    ConsoleJS.config({
//        nativeOverride: true,
//        nativeEnabled: true
//    });

ConsoleJS.on('console', function (data) {
    connectionMode.innerHTML = 'Connection mode: ' + (SocketJS.getConnectionMode() || 'Unknown');
    var li = document.createElement("li");
    li.innerHTML = data.type + ': ' + data.message;
    log.insertBefore(li, log.firstElementChild || log.firstChild);
    currentItem++;

    if (currentItem > maxItems) {
        var i = 0;
        while (i < removeItems) {
            log.removeChild(log.lastElementChild || log.lastChild);
            i++;
        }
        currentItem -= removeItems;
    }
});

var cmds = [
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
];

var length = cmds.length,
    currentIndex = 0;

setInterval(function () {
    if (currentIndex < length) {
        eval(cmds[currentIndex++]);
        eval(cmds[currentIndex++]);
    } else {
        currentIndex = 0;
    }
}, 3000);