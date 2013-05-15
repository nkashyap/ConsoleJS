/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 22/01/13
 * Time: 13:20
 * To change this template use File | Settings | File Templates.
 */

ConsoleJS.Socket = (function (console, io) {

    "use strict";

    var name = console.Browser ? console.Browser.toString() : window.navigator.userAgent,
        forceReconnectInterval = 5000,
        forceReconnect = true,
        forceInterval,
        cookieName = "guid",
        pendingRequests = [],
        paused = false,
        subscribed = false,
        connectionMode = null,
        domReady = false,
        socket;


    // Fix for old Opera and Maple browsers
    (function overrideJsonPolling() {
        var original = io.Transport["jsonp-polling"].prototype.post;

        io.Transport["jsonp-polling"].prototype.post = function (data) {
            var self = this;
            original.call(this, data);
            setTimeout(function () {
                self.socket.setBuffer(false);
            }, 250);
        };
    }());


    function request(eventName, data) {
        if (socket && socket.socket.connected && subscribed && !paused) {
            data.name = name;
            socket.emit(eventName, data);
        } else {
            pendingRequests.push({ type: eventName, data: data });
        }
    }

    function processPendingRequest() {
        console.Utils.forEach(pendingRequests, function (item) {
            request(item.type, item.data);
        });
        pendingRequests = [];
    }

    function pause() {
        paused = true;
        return paused;
    }

    function resume() {
        paused = false;
        processPendingRequest();
        return paused;
    }

    function getConnectionMode() {
        return connectionMode;
    }

    function getConnectionStatus() {
        return socket && socket.socket.connected ? 'Connected' : 'Disconnected';
    }

    function getCookie(name) {
        if (document && document.cookie) {
            var i,
                cookieName,
                cookieValue,
                cookies = document.cookie.split(";");

            for (i = 0; i < cookies.length; i++) {
                cookieName = (cookies[i].substr(0, cookies[i].indexOf("="))).replace(/^\s+|\s+$/g, "");
                cookieValue = cookies[i].substr(cookies[i].indexOf("=") + 1);

                if (cookieName === name) {
                    return unescape(cookieValue);
                }
            }
        }

        return null;
    }

    function showGuid(content) {
        var className = "console-content",
            styleId = "guid-style";

        if (!document.getElementById(styleId)) {
            var css = "." + className + "::after { content: '" + content + "'; position: fixed; top: 0px; left: 0px; padding: 2px 8px; font-size: 12px; font-weight: bold; color: rgb(111, 114, 117); background-color: rgba(192, 192, 192, 0.5); border: 1px solid rgb(111, 114, 117); font-family: Monaco,Menlo,Consolas,'Courier New',monospace; };",
                head = document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            style.type = 'text/css';
            style.id = styleId;

            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            head.appendChild(style);
        }

        (document.body.firstElementChild || document.body.firstChild).setAttribute("class", className);
    }

    function forceConnect() {
        if (forceReconnect && !forceInterval) {
            forceInterval = setInterval(function () {
                if (!socket.socket.connected || (socket.socket.connected && !subscribed)) {
                    socket.socket.disconnect();
                    socket.socket.reconnect();
                }
            }, forceReconnectInterval);
        }
    }

    function init() {
        if (domReady) {
            return;
        }

        domReady = true;

        var url = console.Utils.getScriptURL('socket.io');
        socket = io.connect(url, { secure: (url.indexOf("https") > -1), 'sync disconnect on unload': true });

        socket.on('connect', function () {
            var guid = getCookie(cookieName);
            if (guid) {
                showGuid(guid);
            }

            socket.emit('subscribe', { name: name });
            console.log('Connected to the Server');
            console.log('Subscribing to', { name: name });

            forceConnect();
        });

        socket.on('connecting', function (mode) {
            connectionMode = mode;
            console.log('Connecting to the Server');
        });

        socket.on('reconnect', function (mode, attempts) {
            connectionMode = mode;
            socket.emit('subscribe', { name: name });
            console.log('Reconnected to the Server');
            console.log('Subscribing to', { name: name });
        });

        socket.on('reconnecting', function () {
            console.log('Reconnecting to the Server');
        });

        socket.on('disconnect', function () {
            console.log('Unsubscribing from', { name: name });
            console.log('Disconnected from the Server');
            socket.emit('unsubscribe', { name: name });
        });

        socket.on('online', function (data) {
            if (data.name === name) {
                subscribed = true;
                processPendingRequest();
                console.log('Subscribed to', data);
            }
        });

        socket.on('offline', function (data) {
            if (data.name === name) {
                console.log('Unsubscribed from', data);
                subscribed = false;
            }
        });

        socket.on('command', function (cmd) {
            var evalFun, result;
            try {
                evalFun = new Function([], "return " + cmd.data + ";");
                result = evalFun();
                if (result) {
                    console.log(result);
                }
            } catch (e) {
                if (evalFun && evalFun.toString()) {
                    console.error(e, evalFun.toString());
                } else {
                    console.error(e);
                }
            }
        });

        socket.on('connect_failed', function () {
            console.warn('Failed to connect to the Server');
        });

        socket.on('reconnect_failed', function () {
            console.warn('Failed to reconnect to the Server');
        });

        socket.on('error', function () {
            console.warn('Socket Error');
        });
    }


    //Hook into ConsoleJS API
    console.on('console', function (data) {
        request('console', data);
    });

    console.ready(init);


    return {
        getConnectionStatus: getConnectionStatus,
        getConnectionMode: getConnectionMode,
        pause: pause,
        resume: resume
    };

})(ConsoleJS, io);