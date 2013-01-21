// Philips 2011/Samsung 2010/Opera 9.80 fix
io.Transport["jsonp-polling"].prototype.post = function (data) {
    var self = this,
        query = io.util.query(this.socket.options.query, 't=' + (+new Date()) + '&i=' + this.index);

    if (!this.form) {
        var form = document.createElement('form'),
            area = document.createElement('textarea'),
            id = this.iframeId = 'socketio_iframe_' + this.index,
            iframe;

        form.className = 'socketio';
        form.style.position = 'absolute';
        form.style.top = '0px';
        form.style.left = '0px';
        form.style.display = 'none';
        form.target = id;
        form.method = 'POST';
        form.setAttribute('accept-charset', 'utf-8');
        area.name = 'd';
        form.appendChild(area);
        document.body.appendChild(form);

        this.form = form;
        this.area = area;
    }

    this.form.action = this.prepareUrl() + query;

    function complete() {
        initIframe();
        self.socket.setBuffer(false);
    }

    function initIframe() {
        if (self.iframe) {
            self.form.removeChild(self.iframe);
        }

        try {
            // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
            iframe = document.createElement('<iframe name="' + self.iframeId + '">');
        } catch (e) {
            iframe = document.createElement('iframe');
            iframe.name = self.iframeId;
        }

        iframe.id = self.iframeId;

        self.form.appendChild(iframe);
        self.iframe = iframe;
    }

    initIframe();

    // we temporarily stringify until we figure out how to prevent
    // browsers from turning `\n` into `\r\n` in form inputs
    this.area.value = io.JSON.stringify(data);

    try {
        this.form.submit();
    } catch (e) {
    }

    if (this.iframe.attachEvent) {
        iframe.onreadystatechange = function () {
            if (self.iframe.readyState.toLowerCase() === 'complete') {
                complete();
            }
        };
    } else {
        this.iframe.onload = complete;
    }

    this.socket.setBuffer(true);

    setTimeout(complete, 3000);
};