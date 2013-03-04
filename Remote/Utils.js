window.ConsoleJS = window.ConsoleJS || {};

ConsoleJS.Utils = {

    namespace: function namespace(name) {
        var ns = name.split('.'),
            i,
            node = window,
            length = ns.length;

        for (i = 0; i < length; i++) {
            node = node[ns[i]] = node[ns[i]] || {};
        }
    },

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

    getScriptURL: function getScriptURL(name) {
        var url = '';
        this.every(this.toArray(document.scripts), function (script) {
            if (script.src.indexOf(name) > -1) {
                url = script.src.split(name)[0];
                return false;
            }
            return true;
        });

        return url;
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
        var prop;
        for (prop in obj) {
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
