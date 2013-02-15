/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 12/02/13
 * Time: 19:54
 * To change this template use File | Settings | File Templates.
 */

window.ConsoleJS = window.ConsoleJS || {};
ConsoleJS.Remote = ConsoleJS.Remote || {};

ConsoleJS.Remote.Config = (function () {

    "use strict";

    var key = "ConsoleJS.config",
        store = ConsoleJS.Remote.Store.Local,
        settings = store.get(key);

    if (!settings) {
        settings = {
            maxLogs: 50,
            cache: 1.5
        };

        settings.cacheCount = (settings.maxLogs * settings.cache);
    }

    function set(cfg) {
        ConsoleJS.Remote.Utils.merge(cfg, settings);
        settings.cacheCount = (settings.maxLogs * settings.cache);
        store.set(key, settings);
    }

    function get(name) {
        return settings[name] || null;
    }

    return {
        set: set,
        get: get
    };
}());

