var path = require('path'),
    url = require('url'),
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    mongoose = require('mongoose'),
    flash = require('connect-flash'),
    RedisStore = require('connect-redis')(express),
    connectTimeout = require('connect-timeout'),
    models = require('./models')(mongoose),
    utils = require('./utils')(models),
    Config = require('./config');

var User, LoginToken, Assignment, Section;

var base = path.join(__dirname, '..'),
    PORT = process.env.PORT || 5000,
    App = {};

App.start = function() {

  var store = { secret: '1337' };

  app.configure('development', function() {
    app.use(express.logger('dev'));
    app.use(express.errorHandler({ dumpExceptions: true }));
    app.locals.pretty = true;
  });

  app.configure('production', function() {
    var redisUrl = url.parse(process.env.REDISCLOUD_URL),
        redisAuth = redisUrl.auth.split(':');  
    store.store = new RedisStore({
      host: redisUrl.hostname,
      port: redisUrl.port,
      db: redisAuth[0],
      pass: redisAuth[1]
    });
  });

  app.configure('test', function() {
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

  User = models.User;
  LoginToken = models.LoginToken;
  Task = models.Task;
  Section = models.Section;

  server.listen(PORT);
  console.log('Agenda Book Server ready, port: %s, environment: %s', PORT, app.settings.env);

  function authenticateFromLoginToken(req, res, next) {
    var cookie = JSON.parse(req.cookies.logintoken);

    LoginToken.findOne({ username: cookie.username, series: cookie.series, token: cookie.token }, function(err, token) {
      if (!token) {
        res.redirect('/sessions/new');
        return;
      }

      User.findOne({ username: token.username }, function(err, user) {
        if (user) {
          req.session.user_id = user.id;
          req.currentUser = user;

          token.token = token.randomToken();
          token.save(function() {
            res.cookie('logintoken', token.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
            next();
          });
        } else {
          res.redirect('/sessions/new');
        }
      });
    });
  }

  function loadUser(req, res, next) {
    if (req.session.user_id) {
      User.findById(req.session.user_id, function(err, user) {
        if (user) {
          req.currentUser = user;
          next();
        } else {
          res.redirect('/sessions/new');
        }
      });
    } else if (req.cookies.logintoken) {
      authenticateFromLoginToken(req, res, next);
    } else {
      res.redirect('/sessions/new');
    }
  }

  app.get('/', loadUser, function(req, res) {
    res.redirect('/assignments');
  });

  app.get('/sessions/new', function(req, res) {
    res.render('sessions/new.jade', {
      user: new User()
    });
  });

  app.post('/sessions', function(req, res) {
    User.findOne({ username: req.body.user.username }, function(err, user) {
      if (user && user.authenticate(req.body.user.password)) {
        req.session.user_id = user.id;

        // Remember me
        if (req.body.remember_me) {
          var loginToken = new LoginToken({ username: user.username });
          loginToken.save(function() {
            res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
            res.redirect('/assignments');
          });
        } else {
          res.redirect('/assignments');
        }
      } else {
        req.flash('error', 'Incorrect credentials');
        res.redirect('/sessions/new');
      }
    }); 
  });

  app.del('/sessions', loadUser, function(req, res) {
    if (req.session) {
      LoginToken.remove({ username: req.currentUser.username }, function() {});
      res.clearCookie('logintoken');
      req.session.destroy(function() {});
    }
    res.redirect('/sessions/new');
  });

  app.get('/users/new', function(req, res) {
    res.render('users/new.jade', {
      user: new User(),
      register: true
    });
  });

  app.post('/users', function(req, res) {
    var user = new User(req.body.user);

    function userSaveFailed(err) {
      req.flash('error', 'Account creation failed');
      console.log(err);
      res.render('users/new.jade', {
        user: user,
        register: true
      });
    }

    user.save(function(err) {
      if (err) return userSaveFailed(err);

      req.flash('info', 'Your account has been created');

      req.session.user_id = user.id;
      res.redirect('/');
    });
  });

  app.get('/assignments', loadUser, function(req, res) {
    res.render('assignments/list.jade', {
      currentUser: req.currentUser
    });
  });

  app.get('/assignments/sync', loadUser, function(req, res) {
    function getError(err) {
      console.log(err);
      res.writeHead(500);
      res.end();
    }
    Task.find({ userID: req.currentUser.id }, function(err, tasks) {
      if (err) return getError(err);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tasks));
    });
  });

  app.post('/assignments/sync', loadUser, function(req, res) {
    var t = new Task({
      userID: req.currentUser.id,
      title: req.body.title,
      completed: req.body.completed,
      priority: req.body.priority,
      dueDate: new Date(req.body.dueDate)
    });

    function taskSaveError(err) {
      console.log(err);
      res.writeHead(500);
      res.end();
    }

    t.save(function(err) {
      if (err) return taskSaveError(err);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(t));
    });
  });

  app.put('/assignments/sync/:id', loadUser, function(req, res) {
    function updateFailed(err) {
      console.log(err);
      res.writeHead(500);
      res.end();
    }
    Task.findOne({ userID: req.currentUser.id, _id: req.params.id }, function(err, task) {
      if (err) return updateFailed(err);
      ['title', 'completed', 'priority', 'dueDate'].forEach(function(x) {
        task[x] = req.body[x];
      });
      task.save(function(err) {
        if (err) return updateFailed(err);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(task));
      });
    });
  });

  app.del('/assignments/sync/:id', loadUser, function(req, res) {
    function removeError(err) {
      console.log(err);
      res.writeHead(500);
      res.end();
    }
    Task.remove({ userID: req.currentUser.id, _id: req.params.id }, function(err) {
      if (err) return removeError(err);
      res.end();
    });
  });
}

module.exports = App;
