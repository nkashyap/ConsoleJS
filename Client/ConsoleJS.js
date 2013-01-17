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
        formatter,
        settings,
        server;

    settings = {
        name: 'NoName',
        nativeOverride: true,
        nativeEnabled: true,
        remoteEnabled: true,
        remoteCallback: function (data, mode) {
        },
        //TODO
        webEnabled: false
    };

    function SocketServer(name) {
        this.name = name;
        this.pending = [];
        this.subscribed = false;
        this.socket = io.connect(this.getServerURL());
        this.mode = null;

        var self = this;

        this.socket.on('connect', function () {
            wrapper.log('Connected to the Server');
            wrapper.log('Subscribing to', {
                name: self.name
            });

            self.socket.emit('subscribe', {
                name: self.name
            });
        });

        this.socket.on('reconnect', function () {
            wrapper.log('Reconnected to the Server');
            wrapper.log('Subscribing to', {
                name: self.name
            });

            self.socket.emit('subscribe', {
                name: self.name
            });
        });

        this.socket.on('disconnect', function () {
            wrapper.log('Unsubscribing from', {
                name: self.name
            });

            self.socket.emit('unsubscribe', {
                name: self.name
            });

            wrapper.log('Disconnected from the Server');
        });

        this.socket.on('online', function (data) {
            if (data.name === self.name) {
                self.mode = data.mode;
                self.subscribed = true;

                wrapper.log('Subscribed to', data);
                self.processPendingRequest();
            }
        });

        this.socket.on('offline', function (data) {
            if (data.name === self.name) {
                wrapper.log('Unsubscribed from', data);
                self.subscribed = false;
            }
        });

        this.socket.on('command', function (cmd) {
            var evalFun;
            try {
                evalFun = new Function([], "return " + cmd.data + ";");
                var result = evalFun();
                wrapper.log(result);
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

        this.socket.on('error', function () {
            wrapper.warn('Socket Error');
        });
    }

    SocketServer.prototype.getServerURL = function getServerURL() {
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
    };

    SocketServer.prototype.processPendingRequest = function processPendingRequest() {
        var i = 0, length = this.pending.length;
        if (length) {
            do {
                var req = this.pending[i++];
                this.request(req.type, req.data);
            } while (i < length)
        }
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


    function config(cfg) {
        copy(cfg, settings);

        // override native console
        if (settings.nativeOverride) {
            window.console = window.ConsoleJS;
        }

        if (settings.remoteEnabled) {
            server = new SocketServer(settings.name);
        }
    }

    function copy(source, target) {
        var prop;
        for (prop in source) {
            if (source.hasOwnProperty(prop)) {
                target[prop] = source[prop];
            }
        }

        return target;
    }


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

    function getValueOrClassName(obj) {
        var valueList = [
            '[object String]', '[object Error]', '[object Arguments]', '[object Array]', '[object Object]',
            '[object Number]', '[object Boolean]', '[object Function]', '[object ErrorEvent]'
        ]
        var type = ({}).toString.call(obj);

        if (valueList.indexOf(type) > -1) {
            return stringify(obj);
        } else {
            return type;
        }
    }

    function stringify(obj, simple) {
        var value = '',
            type = ({}).toString.call(obj),
            typeList = [
                '[object String]', '[object Error]', '[object Arguments]', '[object Array]', '[object Object]',
                '[object Number]', '[object Boolean]', '[object Function]', '[object ErrorEvent]'
            ],
            i,
            prop,
            length = 0,
            partsCount = 0,
            namesCount = 0,
            parts = [],
            names = [];

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
                        parts[partsCount++] = getValueOrClassName(obj[i]);
                    }
                    value += parts.join(',') + ']';
                    break;

                case '[object Object]':
                    for (prop in obj) {
                        if (obj.hasOwnProperty(prop)) {
                            names[namesCount++] = prop;
                        }
                    }

                    names.sort(sort);

                    if (obj && obj.constructor && obj.constructor.name) {
                        value = obj.constructor.name
                        parts[partsCount++] = '\t"constructor": "' + obj.constructor.name + '"';
                    }

                    for (i = 0; i < namesCount; i++) {
                        parts[partsCount++] = '\t"' + names[i] + '": ' + getValueOrClassName(obj[names[i]]);
                    }

                    value += ': {\n' + parts.join(',\n') + '\n}\n';
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
            value = type + ': {\n';
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    names[namesCount++] = prop;
                }
            }

            names.sort(sort);

            for (i = 0; i < namesCount; i++) {
                parts[partsCount++] = '\t' + names[i] + ': ' + getValueOrClassName(obj[names[i]]);
            }

            value += parts.join(',\n') + '\n}\n';

        } else {
            try {
                // should look like an object
                value = String(obj);
            } catch (e) {
            }
        }

        return value;
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

        var data = "",
            type = getStackType(e),
            className = ({}).toString.call(e);

        if (['[object Error]', '[object ErrorEvent]'].indexOf(className) === -1) {
            wrapper.warn(className + ' error type missing!');
            return data;
        }

        if (type !== 'other' && (!!(e.stack || e.stacktrace) || type === 'opera9')) {
            data = formatter[type](e, obj);
        } else {
            data = formatter.other(arguments.callee, obj);
        }

        return data;
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
                message: value || stringify(args),
                stack: callStack ? stringify(callStack) : ''
            };

            server.request('console', output);

            if (settings.remoteCallback) {
                settings.remoteCallback(output, server.mode);
            }
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
            logger("dir", obj);
        },

        dirxml: function dirxml(node) {
            if (node instanceof Window) {
                node = node.document.documentElement;
            } else if (node instanceof Document) {
                node = node.documentElement;
            }

            var value = node ? node.outerHTML || node.innerHTML || node.toString() || stringify(node) : null;
            value = value.replace(/</img, '&lt;');
            value = value.replace(/>/img, '&gt;');
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