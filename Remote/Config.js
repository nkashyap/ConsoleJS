/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 12/02/13
 * Time: 19:54
 * To change this template use File | Settings | File Templates.
 */

ConsoleJS.Utils.namespace("ConsoleJS.Remote.Config");

ConsoleJS.Remote.Config = (function () {

    "use strict";

    var key = "ConsoleJS.config",
        store = ConsoleJS.Remote.Store.Local,
        settings = store.get(key);

    if (!settings) {
        settings = {
            preserveLogs: true,
            maxLogPreserved: 500,
            maxLogs: 500,
            cache: 1.5
        };

        settings.logCache = (settings.maxLogs * settings.cache);
        settings.storeCache = (settings.maxLogPreserved * settings.cache);
    }

    function set(cfg) {
        ConsoleJS.Utils.merge(cfg, settings);
        settings.logCache = (settings.maxLogs * settings.cache);
        settings.storeCache = (settings.maxLogPreserved * settings.cache);
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

