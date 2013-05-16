var io = require('socket.io'),
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    path = require('path'),
    os = require('os'),
    GUID = require('./Guid'),
    ConnectionManager = require('./ConnectionManager');


module.exports.start = function start(config) {

    var webServer, socketServer, manager, originalHandleRequest;

    if (config.secure) {
        //    download and install OPENSSL and generate certificates using following commands
        //    set OPENSSL_CONF=C:\OpenSSL-Win64\bin\openssl.cfg
        //    openssl genrsa -out privatekey.pem 1024
        //    openssl req -new -key privatekey.pem -out certrequest.csr
        //    openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
        webServer = https.createServer({
            key: fs.readFileSync('certificates/privatekey.pem'),
            cert: fs.readFileSync('certificates/certificate.pem')
        }, handler);

    } else {
        webServer = http.createServer(handler);
    }

    console.log('Remote console URL: ' + (config.secure ? 'https://' : 'http://') + os.hostname() + ':' + config.port);

    socketServer = io.listen(webServer);
    manager = new ConnectionManager(socketServer, config);
    originalHandleRequest = io.Manager.prototype.handleRequest;

    io.Manager.prototype.handleRequest = function handleRequest(request, response) {
        if (!GUID.isSet(request.headers)) {
            GUID.set(response);
        }

        originalHandleRequest.call(socketServer, request, response);
    };

    webServer.listen(config.port);

    socketServer.configure(function () {
        socketServer.enable('browser client minification');
        //socketServer.enable('browser client etag');
        //socketServer.enable('browser client gzip');
        socketServer.set('log level', 2);
        socketServer.set('transports', [
            'websocket',
            'htmlfile',
            'xhr-polling',
            'jsonp-polling'
        ]);

        socketServer.set('authorization', function (handshakeData, callback) {
            if (GUID.isSet(handshakeData.headers)) {
                handshakeData.guid = GUID.getCookie(handshakeData.headers);
            }
            callback(null, true);
        });
    });

    function parseURL(url) {
        if (url == '/' || url == '/index.html') {
            url = '/Remote/index.html';
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
            case '.png':
                contentType = 'image/png';
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
            manager.log(socket, data);
        });

        socket.on('command', function (data) {
            console.log('command', data);
            manager.command(socket, data);
        });
    });
};