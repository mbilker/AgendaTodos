var path = require('path')
  , express = require('express')
  , app = express()
  , mongoose = require('mongoose')
  , stylus = require('stylus')
  , flash = require('connect-flash')
  , mongoStore = require('connect-mongodb')
  , connectTimeout = require('connect-timeout')
  , models = require('./models')
  , config = require('../config');

var User, LoginToken, Assignment, Section;
var db;

var port = process.env.PORT || 3000;
var base = path.join(__dirname, '..');

var App = {};

App.start = function() {

  app.listen(port, function() {
    console.log('Agenda Book Server ready, port: %s, environment: %s', port, app.settings.env);
  });

  app.configure('development', function(){
    app.set('db-uri', config.default.mongodb);
    app.use(express.errorHandler({ dumpExceptions: true }));
    app.set('view options', {
      pretty: true
    });
  });

  app.configure(function() {
    app.set('views', path.join(base, 'views'));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(connectTimeout({ time: 10000 }));
    app.use(express.session({ store: mongoStore(app.set('db-uri')), secret: '2k3j5ln2n2j' }));
    app.use(express.methodOverride());
    app.use(flash());
    app.use(app.router);
    app.use(stylus.middleware({ debug: true, src: path.join(base, 'stylus'), dest: path.join(base, 'public') }));
    app.use(express.static(path.join(base, 'public')));
  });

  models.defineModels(mongoose, function() {
    app.User = User = mongoose.model('User');
    app.LoginToken = LoginToken = mongoose.model('LoginToken');
    app.Assignment = Assignment = mongoose.model('Assignment');
    app.Section = Section = mongoose.model('Section');
    db = mongoose.connect(app.set('db-uri'));
  });

  function authenticateFromLoginToken(req, res, next) {
    var cookie = JSON.parse(req.cookies.logintoken);

    LoginToken.findOne({ name: cookie.name, series: cookie.series, token: cookie.token }, function(err, token) {
      if (!token) {
        res.redirect('/sessions/new');
        return;
      }

      User.findOne({ name: token.name }, function(err, user) {
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

  app.get('/sessions/new', function(req, res) {
    res.render('sessions/new.jade', {
      user: new User(),
      info: req.flash('info'),
      error: req.flash('error')
    });
  });

  app.post('/sessions', function(req, res) {
    User.findOne({ name: req.body.user.name }, function(err, user) {
      if (user && user.authenticate(req.body.user.password)) {
        req.session.user_id = user.id;

        // Remember me
        if (req.body.remember_me) {
          var loginToken = new LoginToken({ name: user.name });
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
      LoginToken.remove({ name: req.currentUser.name }, function() {});
      res.clearCookie('logintoken');
      req.session.destroy(function() {});
    }
    res.redirect('/sessions/new');
  });

  app.get('/users/new', function(req, res) {
    res.render('users/new.jade', {
      user: new User(),
      register: true,
      info: req.flash('info'),
      error: req.flash('error')
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
        register: true,
        info: req.flash('info'),
        error: req.flash('error')
      });
    }

    user.save(function(err) {
      if (err) return userSaveFailed(err);

      req.flash('info', 'Your account has been created');

      switch (req.params.format) {
        case 'json':
          res.send(user.toObject());
          break;

        default:
          req.session.user_id = user.id;
          console.log(req.session);
          res.redirect('/');
          break;
      }
    });
  });

  app.get('/assignments', loadUser, function(req, res) {
    res.render('layout.jade', {
      currentUser: req.currentUser,
      info: req.flash('info'),
      error: req.flash('error')
    });
  });
  //app.get('/user', routes.getUser);
  //app.del('/user', routes.deleteUser);
}

module.exports = App;
