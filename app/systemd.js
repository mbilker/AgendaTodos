var net = require('net');

var Server = net.Server.prototype;
var Pipe = process.binding('pipe_wrap').Pipe;

var oldListen = Server.listen;
Server.listen = function() {
  var self = this;

  if (arguments.length === 1 && arguments[0] === 'systemd') {
    if (!process.env.LISTEN_FDS || parseInt(process.env.LISTEN_FDS, 10) !== 1) {
      throw(new Error('No or too many file descriptors received.'));
    }

    self._handle = new Pipe();
    self._handle.open(3);
    self._listen2(null, -1, -1);
  } else {
    oldListen.apply(self, arguments);
  }
}

Server.autoQuit = function(options) {
  var self = this;

  options = options || {};
  options.timeOut = options.timeOut || 600;
  self._autoQuit = {
    options: options,
    connections: 0,
    lastActive: null,
    timeOutHandler: null
  }

  var aquit = self._autoQuit;

  function shutdown() {
    try {
      self.close();
    } catch (e) {
      // Ignore, nothing we can do about it (fails on some older Node.js versions).
    }
    if (aquit.options.exitFn) {
      aquit.options.exitFn();
    } else {
      process.exit(0);
    }
  }

  function shutdownIfNeeded() {
    aquit.timeOutHandler = null;
    if (aquit.connections > 0) {
      // Still have connections!
      return;
    }

    var closeAt = aquit.lastActive + aquit.options.timeOut * 1000;
    if (closeAt > new Date().getTime()) {
      // Reschedule when we actually need to shut down.
      aquit.timeOutHandler = setTimeout(shutdownIfNeeded, closeAt - new Date().getTime());
      return;
    }

    shutdown();
  }

  function isInactive() {
    // We don't have any connections anymore, schedule a shutdown.
    aquit.lastActive = new Date().getTime();
    if (aquit.timeOutHandler == null) {
      var interval = aquit.options.timeOut * 1000;
      aquit.timeOutHandler = setTimeout(shutdownIfNeeded, interval);
    }
  }

  function countConnection(request) {
    aquit.connections += 1;
    request.on('end', countDisconnect);
  }

  function countDisconnect() {
    aquit.connections -= 1;
    if (aquit.connections === 0) {
      isInactive();
    }
  }
  self.on('request', countConnection);

  isInactive();
}
