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

ConsoleJS.Remote.Commands.Device = {
    "nav-header-1": "LG",
    "Device Info": "(function(){ " +
        "	var device = document.getElementById('device'); " +
        "	if(!device){ " +
        "		device = document.createElement('object'); " +
        "		device.type = 'application/x-netcast-info'; " +
        "		device.id = 'device'; " +
        "		document.body.appendChild(device); " +
        "	} " +
        "	console.dir({ " +
        "		version: device.version, " +
        "		swVersion: device.swVersion, " +
        "		hwVersion: device.hwVersion, " +
        "		SDKVersion: device.SDKVersion, " +
        "		manufacturer: device.manufacturer, " +
        "		modelName: device.modelName, " +
        "		serialNumber: device.serialNumber, " +
        "		osdResolution: device.osdResolution, " +
        "		networkType: device.networkType, " +
        "		net_macAddress: device.net_macAddress, " +
        "		drmClientInfo: device.drmClientInfo, " +
        "		net_dhcp: device.net_dhcp, " +
        "		net_isConnected: device.net_isConnected, " +
        "		net_hasIP: device.net_hasIP, " +
        "		net_ipAddress: device.net_ipAddress, " +
        "		net_netmask: device.net_netmask, " +
        "		net_gateway: device.net_gateway, " +
        "		net_dns1: device.net_dns1, " +
        "		net_dns2: device.net_dns2, " +
        "		supportMouse: device.supportMouse, " +
        "		supportVoiceRecog: device.supportVoiceRecog, " +
        "		supportPentouch: device.supportPentouch, " +
        "		support3D: device.support3D, " +
        "		support3DMode: device.support3DMode, " +
        "		preferredSubtitleLanguage: device.preferredSubtitleLanguage, " +
        "		preferredAudioLanguage: device.preferredAudioLanguage, " +
        "		preferredSubtitleStatus: device.preferredSubtitleStatus, " +
        "		tvLanguage2: device.tvLanguage2, " +
        "		tvCountry2: device.tvCountry2, " +
        "		timeZone: device.timeZone, " +
        "		platform: device.platform, " +
        "		chipset: device.chipset " +
        "	}); " +
        "}())",
    "divider-1": null,
    "nav-header-2": "Toshiba",
    "divider-2": null,
    "nav-header-3": "Samsung",
    "divider-3": null,
    "nav-header-4": "Philips",
    "divider-4": null,
    "nav-header-5": "Tecknika",
    "divider-5": null
};

ConsoleJS.Remote.Commands.User = {};