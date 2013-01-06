/*globals navigator,window,console */
window.console = window.console || {};
window.JSON = window.JSON || {};
window.Aardwolf = window.Aardwolf || {};

window.console = (function(win, doc, native, config)
{
	config = config || {};
	native = native || {};
	var console = {};
	var noScope = ['dir', 'dirxml'];
	
	var hasProfiler = (function(console){
		try {
			if (typeof console.profiles === 'object') {
			  console.profile('enableCheck');
			  console.profileEnd();
			  return console.profiles.length > 0;
			}
		} catch (e) {}
		
		return false;
	}(native));
	
	function createException(){
		try {
			undef();
		} catch (e) {
			return e;
		}
	}

	function postMessage(params) {
	  server.call(server, funName, value || stringify(args), stack ? stringify(stack) : '');
	  //logToUI(args.concat([e]));
	}
	
	function logNativeAndSend(args, value, traceStack) {
		var funName = arguments.callee.name;
		if (native[funName]) {
		  if (noScope.indexOf(funName) > -1) {
			native[funName](args);
		  } else {
			native[funName].apply(native, args);
		  }
		}
		
		postMessage({
			name: funName, 
			arguments: args, 
			value: value, 
			traceStack: traceStack
		});
	}
	
	function process() {
		logNativeAndSend(arguments);
	};
	
	// ----- Override CONSOLE methods -----//
	console.log = console.info = 
	console.warn = console.debug = 
	console.group = console.groupCollapsed = 
	console.groupEnd = console.markTimeline = process;

	
	function clear() {

	};

	function assert(x) {

	};

	function error(e) {

	};

	function exception(e) {

	};

	function trace() {

	};

	function count(key) {

	};

	function dir(obj) {

	};

	function dirxml(node) {

	};

	function time(name, reset) {

	};

	function timeEnd(name) {

	};

	function profile(title) {

	};

	function profileEnd(title) {

	};

	// ----- Override CONSOLE methods TODO -----//
	function timeStamp(name) {

	};


	
	
	
	
	return console;
	
}(window, document, window.console, {}));



