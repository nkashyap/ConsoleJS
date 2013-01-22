/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 22/01/13
 * Time: 13:20
 * To change this template use File | Settings | File Templates.
 */
var SocketJS = (function (console, browser, io) {

    "use strict";

    var name = browser ? browser.toString() : window.navigator.userAgent,
        pendingRequests = [],
        subscribed = false,
        connectionMode = null,
        domReady = false,
        every,
        forEach,
        socket;

    every = (function every() {
        if (Array.prototype.every) {
            return function every(array, callback, scope) {
                return (array || []).every(callback, scope);
            };
        } else {
            return function every(array, callback, scope) {
                array = array || [];
                var i = 0, length = array.length;
                if (length) {
                    do {
                        if (!callback.call(scope || array, array[i], i, array)) {
                            return false;
                        }
                    } while (++i < length);
                }
                return true;
            };
        }
    }());

    forEach = (function forEach() {
        if (Array.prototype.forEach) {
            return function forEach(array, callback, scope) {
                (array || []).forEach(callback, scope);
            };
        } else {
            return function forEach(array, callback, scope) {
                array = array || [];
                var i = 0, length = array.length;
                if (length) {
                    do {
                        callback.call(scope || array, array[i], i, array);
                    } while (++i < length);
                }
            };
        }
    }());

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


    function toArray(data) {
        return Array.prototype.slice.call(data);
    }

    function getServerURL() {
        var url = '';
        every(toArray(document.scripts), function (script) {
            if (script.src.indexOf('socket.io') > -1) {
                url = script.src.split('socket.io')[0];
                return false;
            }
            return true;
        });

        return url;
    }

    function request(eventName, data) {
        if (socket && socket.socket.connected && subscribed) {
            data.name = name;
            socket.emit(eventName, data);
        } else {
            pendingRequests.push({ type: eventName, data: data });
        }
    }

    function processPendingRequest() {
        forEach(pendingRequests, function (item) {
            request(item.type, item.data);
        });
        pendingRequests = [];
    }

    function getConnectionMode() {
        return connectionMode;
    }

    function onReady(callback) {
        function DOMContentLoaded() {
            if (document.addEventListener) {
                document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                callback();
            } else if (document.attachEvent) {
                if (document.readyState === "complete") {
                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                    callback();
                }
            }
        }

        if (document.readyState === "complete") {
            setTimeout(callback, 1);
        }

        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
            window.addEventListener("load", callback, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", DOMContentLoaded);
            window.attachEvent("onload", callback);
        }
    }

    function init() {
        if (domReady) {
            return;
        }

        domReady = true;

        socket = io.connect(getServerURL());

        socket.on('connect', function () {
            socket.emit('subscribe', { name: name });
            console.log('Connected to the Server');
            console.log('Subscribing to', { name: name });
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

    onReady(init);

    return {
        getConnectionMode: getConnectionMode
    };

})(ConsoleJS, BrowserJS, io);