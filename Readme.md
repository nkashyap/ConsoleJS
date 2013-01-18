# ConsoleJS

ConsoleJS is a Node.JS project. Its provide Remote Web Console for websites, Javascript, Smart Tv, mobile phones apps.
It uses socket.io to provide real time response from the browsers.

Its works pretty much on all modern browsers, mobile devices, Smart TVs, etc
Some issue with Philips 2011 and Samsung 2010 TVs

## Install Socket.io

```bash
npm install socket.io
```

## Start server

```bash
node Server\Start.js
```

## Inject following scripts in your website or javascript application

```html
<script type="text/javascript" src="http://NodeServerURL:Port/socket.io/socket.io.js"></script>
<script type="text/javascript" src="http://NodeServerURL:Port/Client/ConsoleJS.js"></script>
<script type="text/javascript" src="http://NodeServerURL:Port/Client/BrowserJS.js"></script>
```

Then goto following url to access web console http://NodeServerURL:Port/

#TODO
Change it into npm module.
