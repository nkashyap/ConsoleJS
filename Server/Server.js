var io = require('socket.io'),
    http = require('http'),
    fs = require('fs'),
    path = require('path');

module.exports.start = function start(config) {

    var webServer = http.createServer(handler),
        socketServer = io.listen(webServer),
        activeConnections = {
            joins: {},
            client: {},
            remote: {}
        };

    webServer.listen(8082);

    socketServer.configure(function () {
        socketServer.set('log level', 0);
    });

    function parseURL(url) {
        if (url == '/') {
            url = '/index.html';
        }

        if (url.indexOf('.html') > -1) {
            url = '/Static' + url;
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

    function setActiveConnection(id, handshaken) {
        var connection = handshaken[id];
        if (connection.xdomain) {
            if (!activeConnections.client[id]) {
                activeConnections.client[id] = { id: id, url: connection.headers.origin };
            }
        } else {
            if (!activeConnections.remote[id]) {
                activeConnections.remote[id] = { id: id };
            }
        }
    }

    //todo support multi join
    function getRoom(socket) {
        var data = activeConnections.joins[socket.id];
        return data ? data.room : null;
    }

    var emitAlways = ['subscribed', 'unsubscribed'];

    function emit(socket, eventName, data) {
        var room = getRoom(socket);

        if (eventName !== 'console') {
            console.log('emit: ' + eventName, room, data);
        }

        if (room) {
            socket.broadcast.to(room).emit(eventName, data);
        }

        if (emitAlways.indexOf(eventName) > -1 || !room) {
            socket.emit(eventName, data);
        }
    }

    socketServer.sockets.on('connection', function (socket) {
        setActiveConnection(socket.id, socket.manager.handshaken);

        if (activeConnections.remote[socket.id]) {
            Object.getOwnPropertyNames(activeConnections.joins).forEach(function (item) {
                socketServer.sockets.emit('clientConnected', activeConnections.joins[item]);
            });
        }

        socket.on('clientSubscribe', function (data) {
            activeConnections.joins[socket.id] = data;
            socket.join(data.room);
            socketServer.sockets.emit('clientConnected', data);
        });

        socket.on('clientUnsubscribe', function (data) {
            socket.leave(data.room);
            delete activeConnections.joins[socket.id];
            socketServer.sockets.emit('clientDisconnected', data);
        });

        socket.on('subscribe', function (data) {
            emit(socket, 'subscribed', data);
            activeConnections.joins[socket.id] = data;
            socket.join(data.room);
        });

        socket.on('unsubscribe', function (data) {
            emit(socket, 'unsubscribed', data);
            socket.leave(data.room);
            delete activeConnections.joins[socket.id];
        });

        socket.on('console', function (data) {
            emit(socket, 'console', data);
        });

        socket.on('command', function (data) {
            emit(socket, 'command', data);
        });

        socket.on('disconnect', function () {
            var data;
            if (activeConnections.client[socket.id]) {
                data = activeConnections.joins[socket.id];
                if (data) {
                    socket.leave(data.room);
                    delete activeConnections.joins[socket.id];
                    socketServer.sockets.emit('clientDisconnected', data);
                }
            }

            if (activeConnections.remote[socket.id]) {
                data = activeConnections.joins[socket.id];
                if (data) {
                    socket.leave(data.room);
                    delete activeConnections.joins[socket.id];
                }
            }

            delete activeConnections.client[socket.id];
            delete activeConnections.remote[socket.id];

            console.log('disconnect', activeConnections);
        });
    });
};