(function () {

  var nativeConsole = window.nativeConsole = window.console,
    browserMode = null,
    countId = "_",
    counters = {},
    timeCounters = {},
    withoutScope = ['dir', 'dirxml'],
    toDoList = ['group', 'groupCollapsed', 'groupEnd', 'markTimeline', 'timeStamp'],
    logger,
    loggerStyle = 'background-color: lightgrey; border: 5px solid white; position: absolute; height : 200px; width : 400px; z-index: 1000; margin: 10px; padding: 5px; color: black; font-size: 12px;',
    isConsoleProfileSupported = false,
    profilesTitle = [],
    activeProfiles = [],
    profiles = [],
    profileId = 0,
    nodeDepth = 0,
    isProfilerEnabled = false;

  try {
    if (typeof nativeConsole.profiles === 'object') {
      nativeConsole.profile('enableCheck');
      nativeConsole.profileEnd();
      isConsoleProfileSupported = nativeConsole.profiles.length > 0;
    }
  } catch (e) {}

  function createException() {
    try {
      undef();
    } catch (e) {
      return e;
    }
  }

  function createUI() {
    try{
      if (logger) {
        return logger;
      }
      logger = window.document.createElement('div');
      logger.id = 'logger';
      logger.innerHTML = "<b><u>UI Logger :</u></b><br>";
      logger.setAttribute('style', loggerStyle + 'display:none;');
      window.document.body.appendChild(logger);
      return logger;
    }catch(e){
      document.writeln(e.toString());
    }
  }

  function server(funName, values, stack) {
    nativeConsole.log(funName, values, stack);
  }

  function sortci(a, b) {
    return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
  }

  function getFuncName(f) {
    var name; // in FireFox, Function objects have a name property...
    if (f) {
      name = (f.getName instanceof Function) ? f.getName() : f.name;
      name = name || f.toString().match(/function\s*([_$\w\d]*)/)[1];
    }
    return name || "anonymous";
  }

  function stringify(o, simple) {
    try{
      var json = '', i,ii,type = ({}).toString.call(o),pLen = 0,nLen = 0,
        parts = [],names = [],
        typeList = ['[object String]', '[object Error]', '[object Arguments]', '[object Array]', '[object Object]', '[object Number]', '[object Boolean]', '[object Function]', '[object ErrorEvent]', '[object ScriptProfileNode]', '[object ScriptProfile]', 'object'];

      if (typeList.indexOf(type) === -1) {
        type = typeof (type);
      }

      if (typeList.indexOf(type) > -1) {
        switch (type) {
          case '[object Error]':
          case '[object ErrorEvent]':
            o = o.message;
          case '[object String]':
            json = '"' + o.replace(/\n/g, '\\n').replace(/"/g, '\\"').replace(/</g, '').replace(/>/g, '') + '"';
            break;
          case '[object Arguments]':
            o = Array.prototype.slice.call(o);
          case '[object Array]':
            json = '[';
            for (i = 0, ii = o.length; i < ii; i++) {
              parts[pLen++] = stringify(o[i], simple);
            }
            json += parts.join(', ') + ']';
            break;
          case 'object':
          case '[object ScriptProfile]':
          case '[object ScriptProfileNode]':
          case '[object Object]':
            json = '{ ';
            for (i in o) {
              names[nLen++] = i;
            }
            names.sort(sortci);
            for (i = 0; i < nLen; i++) {
              parts[pLen++] = stringify(names[i]) + ': ' + stringify(o[names[i]], simple);
            }
            if (o.constructor && o.constructor.name) {
              parts[pLen++] = stringify('constructor') + ': ' + stringify(o.constructor.name);
            }
            if (type === '[object ScriptProfileNode]') {
              parts[pLen++] = stringify('children') + ': ' + stringify(o.children());
            }

            json += parts.join(', ') + '}';
            break;

          case '[object Number]':
            json = String(o);
            break;
          case '[object Boolean]':
            json = o ? 'true' : 'false';
            break;
          case '[object Function]':
            json = '"' + getFuncName(o) + '"';
            break;
          default:
            break;
        }
      } else if (o === null) {
        json = '"null"';

      } else if (o === undefined) {
        json = '"undefined"';

      } else if (simple === undefined) {
        json = type + '{\n';
        for (i in o) {
          names[nLen++] = i;
        }
        names.sort(sortci);
        for (i = 0; i < nLen; i++) {
          // safety from max stack
          parts[pLen++] = names[i] + ': ' + stringify(o[names[i]], true);
        }
        json += parts.join(',\n') + '\n}';

      } else {
        try {
          // should look like an object
          json = String(o);
        } catch (e) {}
      }

      return json;
    }catch(e){
      logToUI(e);
    }
  }
  /*ignore jslint end*/

  function sendLog(args, funName, value, stack) {
    if (nativeConsole[funName]) {
      //setTimeout(function(){
      if (withoutScope.indexOf(funName) > -1) {
        nativeConsole[funName](args);
      } else {
        nativeConsole[funName].apply(nativeConsole, args);
      }
      if (toDoList.indexOf(funName) > -1) {
        warn("console." + funName + "() is not yet supported for remote debugging.");
      }
      //}, 5);
    }

    try{
      server.call(server, funName, value || stringify(args), stack ? stringify(stack) : '');
    }catch(e){
      logToUI(args.concat([e]));
    }
  }

  function getProfile(title) {
    var i = 0, item;
    for (;item = activeProfiles[i++];) {
      if (item.title === title) {
        return item;
      }
    }
    return null;
  }

  function getChildNode(list, depth, currentDepth) {
    currentDepth = currentDepth || 1;
    return (currentDepth < depth) ? getChildNode(list.children[list.children.length - 1], depth, ++currentDepth) : list;
  }

  function getProfileNode(list, funName, file, line) {
    var i = 0,item;
    for(;item = list[i++];) {
      if (item.functionName === funName && item.url === file && item.lineNumber === line) {

        return item;
      }
    }
    return null;
  }

  function ScriptProfile(title, uid) {
    this.head = new ScriptProfileNode("(root)", "", 0);
    this.title = title;
    this.uid = uid;
    this.active = true;
  };

  function ScriptProfileNode(functionName, file, line) {
    this.functionName = functionName;
    this.lineNumber = line;
    this.url = file;
    this.callUID = 10001;
    this.numberOfCalls = 0;
    this._startTime = +(new Date());
    this._endTime = 0;
    this.selfTime = 0;
    this.totalTime = 0;
    this.visible = true;
    this.children = [];
  };

  // ADDITIONAL CONSOLE methods //
  function show() {
    createUI().setAttribute('style', loggerStyle + 'display:block;');
  }

  function hide() {
    createUI().setAttribute('style', loggerStyle + 'display:none;');
  }

  function logToUI() {
    var ANON = '{anonymous}',
      fnRE = /function\s*([\w\-$]+)?\s*\(/i,
      fn;

    try{
      fn = fnRE.test(arguments.callee.caller.toString()) ? RegExp.$1 || ANON : ANON;
    }catch(e){
      fn = '{anonymous}';
    }

    createUI().innerHTML += "<li>"+ fn +':'+ stringify(arguments) + "</li>";
    show();
  }

  function connectTo(callback) {
    if (typeof callback === 'function') {
      server = callback;
    } else {
      logToUI("connectTo: callback is not a function.")
    }
  }

  function modeCheck(e) {
    if (e.hasOwnProperty('arguments') && e.stack) {
      return 'chrome';
    } else if (typeof e.message === 'string' && typeof window !== 'undefined' && window.opera) {
      if (!e.stacktrace) {
        return 'opera9';
      }
      if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
        return 'opera9';
      }
      if (!e.stack) {
        return 'opera10a';
      }
      if (e.stacktrace.indexOf("called from line") < 0) {
        return 'opera10b';
      }
      return 'opera11';
    } else if (e.stack) {
      return 'firefox';
    }
    return 'other';
  };

  var formatter = {
    chrome: function (e, returnObject) {
      if (returnObject) {
        var stack = e.stack.replace(/\n\r|\r\n/g, "\n").split(/[\n\r]/),
          length = stack.length,
          result = [];

        for(var i = 0; i < length; i++) {
          var item = stack[i],
            match = item.match(/^\s+at\s+(.*)((?:http|https|ftp|file):\/\/.*)$/);
          if (match) {
            var frame = {
              name: match[1].replace(/\s*\($/, "") || "{anonymous}"
            }, value = match[2].match(/^(.+)\:(\d+\:\d+)\)?$/);
            if (value) {
              frame.href = value[1];
              frame.lineNo = value[2].substring(0, value[2].indexOf(':'));
            }
            result.push(frame);
          }
        };

        return result;
      } else {
        var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
          replace(/^\s+(at eval )?at\s+/gm, '').
          replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
          replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
        stack.pop();
        return stack;
      }
    },
    firefox: function (e, returnObject) {
      var stack = e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n'),
        i = 0,
        idx = 0,
        count = 0
      length = stack.length,
        items = [];

      for (; i < length; i++) {
        var item = stack[i],
          value = item || '';
        if (value.indexOf('@http') > -1) {
          if (idx) {
            items[idx] += value;
          } else {
            items[count++] = value;
          }
          idx = 0;
        } else {
          if (idx) {
            items[idx] += value;
          } else {
            idx = count;
            items[count++] = value;
          }
        }
      };
      items.pop();

      if (returnObject) {
        var item, i = 0,
          result = [];
        for (; item = items[i++];) {
          var match = item.match(/^(.*)((?:http|https|ftp|file):\/\/.*)$/);
          if (match) {
            var name = match[1].replace(/\s*\($/, "") || "{anonymous}",
              frame = {
                name: name.substring(0, name.indexOf("("))
              }, value = match[2].match(/(.+)\:(.+)/);

            if (value) {
              frame.href = value[1];
              frame.lineNo = value[2];
            }
            result.push(frame);
          }
        }

        return result;
      } else {
        return items;
      }
    },
    opera11: function (e, returnObject) {
      var ANON = '{anonymous}',
        lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/,
        lines = (e.stacktrace || '').split('\n'),
        result = [];

      for (var i = 0, len = lines.length; i < len; i += 2) {
        var match = lineRE.exec(lines[i]);
        if (match) {
          var location = match[4] + ':' + match[1] + ':' + match[2];
          var fnName = match[3] || "global code";
          fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
          if (returnObject) {
            result.push({
              name: fnName,
              href: match[4],
              lineNo: match[1]
            });
          } else {
            result.push(fnName + '@' + location);
          }
        }
      };

      return result;
    },
    opera10b: function (e, returnObject) {
      var lineRE = /^(.*)@(.+):(\d+)$/,
        lines = (e.stacktrace || '').split('\n'),
        result = [];

      for (var i = 0, len = lines.length; i < len; i++) {
        var match = lineRE.exec(lines[i]);
        if (match) {
          var fnName = match[1] ? (match[1] + '()') : "global code";
          if (returnObject) {
            result.push({
              name: fnName,
              href: match[2],
              lineNo: match[3]
            });
          } else {
            result.push(fnName + '@' + match[2] + ':' + match[3]);
          }
        }
      };

      return result;
    },
    opera10a: function (e, returnObject) {
      var ANON = '{anonymous}',
        lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i,
        lines = (e.stacktrace || '').split('\n'),
        result = [];

      for (var i = 0, len = lines.length; i < len; i += 2) {
        var match = lineRE.exec(lines[i]);
        if (match) {
          var fnName = match[3] || ANON;
          if (returnObject) {
            result.push({
              name: fnName,
              href: match[2],
              lineNo: match[1]
            });
          } else {
            result.push(fnName + '()@' + match[2] + ':' + match[1]);
          }
        }
      };
      return result;
    },
    opera9: function (e, returnObject) {
      var ANON = '{anonymous}',
        lineRE = /Line (\d+).*script (?:in )?(\S+)/i,
        lines = e.message.split('\n'),
        result = [];

      for (var i = 2, len = lines.length; i < len; i += 2) {
        var match = lineRE.exec(lines[i]);
        if (match) {
          if (returnObject) {
            result.push({
              name: ANON,
              href: match[2],
              lineNo: match[1]
            });
          } else {
            result.push(ANON + '()@' + match[2] + ':' + match[1]);
          }
        }
      };

      return result;
    },
    other : function(fn, returnObject){
      var frames = [];
      var maxStackSize = 30;

      try{
        for (;(fn = fn.caller);){
          frames.push({
            name: getFuncName(fn),
            fn: fn
          });
          if(i++ >= maxStackSize) break;
        }
      }catch(e){}

      if(!returnObject){
        for(var i = 0, ii = frames.length; i < ii; i++){
          frames[i] = frames[i].name;
        }
      }
      return frames;
    },
    aardwolf : function(returnObject){
      var stack = Aardwolf.getStack();
      if(!returnObject){
        for(var i = 0, ii = stack.length; i < ii; i++){
          var item = stack[i];
          stack[i] = item.name + '(' + item.href +':' + item.lineNo +')';
        }
      }
      return stack;
    }
  };

  function traceStack(err, returnObject) {
    try{
      err = err || createException();
      browserMode = modeCheck(err);
      var type = ({}).toString.call(err);

      if(['[object Error]','[object ErrorEvent]'].indexOf(type) === -1){
        warn(type + ' error type missing!');
        return [];
      }

      if(browserMode !== 'other' && (!!(err.stack || err.stacktrace) || browserMode === 'opera9')){
        return formatter[browserMode](err, returnObject) || [];
      }else if(Aardwolf && Aardwolf.getStack){
        return formatter.aardwolf(returnObject);
      }else{
        return formatter.other(arguments.callee, returnObject);
      }
    }catch(e){
      logToUI(e);
    }
  };

  function profilerOut() {
    if (!isConsoleProfileSupported && isProfilerEnabled) {
      if (nodeDepth) {
        var i = 0,
          item,
          endTime = +(new Date());
        for (;item = activeProfiles[i++];) {
          updateScriptNode(getChildNode(item.head, nodeDepth + 1), endTime);
        };
        --nodeDepth;
      }
    }
  }

  function updateScriptNode(node, endTime) {
    if (node) {
      node._endTime = endTime;
      node.totalTime = (node._endTime - node._startTime);
    }
  }

  function profiler(functionName, file, line) {
    if (!isConsoleProfileSupported && isProfilerEnabled) {
      ++nodeDepth;
      var profileNode = new ScriptProfileNode(functionName, file, line),
        i = 0,
        item;
      for (;item = activeProfiles[i++];) {
        var node = getChildNode(item.head, nodeDepth);
        if (node) {
          var pNode = getProfileNode(node.children, functionName, file, line);
          if (pNode) {
            ++pNode.numberOfCalls;
          } else {
            node.children.push(profileNode);
          }
        }
      };
    }
  }

  // ----- Override CONSOLE methods -----//
  function log() {
    sendLog(arguments, "log");
  };

  function info() {
    sendLog(arguments, "info");
  };

  function warn() {
    sendLog(arguments, "warn");
  };

  function debug() {
    sendLog(arguments, "debug");
  };

  function clear() {
    counters = {};
    timeCounters = {};
    traceRecursion = 0;
    sendLog(arguments, "clear");
  };

  function assert(x) {
    if (!x) {
      var args = ['Assertion failed:'];
      args = args.concat(Array.prototype.slice.call(arguments, 1));
      sendLog(arguments, "assert", stringify(args), traceStack());
    } else {
      sendLog(arguments, "assert");
    }
  };

  function error(e) {
    sendLog(arguments, "error",
      null,
      traceStack(e));
  };

  function exception(e) {
    sendLog(arguments, "error",
      null,
      traceStack(e));
  };

  function trace() {
    sendLog(arguments, "trace",
      null,
      traceStack());
  };

  function count(key) {
    try{
      var frameId = countId + (key || '_GLOBAL__'),
        frameCounter = counters[frameId];

      if (!frameCounter) {
        counters[frameId] = frameCounter = {
          key: key || '',
          count: 1
        };
      } else {
        ++frameCounter.count;
      }

      sendLog(arguments, "count", (key || '') + ": " + frameCounter.count);
    }catch(e){
      logToUI(e);
    }
  };

  function dir(obj) {
    sendLog(obj, "dir", stringify([obj]));
  };

  function dirxml(node) {
    try{
      if (node instanceof Window) node = node.document.documentElement;
      else if (node instanceof Document) node = node.documentElement;

      var value = node ? node.outerHTML || node.innerHTML || node.toString() || stringify(node) : null;
      sendLog(node, "dirxml", value);
    }catch(e){
      logToUI(e);
    }
  };

  function time(name, reset) {
    try{
      if (!name) return;

      var time = new Date().getTime(),
        key = "KEY" + name.toString();

      if (!reset && timeCounters[key]) return;

      timeCounters[key] = time;
      sendLog(arguments, "time");
    }catch(e){
      logToUI(e);
    }
  };

  function timeEnd(name) {
    try{
      var time = new Date().getTime(),
        key = "KEY" + name.toString(),
        timeCounter = timeCounters[key];

      if (timeCounter) {
        var diff = time - timeCounter;
        delete timeCounters[key];
        sendLog(arguments, "timeEnd", name + ": " + diff + "ms");
      }
    }catch(e){
      logToUI(e);
    }
  };

  function profile(title) {
    try{
      title = title || 'Profile ' + (++profileId);

      if (profilesTitle.indexOf(title) === -1) {
        profilesTitle.push(title);
        if (!isConsoleProfileSupported) {
          activeProfiles.push(new ScriptProfile(title, profileId));
          isProfilerEnabled = true;
        };
        sendLog([title], "profile", 'Profile "' + title + '" started.');
      } else {
        warn(title + " profile already active.");
      }
    }catch(e){
      logToUI(e);
    }
  };

  function profileEnd(title) {
    try{
      if (!title) {
        title = profilesTitle[profilesTitle.length - 1];
      }
      var index = profilesTitle.indexOf(title);
      if (index > -1) {
        if (!isConsoleProfileSupported) {
          var profile = getProfile(title);
          if (profile) {
            delete profile.active;
            var head = profile.head;
            if (!head.totalTime) {
              if (head.children.length > 0) {
                var min = 0,
                  max = 0,
                  i = 0,
                  item;
                for (;item = head.children[i++];) {
                  if (!min) {
                    min = item._startTime;
                  };

                  min = Math.min(min, item._startTime);
                  max = Math.max(max, item._endTime);
                }
                head.totalTime = (max - min);
                head._startTime = min;
                head._endTime = max;
              } else {
                head.totalTime = (+(new Date()) - head._startTime);
              }
            }
            profiles.push(profile);
          };
        };
        profilesTitle.splice(index, 1);
        isProfilerEnabled = profilesTitle.length > 0;
        sendLog([title], "profileEnd", 'Profile "' + title + '" finished.');
      } else {
        warn(title + " profile doesn't exist.");
      }
    }catch(e){
      logToUI(e);
    }
  };

  // ----- Override CONSOLE methods TODO -----//
  function group() {
    sendLog(arguments, "group");
  };

  function groupCollapsed() {
    sendLog(arguments, "groupCollapsed");
  };

  function groupEnd() {
    sendLog(arguments, "groupEnd");
  };

  function markTimeline() {
    sendLog(arguments, "markTimeline");
  };

  function timeStamp(name) {
    sendLog(arguments, "timeStamp");
  };

  var consoleObj = {
    assert: assert,
    count: count,
    debug: debug,
    dir: dir,
    dirxml: dirxml,
    error: error,
    group: group,
    groupCollapsed: groupCollapsed,
    groupEnd: groupEnd,
    info: info,
    log: log,
    markTimeline: markTimeline,
    profile: profile,
    profileEnd: profileEnd,
    time: time,
    timeEnd: timeEnd,
    timeStamp: timeStamp,
    trace: trace,
    exception: exception,
    clear: clear,
    warn: warn,
    profiles: isConsoleProfileSupported ? nativeConsole.profiles : profiles,

    profiler: profiler,
    profilerOut: profilerOut,
    stringify: stringify,
    getStack: traceStack,
    connectTo: connectTo,
    show: show,
    hide: hide,
    logToUI: logToUI
  };

  if (!window.JSON.stringify) {
    window.JSON.stringify = stringify;
  }

  // just in case its readOnly
  window.BBConsole = window.console = consoleObj;
}());