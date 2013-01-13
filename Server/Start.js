//var argv = require('optimist').argv;
//var fs = require('fs');
//var config = require('./Config.js');
//
//if (argv['h'])         { config.host        = argv['h']; }
//if (argv['host'])      { config.host        = argv['host']; }
//
//if (argv['p'])         { config.port        = argv['p']; }
//if (argv['port'])      { config.port        = argv['port']; }
//
//
//
//if (!config.host) {
//    console.error("Please specify a valid hostname or IP for your computer using the \"-h\" command-line parameter.");
//    process.exit(1);
//}

var server = require('./Server');
server.start();