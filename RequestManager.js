/**
 * Created with IntelliJ IDEA.
 * User: Nisheeth
 * Date: 25/12/12
 * Time: 17:55
 * To change this template use File | Settings | File Templates.
 */

function RequestManager(logger) {
    this.logger = logger;
    this.queue = [];
    this.busy = false;
    this.isWebSocketSupported = !!("WebSocket" in window);
    this.activeWebSocketConnections = {};
    this.request = new XMLHttpRequest();
}

RequestManager.prototype.add = function add(config, callback) {
    this.queue.push({
        config: config,
        callback: callback
    });

    if (!this.busy) {
        this.processRequest();
    }
};

RequestManager.prototype.next = function next() {
    this.busy = (this.queue.length > 0);

    if (this.busy) {
        this.processRequest();
    }
};

RequestManager.prototype.processRequest = function processRequest() {
    var request = this.queue.shift();

    if (this.isWebSocketSupported) {
        this.processWebSocketRequest(request);
    } else {
        this.processAjaxRequest(request);
    }
};

RequestManager.prototype.processAjaxResponse = function processAjaxResponse(config) {
    if (this.request.responseText) {
        var response = this.parseJSON(this.request.responseText);
        if (config.callback) {
            config.callback(response);
        }
    }
}

RequestManager.prototype.processAjaxRequest = function processAjaxRequest(config) {
    var self = this;

    this.request.open(config.method, config.url, config.async);

    if (config.headers) {
        this.request.setRequestHeader('Content-Type', config.headers.contentType);
    }

    if (config.async) {
        this.request.onreadystatechange = function onReadyStateChange() {
            if (self.request.readyState === 4) {
                if (self.request.status >= 200 && self.request.status < 300) {
                    self.processAjaxResponse(config);
                }

                self.next();
            }
        };
    }

    this.request.onerror = function onError() {
        self.logger.error(arguments, self.request);
        self.next();
    };

    this.request.send(JSON.stringify(config.payload));

    if (!config.async) {
        this.processAjaxResponse(config);
        this.next();
    }
};

RequestManager.prototype.processWebSocketRequest = function processWebSocketRequest(config) {
    var request = this.getWebSocketConnection(config);
    request.send(JSON.stringify(config.payload));
};

RequestManager.prototype.getWebSocketConnection = function getWebSocketConnection(config) {
    if (!this.activeWebSocketConnections[config.url]) {
        this.createWebSocket(config);
    }

    return this.activeWebSocketConnections[config.url];
};

RequestManager.prototype.createWebSocket = function createWebSocket(config) {
    if (!this.activeWebSocketConnections[config.url]) {
        var self = this,
            request = new WebSocket(config.url);

        request.onopen = function onOpen(evt) {
            self.logger.info('Connected', evt);
        };

        request.onmessage = function onMessage(evt) {
            if (evt.data) {
                var response = self.parseJSON(evt.data);
                if (config.callback) {
                    config.callback(response);
                }

                self.next();
            }
        };

        request.onerror = function onError(evt) {
            self.logger.error('Error', evt);
            self.next();
        };

        request.onclose = function onClose(evt) {
            self.logger.info('Disconnected', evt);
        };

        this.activeWebSocketConnections[config.url] = request;
    }
};

RequestManager.prototype.parseJSON = function parseJSON(string) {
    try {
        return JSON.parse(string);
    } catch (ex) {
        return null;
    }
};