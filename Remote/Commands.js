/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 15/02/13
 * Time: 19:46
 * To change this template use File | Settings | File Templates.
 */

ConsoleJS.Utils.namespace("ConsoleJS.Remote.Commands.Global");
ConsoleJS.Utils.namespace("ConsoleJS.Remote.Commands.User");

ConsoleJS.Remote.Commands.Global = {
    "nav-header-1": "DOM Objects",
    "Window": "console.dir(window)",
    "Document": "console.dir(document)",
    "Navigator": "console.dir(window.navigator)",
    "Location": "console.dir(window.location)",
    "History": "console.dir(window.history)",
    "Screen": "console.dir(window.screen)",
    "Cookie": "console.log(document.cookie)",

    "divider-1": null,
    "nav-header-2": "HTML",
    "Body": "console.dirxml(document.body)",
    "Scripts": " (function getScripts(){" +
        "     var i, scripts = document.scripts, length = scripts.length;" +
        "     for(i = 0; i < length; i++){" +
        "         console.dirxml(scripts[i]);" +
        "     }; " +
        "}())",
    "Styles": " (function getStyles(){ " +
        "     var i, styles = document.getElementsByTagName('link'), length = styles.length;" +
        "     for(i = 0; i < length; i++){ " +
        "         console.dirxml(styles[i]);" +
        "      }; " +
        "}())"

};

ConsoleJS.Remote.Commands.User = {

};

