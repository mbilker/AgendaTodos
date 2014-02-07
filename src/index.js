var path = require('path');
var url = require('url');
var http = require('http');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var flash = require('connect-flash');
var RedisStore = require('connect-redis')(express);
var connectTimeout = require('connect-timeout');
var models = require('./models');
var utils = require('./utils');
var Config = require('./config');

var base = path.join(__dirname, '..');
var PORT = process.env.PORT || 5000;

function App() {
  this.app = app;
  this.utils = utils;
  this.models = models;

  var store = { secret: '1337' };

  app.configure('development', function() {
    app.use(express.logger('dev'));
    app.use(express.errorHandler({ dumpExceptions: true }));
    app.locals.pretty = true;
  });

  app.configure('production', function() {
    var a = url.parse(process.env.REDISCLOUD_URL);
    store.store = new RedisStore({ port: a.port, host: a.hostname, pass: a.auth.split(":")[1] });
  });

  app.configure(function() {
    app.set('view engine', 'ejs');
    app.set('views', path.join(base, 'views'));
    app.use(connectTimeout({ time: 10000 }));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session(store));
    app.use(flash());
    app.use(function(req, res, next) {
      res.locals.settings = settings = {};
      settings.info = req.flash('info');
      settings.error = req.flash('error');

      next();
    });
    app.use(app.router);
    app.use(express.static(path.join(base, 'public')));
  });
}

App.prototype.init = function init() {
  mongoose.connect(Config.mongodb);

  require('./routes/list').call(this);
  require('./routes/sessions').call(this);
  require('./routes/users').call(this);
  require('./routes/sync').call(this);

  this.server = http.createServer(app);
  this.server.listen(PORT, function() {
    console.log('Agenda Book Server ready, port: %s, environment: %s', PORT, app.settings.env);
  });
}

module.exports = new App();
