/**
 * ConsoleJS
 * User: Nisheeth
 * Date: 25/12/12
 * Time: 11:41
 */

var ConsoleJS = (function () {

    var console = window.console,
        counters = {},
        timeCounters = {},
        withoutScope = ['dir', 'dirxml'],
        server;

    var settings = {
        name: 'NoName',
        nativeOverride: true,
        nativeEnabled: true,
        remoteEnabled: true,
        remoteCallback: function (data, mode) {
        },
        //TODO
        webEnabled: false
    };


    var Utils = {
        getObjectType: function getObjectType(data) {
            return Object.prototype.toString.apply(data);
        },

        getFunctionName: function getFunctionName(data) {
            var name;
            // in FireFox, Function objects have a name property...
            if (data) {
                name = (data.getName instanceof Function) ? data.getName() : data.name;
                name = name || data.toString().match(/function\s*([_$\w\d]*)/)[1];
            }
            return name || "anonymous";
        },

        isArray: function isArray(data) {
            return Object.prototype.toString.call(data) === '[object Array]';
        },

        toArray: function toArray(data) {
            return Array.prototype.slice.call(data);
        },

        every: (function () {
            if (Array.prototype.every) {
                return function (array, callback, scope) {
                    return (array || []).every(callback, scope);
                };
            } else {
                return function (array, callback, scope) {
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
        }()),

        forEach: (function () {
            if (Array.prototype.forEach) {
                return function (array, callback, scope) {
                    (array || []).forEach(callback, scope);
                };
            } else {
                return function (array, callback, scope) {
                    array = array || [];
                    var i = 0, length = array.length;
                    if (length) {
                        do {
                            callback.call(scope || array, array[i], i, array);
                        } while (++i < length);
                    }
                };
            }
        }()),

        forEachProperty: function forEachProperty(obj, callback, scope) {
            for (var prop in obj) {
                callback.call(scope || obj, obj[prop], prop, obj);
            }
        },

        merge: function merge(source, target) {
            this.forEachProperty(source, function (value, property) {
                target[property] = value;
            });

            return target;
        }
    };


    // From https://github.com/eriwen/javascript-stacktrace
    var Formatter = {
        /**
         * Given an Error object, return a formatted Array based on Chrome's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        chrome: function chrome(e) {
            var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
                replace(/^\s+(at eval )?at\s+/gm, '').
                replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
                replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
            stack.pop();
            return stack;
        },

        /**
         * Given an Error object, return a formatted Array based on Safari's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        safari: function safari(e) {
            return e.stack.replace(/\[native code\]\n/m, '')
                .replace(/^(?=\w+Error\:).*$\n/m, '')
                .replace(/^@/gm, '{anonymous}()@')
                .split('\n');
        },

        /**
         * Given an Error object, return a formatted Array based on IE's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        ie: function (e) {
            var lineRE = /^.*at (\w+) \(([^\)]+)\)$/gm;
            return e.stack.replace(/at Anonymous function /gm, '{anonymous}()@')
                .replace(/^(?=\w+Error\:).*$\n/m, '')
                .replace(lineRE, '$1@$2')
                .split('\n');
        },

        /**
         * Given an Error object, return a formatted Array based on Firefox's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        firefox: function (e) {
            return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^[\(@]/gm, '{anonymous}()@').split('\n');
        },

        opera11: function (e) {
            var ANON = '{anonymous}', lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var location = match[4] + ':' + match[1] + ':' + match[2];
                    var fnName = match[3] || "global code";
                    fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                    result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        opera10b: function (e) {
            // "<anonymous function: run>([arguments not available])@file://localhost/G:/js/stacktrace.js:27\n" +
            // "printStackTrace([arguments not available])@file://localhost/G:/js/stacktrace.js:18\n" +
            // "@file://localhost/G:/js/test/functional/testcase1.html:15"
            var lineRE = /^(.*)@(.+):(\d+)$/;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i++) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var fnName = match[1] ? (match[1] + '()') : "global code";
                    result.push(fnName + '@' + match[2] + ':' + match[3]);
                }
            }

            return result;
        },

        /**
         * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        opera10a: function (e) {
            // "  Line 27 of linked script file://localhost/G:/js/stacktrace.js\n"
            // "  Line 11 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html: In function foo\n"
            var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var fnName = match[3] || ANON;
                    result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        // Opera 7.x-9.2x only!
        opera9: function (e) {
            // "  Line 43 of linked script file://localhost/G:/js/stacktrace.js\n"
            // "  Line 7 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html\n"
            var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n'), result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        // Safari 5-, IE 9-, and others
        other: function (curr) {
            var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
            while (curr && curr['arguments'] && stack.length < maxStackSize) {
                fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
                args = Array.prototype.slice.call(curr['arguments'] || []);
                stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
                curr = curr.caller;
            }
            return stack;
        },

        /**
         * Given arguments array as a String, subsituting type names for non-string types.
         *
         * @param {Arguments} args
         * @return {Array} of Strings with stringified arguments
         */
        stringifyArguments: function (args) {
            var result = [],
                slice = Array.prototype.slice;

            for (var i = 0; i < args.length; ++i) {
                var arg = args[i];
                if (arg === undefined) {
                    result[i] = 'undefined';
                } else if (arg === null) {
                    result[i] = 'null';
                } else if (arg.constructor) {
                    if (arg.constructor === Array) {
                        if (arg.length < 3) {
                            result[i] = '[' + this.stringifyArguments(arg) + ']';
                        } else {
                            result[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
                        }
                    } else if (arg.constructor === Object) {
                        result[i] = '#object';
                    } else if (arg.constructor === Function) {
                        result[i] = '#function';
                    } else if (arg.constructor === String) {
                        result[i] = '"' + arg + '"';
                    } else if (arg.constructor === Number) {
                        result[i] = arg;
                    }
                }
            }

            return result.join(",");
        }
    };


    // From https://github.com/eriwen/javascript-stacktrace
    var Stack = {
        create: function create() {
            try {
                undefined();
            } catch (e) {
                return e;
            }
        },

        getType: function getType(e) {
            if (e['arguments'] && e.stack) {
                return 'chrome';

            } else if (e.stack && e.sourceURL) {
                return 'safari';

            } else if (e.stack && e.number) {
                return 'ie';

            } else if (typeof e.message === 'string' && typeof window !== 'undefined' && window.opera) {
                if (!e.stacktrace) {
                    return 'opera9';
                }

                if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                    return 'opera9';
                }

                if (!e.stack) {
                    return 'opera10a';
                }

                if (e.stacktrace.indexOf("called from line") < 0) {
                    return 'opera10b';
                }

                return 'opera11';

            } else if (e.stack) {
                return 'firefox';
            }

            return 'other';
        },

        get: function get(e) {
            e = e || this.create();

            var data = "",
                type = this.getType(e),
                className = Utils.getObjectType(e);

            if (['[object Error]', '[object ErrorEvent]'].indexOf(className) === -1) {
                wrapper.warn(className + ' error type missing!');
                return data;
            }

            if (type === 'other') {
                data = Formatter.other(arguments.callee);
            } else {
                data = Formatter[type](e);
            }

            return data;
        }
    };


    var wrapper = {
        assert: function assert(x) {
            if (!x) {
                var args = ['Assertion failed:'];
                args = args.concat(Utils.toArray(arguments).slice(1));
                logger("assert", arguments, Stringify.parse(args), Stack.get());
            } else {
                logger("assert", arguments);
            }
        },

        count: function count(key) {
            var frameId = (key || '_GLOBAL_'),
                frameCounter = counters[frameId];

            if (!frameCounter) {
                counters[frameId] = frameCounter = {
                    key: key || '',
                    count: 1
                };
            } else {
                ++frameCounter.count;
            }

            logger("count", arguments, (key || '') + ": " + frameCounter.count);
        },

        time: function time(name, reset) {
            if (!name) {
                return false;
            }

            var key = "KEY" + name.toString();

            if (!reset && timeCounters[key]) {
                return false;
            }

            timeCounters[key] = (new Date()).getTime();

            logger("time", arguments);
        },

        timeEnd: function timeEnd(name) {
            if (!name) {
                return false;
            }

            var key = "KEY" + name.toString(),
                timeCounter = timeCounters[key];

            if (timeCounter) {
                delete timeCounters[key];

                logger("timeEnd", arguments, name + ": " + ((new Date()).getTime() - timeCounter) + "ms");
            }
        },

        debug: function debug() {
            logger("debug", arguments);
        },

        warn: function warn() {
            logger("warn", arguments);
        },

        info: function info() {
            logger("info", arguments);
        },

        log: function log() {
            logger("log", arguments);
        },

        dir: function dir(obj) {
            logger("dir", obj);
        },

        dirxml: function dirxml(node) {
            var value,
                nodeType = node.nodeType;

            if (nodeType === 9) {
                node = node.documentElement;
            }

            value = node ? node.outerHTML || node.innerHTML || node.toString() || Stringify.parse(node) : null;

            if (value) {
                value = value.replace(/</img, '&lt;');
                value = value.replace(/>/img, '&gt;');
            }

            logger("dirxml", node, value);
        },

        group: function group() {
            logger("group", arguments);
        },

        groupCollapsed: function groupCollapsed() {
            logger("groupCollapsed", arguments);
        },

        groupEnd: function groupEnd() {
            logger("groupEnd", arguments);
        },

        markTimeline: function markTimeline() {
            logger("markTimeline", arguments);
        },

        timeStamp: function timeStamp(name) {
            logger("timeStamp", arguments);
        },

        profiles: [],
        profile: function profile(title) {
            logger("profile", arguments);
        },
        profileEnd: function profileEnd(title) {
            logger("profileEnd", arguments);
        },

        error: function error(e) {
            logger("error", arguments, null, Stack.get(e));
        },
        exception: function exception(e) {
            logger("error", arguments, null, Stack.get(e));
        },
        trace: function trace() {
            logger("trace", arguments, null, Stack.get());
        },

        clear: function clear() {
            counters = {};
            timeCounters = {};
            logger("clear", arguments);
        }
    };


    //IE Fix
    if (Function.prototype.bind && console && typeof console.log === "object") {
        Utils.forEach(["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"],
            function (method) {
                console[method] = this.bind(console[method], console);
            },
            Function.prototype.call
        );
    }


    function SocketServer(name) {
        this.name = name;
        this.pending = [];
        this.subscribed = false;
        this.socket = io.connect(this.getServerURL());
        this.mode = null;
        var self = this;

        this.socket.on('connect', function () {
            self.socket.emit('subscribe', { name: self.name });
            wrapper.log('Connected to the Server');
            wrapper.log('Subscribing to', { name: self.name });
        });

        this.socket.on('connecting', function (mode) {
            self.mode = mode;
            wrapper.log('Connecting to the Server');
        });

        this.socket.on('reconnect', function (mode, attempts) {
            self.mode = mode;
            self.socket.emit('subscribe', { name: self.name });
            wrapper.log('Reconnected to the Server');
            wrapper.log('Subscribing to', { name: self.name });
        });

        this.socket.on('reconnecting', function () {
            wrapper.log('Reconnecting to the Server');
        });

        this.socket.on('disconnect', function () {
            wrapper.log('Unsubscribing from', { name: self.name });
            wrapper.log('Disconnected from the Server');
            self.socket.emit('unsubscribe', { name: self.name });
        });

        this.socket.on('online', function (data) {
            if (data.name === self.name) {
                self.subscribed = true;
                self.processPendingRequest();
                wrapper.log('Subscribed to', data);
            }
        });

        this.socket.on('offline', function (data) {
            if (data.name === self.name) {
                wrapper.log('Unsubscribed from', data);
                self.subscribed = false;
            }
        });

        this.socket.on('command', function (cmd) {
            var evalFun, result;
            try {
                evalFun = new Function([], "return " + cmd.data + ";");
                result = evalFun();
                if (result) {
                    wrapper.log(result);
                }
            } catch (e) {
                if (evalFun && evalFun.toString()) {
                    wrapper.error(e, evalFun.toString());
                } else {
                    wrapper.error(e);
                }
            }
        });

        this.socket.on('connect_failed', function () {
            wrapper.warn('Failed to connect to the Server');
        });

        this.socket.on('reconnect_failed', function () {
            wrapper.warn('Failed to reconnect to the Server');
        });

        this.socket.on('error', function () {
            wrapper.warn('Socket Error');
        });
    }

    SocketServer.prototype.getServerURL = function getServerURL() {
        var url = '';
        Utils.every(Utils.toArray(document.scripts), function (script) {
            if (script.src.indexOf('socket.io') > -1) {
                url = script.src.split('socket.io')[0];
                return false;
            }
            return true;
        });

        return url;
    };

    SocketServer.prototype.processPendingRequest = function processPendingRequest() {
        Utils.forEach(this.pending, function (item) {
            this.request(item.type, item.data);
        }, this);
        this.pending = [];
    };

    SocketServer.prototype.request = function request(eventName, data) {
        if (this.socket.socket.connected && this.subscribed) {
            data.name = this.name;
            this.socket.emit(eventName, data);
        } else {
            this.pending.push({ type: eventName, data: data });
        }
    };


    var Stringify = {
        TYPES: [
            '[object Arguments]', '[object Array]',
            '[object String]', '[object Number]', '[object Boolean]',
            '[object Error]', '[object ErrorEvent]',
            '[object Function]', '[object Object]'
        ],

        parse: function (data, simple) {
            var value = '',
                type = Utils.getObjectType(data);

            if (this.TYPES.indexOf(type) > -1) {
                switch (type) {
                    case '[object Error]':
                    case '[object ErrorEvent]':
                        data = data.message;
                    case '[object String]':
                        value = this.parseString(data);
                        break;

                    case '[object Arguments]':
                        data = Utils.toArray(data);
                    case '[object Array]':
                        value = this.parseArray(data);
                        break;

                    case '[object Object]':
                        value = this.parseObject(type, data);
                        break;

                    case '[object Number]':
                        value = String(data);
                        break;

                    case '[object Boolean]':
                        value = data ? 'true' : 'false';
                        break;

                    case '[object Function]':
                        value = '"' + Utils.getFunctionName(data) + '"';
                        break;
                }
            } else if (data === null) {
                value = '"null"';

            } else if (data === undefined) {
                value = '"undefined"';

            } else if (simple === undefined) {
                value = this.parseObject(type, data);

            } else {
                try {
                    value = String(data);
                } catch (e) {
                }
            }

            return value;
        },

        valueOf: function valueOf(data, skipGlobal) {
            var type = Utils.getObjectType(data);

            if (this.TYPES.indexOf(type) > -1 && !skipGlobal) {
                return this.parse(data);
            } else {
                if (type === '[object Function]') {
                    type = '[Function ' + Utils.getFunctionName(data) + ']';
                } else if (data && data.constructor && data.constructor.name) {
                    type = '[object ' + data.constructor.name + ']';
                }

                return type;
            }
        },

        parseString: function parseString(data) {
            return '"' + data.replace(/\n/g, '\\n').replace(/"/g, '\\"').replace(/</g, '').replace(/>/g, '') + '"';
        },

        parseArray: function parseArray(data) {
            var target = [];
            Utils.forEach(data, function (item, index) {
                this[index] = Stringify.valueOf(item);
            }, target);

            if(target.length > 0){
                return '[' + target.join(',') + ']';
            } else {
                return '[' + data.toString() + ']';
            }
        },

        parseObject: function parseObject(type, data) {
            var name = '',
                skipGlobal = type === '[object global]',
                target = [];

            if (data && data.constructor) {
                name = data.constructor.name;
            }

            Utils.forEachProperty(data, function (value, property) {
                this.push('\t"' + property + '": ' + Stringify.valueOf(value, skipGlobal));
            }, target);

            if(target.length > 0){
                return (name || type) + ': {\n' + target.join(',\n') + '\n}\n';
            } else {
                return data.toString() + '\n';
            }
        }
    };


    function config(cfg) {
        Utils.merge(cfg, settings);

        // override native console
        if (settings.nativeOverride) {
            window.console = window.ConsoleJS;
        }

        if (settings.remoteEnabled) {
            server = new SocketServer(settings.name);
        }
    }


    function logger(type, args, value, callStack) {

        if (console && settings.nativeEnabled) {
            if (console[type]) {
                if (withoutScope.indexOf(type) > -1) {
                    console[type](args);
                } else {
                    console[type].apply(console, args);
                }
            }
        }

        if (settings.remoteEnabled) {
            var output = {
                type: type,
                message: value || Stringify.parse(args.length ? Utils.toArray(args) : args),
                stack: callStack ? Stringify.parse(callStack) : ''
            };

            server.request('console', output);

            if (settings.remoteCallback) {
                settings.remoteCallback(output, server.mode);
            }
        }
    }


    return Utils.merge(wrapper, {
        config: config,
        native: console
    });
}());