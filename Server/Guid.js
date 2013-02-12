var GUID = {

    cookieName: "guid",

    expiry: 365,

    getCookie: function getCookie(document) {
        if (document && document.cookie) {
            var i,
                cookieName,
                cookieValue,
                cookies = document.cookie.split(";");

            for (i = 0; i < cookies.length; i++) {
                cookieName = (cookies[i].substr(0, cookies[i].indexOf("="))).replace(/^\s+|\s+$/g, "");
                cookieValue = cookies[i].substr(cookies[i].indexOf("=") + 1);

                if (cookieName === this.cookieName) {
                    return unescape(cookieValue);
                }
            }
        }

        return null;
    },

    generateUniqueId: function generateUniqueId() {
        return ((new Date().getTime()) + "-" + Math.random()).replace(".", "");
    },

    getValue: function getValue(value) {
        var expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + this.expiry);
        return this.cookieName + "=" + escape(value) + ((this.expiry === null) ? "" : "; expires=" + expiryDate.toUTCString()) + "; path=/";
    },

    set: function set(document, value) {
        if (!value) {
            value = this.get(document.headers);
        }

        value = this.getValue(value);

        if (document.setHeader) {
            document.setHeader("Set-Cookie", [value]);
        } else if (document.headers) {
            document.headers.cookie = value;
        }
    },

    get: function get(document) {
        var uniqueId = this.getCookie(document);
        if (!uniqueId) {
            uniqueId = this.generateUniqueId();
        }
        return uniqueId;
    },

    isSet: function isSet(document) {
        return !!this.getCookie(document);
    }
};

module.exports = GUID;