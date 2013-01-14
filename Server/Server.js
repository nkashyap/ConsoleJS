var io = require('socket.io'),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    ConnectionManager = require('./ConnectionManager');


module.exports.start = function start(config) {

    var webServer = http.createServer(handler),
        socketServer = io.listen(webServer),
        manager = new ConnectionManager(socketServer);

    webServer.listen(8082);

    socketServer.configure(function () {
        socketServer.set('log level', 0);
    });

    function parseURL(url) {
        if (url == '/') {
            url = '/UI/index.html';
        }

        return url;
    }

    function handler(request, response) {
        var url = parseURL(request.url),
            ext = path.extname(url),
            contentType = 'text/html';

        switch (ext) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
        }

        fs.readFile(__dirname + '/..' + url,
            function (err, data) {
                if (err) {
                    response.writeHead(500);
                    return response.end('Error loading ' + request.url);
                }

                response.writeHead(200, { 'Content-Type': contentType });
                response.end(data, 'utf-8');
            }
        );
    }

    socketServer.sockets.on('connection', function (socket) {
        manager.add(socket);

        socket.on('disconnect', function () {
            console.log('disconnect', socket.id);
            manager.remove(socket);
        });

        socket.on('subscribe', function (data) {
            console.log('subscribe', data);
            manager.subscribe(socket, data);
        });

        socket.on('unsubscribe', function (data) {
            console.log('unsubscribe', data);
            manager.unSubscribe(socket, data);
        });

        socket.on('console', function (data) {
            //console.log('console', data);
            manager.console(socket, data);
        });

        socket.on('command', function (data) {
            console.log('command', data);
            manager.command(socket, data);
        });
    });
};