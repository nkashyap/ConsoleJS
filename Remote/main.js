/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 15/05/13
 * Time: 20:51
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function () {
    var mainWrapper = $("#main-wrapper"),
        roomTab = $("#connectRooms"),
        roomContent = $("#connectRoomsContent"),
        commandMenu = $("#commandMenu"),
        quickCommands = $("#quickCommands"),
        toggleLogs = $("#toggleLogs"),
        globalCommands = $("#globalCommands"),
        deviceCommands = $("#deviceCommands"),
        userCommands = $("#userCommands"),
        toggleList = [
            'log', 'info', 'debug', 'warn', 'dir', 'dirxml', 'assert', 'assert-failed',
            'error', 'trace', 'clear', 'count', 'time', 'timeEnd', 'group', 'groupCollapsed', 'groupEnd',
            'markTimeline', 'timeStamp', 'profile', 'profileEnd'
        ],
        server = new ConsoleJS.Remote.SocketServer(),
        editor = CodeMirror.fromTextArea(document.getElementById("command"), {
            mode: "javascript",
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            statementIndent: true,
            lineWrapping: true,
            styleActiveLine: true,
            highlightSelectionMatches: true,
            continueComments: "Enter",
            extraKeys: {"Ctrl-Space": "autocomplete", "Ctrl-Enter": "submit"}
        });

    function addCommands(target, list) {
        var show = false,
            id = target.attr("id"),
            targetList = target.find(".dropdown-menu");

        ConsoleJS.Utils.forEachProperty(list, function (value, property, obj) {
            if (obj.hasOwnProperty(property)) {
                show = true;
                var value, item;

                if (property.indexOf('divider') > -1) {
                    item = $('<li class="divider"></li>');
                } else if (property.indexOf('nav-header') > -1) {
                    item = $('<li class="nav-header">' + value + '</li>');
                } else {
                    item = $('<li><a href="#" group-id="' + id + '">' + property + '</a></li>');
                }

                targetList.append(item);
            }
        });

        if (!show) {
            target.hide();
        }
    }

    function addSwitch(target, list) {
        target.hide();

        ConsoleJS.Utils.forEach(list, function (value) {
            var item = $('<a href="#" class="label label-' + value + '">' + value + '</a>');
            target.append(item);
        });

        target.show();
    }

    function bindCommands() {
        commandMenu.find(".dropdown-menu a").click(function () {
            var scope = $(this),
                groupId = scope.attr("group-id"),
                cmdName = scope.html(), cmd;

            switch (groupId) {
                case "globalCommands":
                    cmd = ConsoleJS.Remote.Commands.Global[cmdName];
                    break;
                case "userCommands":
                    cmd = ConsoleJS.Remote.Commands.User[cmdName];
                    break;
                case "deviceCommands":
                    cmd = ConsoleJS.Remote.Commands.Device[cmdName];
                    break;
            }

            if (cmd) {
                server.request(cmd);
            }
        });

        quickCommands.find(".btn").click(function () {
            var scope = $(this),
                cmd = "";

            switch (scope.html().toLowerCase()) {
                case 'send':
                    cmd = editor.getValue();
                    break;
                case 'ping':
                    cmd = '"ping..."';
                    break;
                case 'pause':
                    cmd = 'ConsoleJS.Socket.pause()';
                    scope.html('Resume');
                    break;
                case 'resume':
                    cmd = 'ConsoleJS.Socket.resume()';
                    scope.html('Pause');
                    break;
                case 'clear':
                    cmd = 'console.clear()';
                    break;
                case 'reload':
                    cmd = 'window.location.reload()';
                    break;
            }

            if (cmd) {
                server.request(cmd);
            }
        });

        toggleLogs.find(".label").click(function () {
            var scope = $(this),
                type = scope.prop('class').replace(/( )?label(-)?(disabled)?( )?/igm, "");

            if (scope.hasClass("label-disabled")) {
                scope.removeClass("label-disabled");
            } else {
                scope.addClass("label-disabled");
            }

            server.request('filter:' + type + ':' + scope.hasClass("label-disabled"));
        });
    }

    function bindEditor() {
        CodeMirror.commands.autocomplete = function autocomplete(cm) {
            CodeMirror.showHint(cm, CodeMirror.javascriptHint);
        };

        CodeMirror.commands.submit = function submit() {
            var cmd = editor.getValue();
            if (cmd) {
                server.request(cmd);
            }
        };
    }

    function sizing() {
        var wrapperHeight = mainWrapper.height(),
            tabHeight = roomTab.height() || 0,
            contentHeight = wrapperHeight - tabHeight - 250;

        roomContent.height(contentHeight + "px");
    }

    addSwitch(toggleLogs, toggleList);

    addCommands(globalCommands, ConsoleJS.Remote.Commands.Global);
    addCommands(deviceCommands, ConsoleJS.Remote.Commands.Device);
    addCommands(userCommands, ConsoleJS.Remote.Commands.User);

    bindCommands();
    bindEditor();

    server.start();

    $(window).resize(sizing);
    sizing();
});