 var path = require('path')
  , express = require('express')
  , app = express()
  , server = require('http').Server(app)
  , mongoose = require('mongoose')
  , stylus = require('stylus')
  , flash = require('connect-flash')
  , RedisStore = require('connect-redis')
  , connectTimeout = require('connect-timeout')
  , systemd = require('systemd')
  , autoquit = require('autoquit')
  , models = require('./models')
  , Config = require('./config');

var User, LoginToken, Assignment, Section;

var base = path.join(__dirname, '..');

var isSystemd = process.env.LISTEN_PID > 0;
  
var PORT = process.env.PORT || 3000;
var PORT = isSystemd ? 'systemd' : PORT;

var App = {};

App.start = function() {

  app.configure('development', function(){
    app.use(express.logger('dev'));
    app.use(express.errorHandler({ dumpExceptions: true }));
    app.locals.pretty = true;
  });

  app.configure(function() {
    app.set('db-uri', Config.mongodb);
    app.set('views', path.join(base, 'views'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(connectTimeout({ time: 10000 }));
    app.use(express.session({ store: new RedisStore(), secret: '3jsjd8f23kj' }));
    app.use(express.methodOverride());
    app.use(flash());
    app.use(function(req, res, next) {
      res.locals.info = req.flash('info');
      res.locals.error = req.flash('error');
      next();
    });
    app.use(app.router);
    app.use(stylus.middleware({ debug: true, src: path.join(base, 'stylus'), dest: path.join(base, 'public') }));
    app.use(express.static(path.join(base, 'public')));
  });

  mongoose.connect(app.set('db-uri'));

  models.defineModels(mongoose, function() {
    app.User = User = mongoose.model('User');
    app.LoginToken = LoginToken = mongoose.model('LoginToken');
    app.Assignment = Assignment = mongoose.model('Assignment');
    app.Section = Section = mongoose.model('Section');

    if (isSystemd) server.autoQuit({ timeout: 3600 });
    server.listen(PORT);
    console.log('Agenda Book Server ready, port: %s, environment: %s', PORT, app.settings.env);
  });

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
        //console.log('Incorrect credentials');
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

  app.post('/users.:format?', function(req, res) {
    var user = new User(req.body.user);
    console.log(req.body.user);

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

      var format = req.params.format || '';

      switch (format) {
        case 'json':
          res.send(user.toObject());
          break;

        default:
          req.session.user_id = user.id;
          res.redirect('/');
          break;
      }
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
    Assignment.find({ userID: req.currentUser.id }, function(err, assignments) {
      if (err) return getError(err);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(assignments));
    });
  });

  app.post('/assignments/sync', loadUser, function(req, res) {
    console.log('Adding assignment');
    console.log(req.body);
    var assignment = new Assignment({
      userID: req.currentUser.id,
      title: req.body.title,
      completed: req.body.completed,
      priority: req.body.priority,
      dueDate: new Date(req.body.dueDate)
    });

    function assignmentSaveError(err) {
      res.writeHead(500);
      res.end();
    }

    assignment.save(function(err) {
      if (err) return assignmentSaveError(err);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(assignment));
    });
  });

  app.put('/assignments/sync/:id', loadUser, function(req, res) {
    console.log('Updating assignment');
    function updateFailed(err) {
      console.log(err);
      res.writeHead(500);
      res.end();
    }
    Assignment.findOne({ userID: req.currentUser.id, _id: req.params.id }, function(err, assignment) {
      if (err) return updateFailed(err);
      for (var x in req.body) {
        //console.log(x, req.body[x], tmp[x], req.body[x].toString() === assignment[x].toString());
        assignment[x] = req.body[x];
      }
      assignment.save(function(err) {
        if (err) return updateFailed(err);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(assignment));
      });
    });
  });

  app.del('/assignments/sync/:id', loadUser, function(req, res) {
    console.log('Deleting assignment');
    function removeError(err) {
      console.log(err);
      res.writeHead(500);
      res.end();
    }
    Assignment.remove({ userID: req.currentUser.id, _id: req.params.id }, function(err) {
      if (err) return removeError(err);
      res.end();
    });
  });
}

module.exports = App;
