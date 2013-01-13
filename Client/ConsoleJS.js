/**
 * ConsoleJS
 * User: Nisheeth
 * Date: 25/12/12
 * Time: 11:41
 * TODO........................
 */

var ConsoleJS = (function () {

    "use strict";

    var console = window.console,
        counters = {},
        timeCounters = {},
        withoutScope = ['dir', 'dirxml'],
        wrapper,
        settings = {
            identity : 'NoIdentity',
            overrideNativeConsole: true,
            enableNativeConsoleLogging: true,

            enableRemoteConsoleLogging: true,
            remoteCallback: function (type, log, stack) {
                console.log(arguments);
            },

            enableWebConsoleLogging: false
        },
        server = new SocketServer(settings.identity),
        formatter = {
            chrome: function (e, obj) {
                if (obj) {
                    var stack = e.stack.replace(/\n\r|\r\n/g, "\n").split(/[\n\r]/),
                        length = stack.length,
                        result = [],
                        i, item, match, frame, value;

                    for (i = 0; i < length; i++) {
                        item = stack[i];
                        match = item.match(/^\s+at\s+(.*)((?:http|https|ftp|file):\/\/.*)$/);

                        if (match) {
                            frame = {
                                name: match[1].replace(/\s*\($/, "") || "{anonymous}"
                            };
                            value = match[2].match(/^(.+)\:(\d+\:\d+)\)?$/);

                            if (value) {
                                frame.href = value[1];
                                frame.lineNo = value[2].substring(0, value[2].indexOf(':'));
                            }

                            result.push(frame);
                        }
                    }

                    return result;

                } else {

                    var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
                        replace(/^\s+(at eval )?at\s+/gm, '').
                        replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
                        replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');

                    stack.pop();

                    return stack;
                }
            },

            firefox: function (e, obj) {
                var stack = e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n'),
                    idx = 0,
                    count = 0,
                    length = stack.length,
                    items = [],
                    result = [],
                    i, item, value, match, name, frame;

                for (i = 0; i < length; i++) {
                    item = stack[i];
                    value = item || '';

                    if (value.indexOf('@http') > -1) {
                        if (idx) {
                            items[idx] += value;
                        } else {
                            items[count++] = value;
                        }
                        idx = 0;
                    } else {
                        if (idx) {
                            items[idx] += value;
                        } else {
                            idx = count;
                            items[count++] = value;
                        }
                    }
                }

                items.pop();

                if (obj) {
                    for (i = 0; item = items[i++];) {
                        match = item.match(/^(.*)((?:http|https|ftp|file):\/\/.*)$/);
                        if (match) {
                            name = match[1].replace(/\s*\($/, "") || "{anonymous}";
                            frame = {
                                name: name.substring(0, name.indexOf("("))
                            };
                            value = match[2].match(/(.+)\:(.+)/);

                            if (value) {
                                frame.href = value[1];
                                frame.lineNo = value[2];
                            }

                            result.push(frame);
                        }
                    }

                    return result;
                } else {
                    return items;
                }
            },

            opera11: function (e, obj) {
                var ANON = '{anonymous}',
                    lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/,
                    lines = (e.stacktrace || '').split('\n'),
                    result = [],
                    i, match, location, fnName,
                    len = lines.length;

                for (i = 0; i < len; i += 2) {
                    match = lineRE.exec(lines[i]);
                    if (match) {
                        location = match[4] + ':' + match[1] + ':' + match[2];
                        fnName = (match[3] || "global code").replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                        if (obj) {
                            result.push({
                                name: fnName,
                                href: match[4],
                                lineNo: match[1]
                            });
                        } else {
                            result.push(fnName + '@' + location);
                        }
                    }
                }

                return result;
            },

            opera10b: function (e, obj) {
                var lineRE = /^(.*)@(.+):(\d+)$/,
                    lines = (e.stacktrace || '').split('\n'),
                    result = [],
                    i, match, fnName,
                    len = lines.length;

                for (i = 0; i < len; i++) {
                    match = lineRE.exec(lines[i]);
                    if (match) {
                        fnName = match[1] ? (match[1] + '()') : "global code";
                        if (obj) {
                            result.push({
                                name: fnName,
                                href: match[2],
                                lineNo: match[3]
                            });
                        } else {
                            result.push(fnName + '@' + match[2] + ':' + match[3]);
                        }
                    }
                }

                return result;
            },

            opera10a: function (e, obj) {
                var ANON = '{anonymous}',
                    lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i,
                    lines = (e.stacktrace || '').split('\n'),
                    result = [],
                    i, match, fnName,
                    len = lines.length;

                for (i = 0; i < len; i += 2) {
                    match = lineRE.exec(lines[i]);
                    if (match) {
                        fnName = match[3] || ANON;
                        if (obj) {
                            result.push({
                                name: fnName,
                                href: match[2],
                                lineNo: match[1]
                            });
                        } else {
                            result.push(fnName + '()@' + match[2] + ':' + match[1]);
                        }
                    }
                }

                return result;
            },

            opera9: function (e, obj) {
                var ANON = '{anonymous}',
                    lineRE = /Line (\d+).*script (?:in )?(\S+)/i,
                    lines = e.message.split('\n'),
                    result = [],
                    i, match,
                    len = lines.length;

                for (i = 2; i < len; i += 2) {
                    match = lineRE.exec(lines[i]);
                    if (match) {
                        if (obj) {
                            result.push({
                                name: ANON,
                                href: match[2],
                                lineNo: match[1]
                            });
                        } else {
                            result.push(ANON + '()@' + match[2] + ':' + match[1]);
                        }
                    }
                }

                return result;
            },

            other: function (fn, obj) {
                var frames = [],
                    maxStackSize = 30,
                    i = 0,
                    length;

                try {
                    for (; (fn = fn.caller);) {
                        frames.push({
                            name: getFuncName(fn),
                            fn: fn
                        });

                        if (++i >= maxStackSize) break;
                    }
                } catch (e) {
                }

                if (!obj) {
                    for (i = 0, length = frames.length; i < length; i++) {
                        frames[i] = frames[i].name;
                    }
                }

                return frames;
            }
        };

    function copy(source, target) {
        var prop;
        for (prop in source) {
            if (source.hasOwnProperty(prop)) {
                target[prop] = source[prop];
            }
        }

        return target;
    }

    function config(cfg) {
        copy(cfg, settings);

        // override native console
        if (settings.overrideNativeConsole) {
            window.console = window.ConsoleJS;
        }

        server.identity = cfg.identity;
    }

    function sort(a, b) {
        return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
    }

    function getFuncName(func) {
        var name;

        // in FireFox, Function objects have a name property...
        if (func) {
            name = (func.getName instanceof Function) ? func.getName() : func.name;
            name = name || func.toString().match(/function\s*([_$\w\d]*)/)[1];
        }

        return name || "anonymous";
    }

    function stringify(obj, simple) {
        var value = '',
            type = ({}).toString.call(obj),
            typeList = ['[object String]', '[object Error]', '[object Arguments]', '[object Array]', '[object Object]', '[object Number]', '[object Boolean]', '[object Function]', '[object ErrorEvent]', '[object ScriptProfileNode]', '[object ScriptProfile]', 'object'],
            i,
            prop,
            length = 0,
            partsCount = 0,
            namesCount = 0,
            parts = [],
            names = [];

        if (typeList.indexOf(type) === -1) {
            type = typeof (type);
        }

        if (typeList.indexOf(type) > -1) {

            switch (type) {
                case '[object Error]':
                case '[object ErrorEvent]':
                    obj = obj.message;

                case '[object String]':
                    value = '"' + obj.replace(/\n/g, '\\n').replace(/"/g, '\\"').replace(/</g, '').replace(/>/g, '') + '"';
                    break;

                case '[object Arguments]':
                    obj = Array.prototype.slice.call(obj);

                case '[object Array]':
                    value = '[';
                    for (i = 0, length = obj.length; i < length; i++) {
                        parts[partsCount++] = stringify(obj[i], simple);
                    }
                    value += parts.join(', ') + ']';
                    break;

                case 'object':
                case '[object ScriptProfile]':
                case '[object ScriptProfileNode]':
                case '[object Object]':
                    value = '{ ';
                    for (prop in obj) {
                        if (obj.hasOwnProperty(prop)) {
                            names[namesCount++] = prop;
                        }
                    }

                    names.sort(sort);

                    for (i = 0; i < namesCount; i++) {
                        parts[partsCount++] = stringify(names[i]) + ': ' + stringify(obj[names[i]], simple);
                    }

                    if (obj.constructor && obj.constructor.name) {
                        parts[partsCount++] = stringify('constructor') + ': ' + stringify(obj.constructor.name);
                    }

                    if (type === '[object ScriptProfileNode]') {
                        parts[partsCount++] = stringify('children') + ': ' + stringify(obj.children());
                    }

                    value += parts.join(', ') + '}';
                    break;

                case '[object Number]':
                    value = String(obj);
                    break;
                case '[object Boolean]':
                    value = obj ? 'true' : 'false';
                    break;
                case '[object Function]':
                    value = '"' + getFuncName(obj) + '"';
                    break;
                default:
                    break;
            }
        } else if (obj === null) {
            value = '"null"';

        } else if (obj === undefined) {
            value = '"undefined"';

        } else if (simple === undefined) {
            value = type + '{\n';
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    names[namesCount++] = prop;
                }
            }

            names.sort(sort);

            for (i = 0; i < namesCount; i++) {
                // safety from max stack
                parts[partsCount++] = names[i] + ': ' + stringify(obj[names[i]], true);
            }

            value += parts.join(',\n') + '\n}';

        } else {
            try {
                // should look like an object
                value = String(obj);
            } catch (e) {
            }
        }

        return value;
    }

    function SocketServer(id) {
        var self = this;

        this.identity = id;
        this.pending = [];
        this.subscribed = false;
        this.socket = io.connect(getServerURL());

        this.socket.on('connect', function () {
            console.log('Connected to the Server');
            console.log('Subscribe to room', {
                id: self.socket.socket.sessionid,
                room : self.identity
            });

            self.socket.emit('clientSubscribe', {
                id: self.socket.socket.sessionid,
                room : self.identity
            });
        });

        this.socket.on('clientConnected', function(data) {
            if(data.id === self.socket.socket.sessionid){
                console.log('subscribed to room', data);
                self.subscribed = true;
                self.processPendingRequest();
            }
        });

        this.socket.on('clientDisconnected', function(data) {
            if(data.id === self.socket.socket.sessionid){
                console.log('unsubscribed to room', data);
                self.subscribed = false;
            }
        });

        this.socket.on('reconnect', function () {
            console.log('Reconnected to the Server');
            console.log('subscribe to', {
                id: self.socket.socket.sessionid,
                room : self.identity
            });

            self.socket.emit('clientSubscribe', {
                id: self.socket.socket.sessionid,
                room : self.identity
            });
        });

        this.socket.on('disconnect', function () {
            console.log('Unsubscribe to room', {
                id: self.socket.socket.sessionid,
                room : self.identity
            });

            self.socket.emit('clientUnsubscribe', {
                id: self.socket.socket.sessionid,
                room : self.identity
            });

            console.log('Disconnected from the Server');
        });

        this.socket.on('connect_failed', function () {
            console.warn('Failed to connect to the Server');
        });

        this.socket.on('error', function () {
            console.warn('Socket Error');
        });

        this.socket.on('command', function (data) {
            console.log('command received', data);
        });

        this.processPendingRequest = function processPendingRequest() {
            var i = 0, length = this.pending.length;
            if (length) {
                do {
                    var req = this.pending[i++];
                    this.request(req.type, req.data);
                } while (i < length)
            }
            this.pending = [];
        }

        this.request = function request(eventName, data) {
            if (this.socket.socket.connected && this.subscribed) {
                data.id = this.socket.socket.sessionid;
                this.socket.emit(eventName, data);
            } else {
                this.pending.push({ type: eventName, data: data });
            }
        }

        function getServerURL() {
            var url = '',
                scripts = window.document.scripts,
                length = scripts.length;

            while (length > 0) {
                var src = scripts[--length].src;
                if (src.indexOf('socket.io') > -1) {
                    url = src.split('socket.io')[0];
                    break;
                }
            }
            return url;
        }

    }

    function createException() {
        try {
            undef();
        } catch (e) {
            return e;
        }
    }

    function getStackType(e) {
        if (e.hasOwnProperty('arguments') && e.stack) {
            return 'chrome';

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
    }

    function getStack(e, obj) {
        e = e || createException();

        var type = getStackType(e),
            className = ({}).toString.call(e);

        if (['[object Error]', '[object ErrorEvent]'].indexOf(className) === -1) {
            wrapper.warn(className + ' error type missing!');
            return [];
        }

        if (type !== 'other' && (!!(e.stack || e.stacktrace) || type === 'opera9')) {
            return formatter[type](e, obj) || [];
        } else {
            return formatter.other(arguments.callee, obj);
        }
    }

    function logger(type, args, value, callStack) {

        if (console[type] && settings.enableNativeConsoleLogging) {
            if (withoutScope.indexOf(type) > -1) {
                console[type](args);
            } else {
                console[type].apply(console, args);
            }
        }

        if (settings.enableRemoteConsoleLogging) {
            var output = {
                type: type,
                message: value || stringify(args),
                stack: callStack ? stringify(callStack) : ''
            };

            if (settings.remoteCallback) {
                settings.remoteCallback(output.type, output.message, output.stack);
            }

            server.request('console', output);
        }
    }

    wrapper = {
        assert: function assert(x) {
            if (!x) {
                var args = ['Assertion failed:'];
                args = args.concat(Array.prototype.slice.call(arguments, 1));
                logger("assert", arguments, stringify(args), getStack());
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
            logger("dir", obj, stringify([obj]));
        },

        dirxml: function dirxml(node) {
            if (node instanceof Window) {
                node = node.document.documentElement;
            } else if (node instanceof Document) {
                node = node.documentElement;
            }

            var value = node ? node.outerHTML || node.innerHTML || node.toString() || stringify(node) : null;
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
            logger("error", arguments, null, getStack(e));
        },
        exception: function exception(e) {
            logger("error", arguments, null, getStack(e));
        },
        trace: function trace() {
            logger("trace", arguments, null, getStack());
        },

        clear: function clear() {
            counters = {};
            timeCounters = {};
            logger("clear", arguments);
        }
    };

    return copy(wrapper, {
        config: config,
        native: console
    });
}());