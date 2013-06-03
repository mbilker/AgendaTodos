var path = require('path'),
    url = require('url'),
    express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    flash = require('connect-flash'),
    RedisStore = require('connect-redis')(express),
    connectTimeout = require('connect-timeout'),
    models = require('./models'),
    utils = require('./utils'),
    Config = require('./config');

var base = path.join(__dirname, '..'),
    PORT = process.env.PORT || 5000;

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
    store.store = new RedisStore();
  });

  app.configure(function() {
    app.set('db-uri', Config.mongodb);
    app.set('views', path.join(base, 'views'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(connectTimeout({ time: 10000 }));
    app.use(express.session(store));
    app.use(express.methodOverride());
    app.use(flash());
    app.use(function(req, res, next) {
      res.locals.settings = settings = {};
      settings.info = req.flash('info');
      settings.error = req.flash('error');

      settings.jsmain = '/js/todos-main' + (process.env.NODE_ENV == 'production' ? '.min' : '') + '.js';
      settings.cssmain = '/css/style.css';
      next();
    });
    app.use(app.router);
    app.use(express.static(path.join(base, 'public')));
  });

  mongoose.connect(app.set('db-uri'));

  app.listen(PORT);
  console.log('Agenda Book Server ready, port: %s, environment: %s', PORT, app.settings.env);

  require('./routes/list').call(this);
  require('./routes/sessions').call(this);
  require('./routes/users').call(this);
  require('./routes/sync').call(this);
}

module.exports = new App();
