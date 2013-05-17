/// <summary>Device detection based on user agent.</summary>

ConsoleJS.Browser = (function () {
    var BrowserDetect = {
        init: function init() {
            this.browser = this.searchString(this.dataBrowser) || "Unknown";
            this.version = this.searchVersion(navigator.userAgent)
                || this.searchVersion(navigator.appVersion)
                || "Unknown";
            this.platform = this.searchString(this.dataOS) || "Unknown";
        },
        searchString: function searchString(data) {
            var i,
                ii = data.length,
                dataString,
                dataProp;

            for (i = 0; i < ii; i++) {
                dataString = data[i].string;
                dataProp = data[i].prop;
                this.versionSearchString = data[i].versionSearch || data[i].identity;
                if (dataString) {
                    if (dataString.indexOf(data[i].subString) !== -1)
                        return data[i].identity;
                }
                else if (dataProp)
                    return data[i].identity;
            }
        },
        searchVersion: function searchVersion(dataString) {
            var version,
                index = dataString.indexOf(this.versionSearchString);

            if (index === -1) {
                return;
            }

            version = dataString.substring(index + this.versionSearchString.length);
            if (version) {
                version = version.replace("/", "");
            }

            return parseFloat(version);
        },
        dataBrowser: [
            {
                string: navigator.userAgent,
                subString: "LG Browser",
                versionSearch: "Browser",
                identity: "LG"
            },
            {
                string: navigator.userAgent,
                subString: "Maple",
                identity: "Maple"
            },
            {
                string: navigator.userAgent,
                subString: "Philips",
                versionSearch: "Version/",
                identity: "Philips"
            },
            {
                string: navigator.userAgent,
                subString: "ToshibaTP",
                versionSearch: "ToshibaTP/",
                identity: "ToshibaTP"
            },
            {
                string: navigator.userAgent,
                subString: "Mstar",
                identity: "Technika"
            },
            {
                string: navigator.userAgent,
                subString: "Technika Media Streamer",
                versionSearch: "Espial Browser/sig",
                identity: "Technika Espial"
            },
            {
                string: navigator.userAgent,
                subString: "Chrome",
                identity: "Chrome"
            },
            {
                string: navigator.userAgent,
                subString: "OmniWeb",
                versionSearch: "OmniWeb/",
                identity: "OmniWeb"
            },
            {
                string: navigator.vendor,
                subString: "Apple",
                identity: "Safari",
                versionSearch: "Version"
            },
            {
                prop: window.opera,
                identity: "Opera",
                versionSearch: "Version"
            },
            {
                string: navigator.vendor,
                subString: "iCab",
                identity: "iCab"
            },
            {
                string: navigator.vendor,
                subString: "KDE",
                identity: "Konqueror"
            },
            {
                string: navigator.userAgent,
                subString: "Firefox",
                identity: "Firefox"
            },
            {
                string: navigator.vendor,
                subString: "Camino",
                identity: "Camino"
            },
            {        // for newer Netscapes (6+)
                string: navigator.userAgent,
                subString: "Netscape",
                identity: "Netscape"
            },
            {
                string: navigator.userAgent,
                subString: "MSIE",
                identity: "Explorer",
                versionSearch: "MSIE"
            },
            {
                string: navigator.userAgent,
                subString: "Gecko",
                identity: "Mozilla",
                versionSearch: "rv"
            },
            {         // for older Netscapes (4-)
                string: navigator.userAgent,
                subString: "Mozilla",
                identity: "Netscape",
                versionSearch: "Mozilla"
            }
        ],
        dataOS: [
            {
                string: navigator.userAgent,
                subString: "NetCast.TV-2011",
                identity: "NetCast.TV-2011"
            },
            {
                string: navigator.userAgent,
                subString: "NetCast.Media-2011",
                identity: "NetCast.STB-2011"
            },
            {
                string: navigator.userAgent,
                subString: "NetCast.TV-2012",
                identity: "NetCast.TV-2012"
            },
            {
                string: navigator.userAgent,
                subString: "NetCast.Media-2012",
                identity: "NetCast.STB-2012"
            },
            {
                string: navigator.userAgent,
                subString: "NETTV/3.1",
                identity: "NETTV/3.1-2011"
            },
            {
                string: navigator.userAgent,
                subString: "NETTV/3.0",
                identity: "NETTV/3.0-2012"
            },
            {
                string: navigator.userAgent,
                subString: "NETTV/3.2",
                identity: "NETTV/3.2-2012"
            },
            {
                string: navigator.userAgent,
                subString: "NETTV/4.0",
                identity: "NETTV/4.0-2012"
            },
            {
                string: navigator.userAgent,
                subString: "SmartTV+2013",
                identity: "Samsung-2013"
            },
            {
                string: navigator.userAgent,
                subString: "SmartTV",
                identity: "Samsung-2012"
            },
            {
                string: navigator.userAgent,
                subString: "DTV_TL868",
                identity: "Toshiba-2011"
            },
            {
                string: navigator.userAgent,
                subString: "DTV_RL953",
                identity: "Toshiba-2012"
            },
            {
                string: navigator.userAgent,
                subString: "Technika22",
                identity: "Mstar"
            },
            {     string: navigator.userAgent,
                subString: "Technika Media Streamer",
                identity: "Avtrex"
            },
            {
                string: navigator.platform,
                subString: "Win",
                identity: "Windows"
            },
            {
                string: navigator.platform,
                subString: "Mac",
                identity: "Mac"
            },
            {
                string: navigator.userAgent,
                subString: "iPhone",
                identity: "iPhone/iPod"
            },
            {
                string: navigator.platform,
                subString: "Linux",
                identity: "Linux"
            }
        ]
    };

    BrowserDetect.init();

    return {
        name: BrowserDetect.browser,
        version: BrowserDetect.version,
        platform: BrowserDetect.platform,
        toString: function () {
            return BrowserDetect.browser + ':' + BrowserDetect.version + ':' + BrowserDetect.platform;
        }
    };
})();

