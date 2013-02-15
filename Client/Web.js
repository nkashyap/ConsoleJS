/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 22/01/13
 * Time: 13:20
 * To change this template use File | Settings | File Templates.
 */

ConsoleJS.Web = (function (console) {

    "use strict";

    var logger,
        previewMode = ['assert', 'dir', 'dirxml', 'error', 'trace'],
        hasPrettify = false,
        settings = {
            docked: true,
            position: 'bottom', //top/bottom
            height: '500px',
            width: '99%',
            maxLogs: 10,
            cache: 1.5 // times of maxLogs
        },
        count = 0,
        cacheCount = (settings.maxLogs * settings.cache),
        domReady = false;


    function stripBrackets(data) {
        var last = data.length - 1;
        if (data.charAt(0) === '[' && data.charAt(last) === ']') {
            return data.substring(1, last);
        }
        return data;
    }

    function addLog(data) {
        var tag = 'code',
            css = data.type,
            message = stripBrackets(data.message);

        // check if asset failed
        if (data.type === "assert") {
            var asset = stripBrackets(message).split(",");
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

        if (hasPrettify) {
            message = prettyPrintOne(message);
        }

        if (data.stack) {
            var stack = data.stack.split(",")
                .join("\n")
                .replace(/"/img, '')
                .replace(/%20/img, ' ');

            stack = stripBrackets(stack);

            message += '\n';
            message += (hasPrettify) ? prettyPrintOne(stack) : stack;
        }

        if (previewMode.indexOf(data.type) > -1) {
            tag = 'pre';
        }

        var row = document.createElement(tag);
        row.className = "console type-" + css;
        row.innerHTML = message || "";

        logger.insertBefore(row, logger.firstElementChild || logger.firstChild);

        count++;
        cleanUp();
    }

    function cleanUp() {
        if (count > cacheCount) {
            do {
                logger.removeChild(logger.lastElementChild || logger.lastChild);
                count--;
            } while (count >= settings.maxLogs);
        }
    }

    function createLogger() {
        logger = document.createElement('div');
        logger.id = "logger";
    }

    function setPosition() {
        var style = '';

        if (!settings.docked) {
            style += 'position:absolute;';
        }
        if (settings.height) {
            style += 'height:' + settings.height + ';';
        }
        if (settings.width) {
            style += 'width:' + settings.width + ';';
        }

        switch (settings.position.toLowerCase()) {
            case 'top':
                style += 'top: 5px;';
                if (settings.docked) {
                    if (logger.parentNode) {
                        logger.parentNode.removeChild(logger);
                    }
                    document.body.insertBefore(logger, document.body.firstElementChild || document.body.firstChild);
                }
                break;
            case 'bottom':
                style += 'bottom: 5px;';
                if (settings.docked) {
                    if (logger.parentNode) {
                        logger.parentNode.removeChild(logger);
                    }
                    document.body.appendChild(logger);
                }
                break;
        }

        logger.setAttribute('style', style);
    }

    function config(cfg) {
        console.Utils.merge(cfg, settings);
        cacheCount = settings.maxLogs * settings.cache;
        setPosition();
    }

    function init() {
        if (domReady) {
            return;
        }

        domReady = true;

        //detect prettifier
        hasPrettify = !!console.Utils.getScriptURL('prettify.js');

        createLogger();
        setPosition();
    }


    //Hook into ConsoleJS API
    console.on('console', function (data) {
        addLog(data);
    });

    console.ready(init);

    return {
        config: config
    };

})(ConsoleJS);