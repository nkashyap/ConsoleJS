/// <summary>Device detection based on user agent.</summary>

window.DeviceDetection = (function ()
{
    /// <summary>Gets an array of all device regex rules.</summary>
    /// <returns>An array of regex rules and the corresponding device information.</returns>
    function getRegexRules()
    {
        // Note: These rules will be evaluated in order and the first matching rule used

        return [
        // Desktop browsers
            createRule('chrome', 'win', 'desktop', 'generic', /\bChrome\/\b/),
            createRule('opera', 'win', 'desktop', 'generic', /\bOpera\/\b/),

        // LG devices
            createRule('lg', 'netcast', 'stb', '2011', /\bLG NetCast.Media.201[01]\b/),
            createRule('lg', 'netcast', 'tv', '2011', /\bLG NetCast.TV.201[01]\b/),

        // Philips devices
            createRule('philips', 'philipsnettv', 'tv', '2011', /\bNETTV\/3.1\b/),
            createRule('philips', 'philipsnettv', 'tv', '2012', /\bNETTV\/4/),

        // Technika devices
            createRule('technikaavtrex', 'avtrex', 'stb', '2012', /\bTechnika Media Streamer\b/),
            createRule('technikamstar', 'mstar', 'tv', '2012', /\bTechnika22\b/),

        // Toshiba
            createRule('toshibamstar', 'toshibamstar', 'tv', '2011', /\bTOSHIBA\b/),

        // Samsung
            createRule('samsung', 'smarttv', '?', '2010', /\bMaple\b/),
            createRule('samsung2012', 'smarttv2', '?', '2012', /\bMaple2012\b/) 
        ];
    }

    function createRule(name, platform, family, version, regex)
    {
        var device = { name: name, platform: platform, family: family, version: version };
        return { device: device, regex: regex };
    }

    /// <summary>Gets the name of a device based on the user agent.</summary>
    /// <returns>A string containing the name of the device, or 'unknownDevice' if a match could not be found.</returns>
    function getDevice()
    {
        var device = null;
        var regexRules = getRegexRules();

        for (var i = 0; i < regexRules.length; i++)
        {
            var match = regexRules[i].regex.exec(navigator.userAgent);

            if (!!match)
            {
                device = regexRules[i].device;
                break;
            }
        }

        return device;
    }

    /// <summary>Gets the name of a device based on the user agent.</summary>
    /// <returns>A string containing the name of the device, or 'unknownDevice' if a match could not be found.</returns>
    function getDeviceName()
    {
        var device = getDevice();
        
        return !!device ? device.name : 'unknownDevice';
    }

    return {
        getDeviceName: getDeviceName
    };
})();

