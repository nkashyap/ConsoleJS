/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 12/02/13
 * Time: 19:54
 * To change this template use File | Settings | File Templates.
 */

window.ConsoleJS = window.ConsoleJS || {};
ConsoleJS.Remote = ConsoleJS.Remote || {};

ConsoleJS.Remote.Store = function Store(type) {
    var scope = this;
    this.storageType = (type || "").toLowerCase() === 'local' ? 'localStorage' : 'sessionStorage';
    this.isStorageSupported = (function isStorageSupported() {
        try {
            return scope.storageType in window && window[scope.storageType] !== null;
        } catch (e) {
            return false;
        }
    }());

    this.storage = this.isStorageSupported ? window[this.storageType] : {};
};

ConsoleJS.Remote.Store.prototype.set = function set(key, value) {
    if (this.isStorageSupported) {
        this.storage.setItem(key, value);
    } else {
        this.storage[key] = value;
    }
};

ConsoleJS.Remote.Store.prototype.unSet = function unSet(key) {
    if (this.isStorageSupported) {
        this.storage.removeItem(key);
    } else {
        delete this.storage[key];
    }
};

ConsoleJS.Remote.Store.prototype.get = function get(key) {
    if (this.isStorageSupported) {
        return this.storage.getItem(key) || null;
    } else {
        return this.storage[key] || null;
    }
};

ConsoleJS.Remote.Store.prototype.reset = function reset() {
    if (this.isStorageSupported) {
        this.storage.clear();
    } else {
        this.storage = {};
    }
};

ConsoleJS.Remote.Store.Local = new ConsoleJS.Remote.Store('local');
ConsoleJS.Remote.Store.Memory = new ConsoleJS.Remote.Store();