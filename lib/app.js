var path = require('path')
  , express = require('express')
  , app = express()
  , mongoose = require('mongoose')
  , mongoStore = require('connect-mongodb')
  , routes = require('./routes')
  , config = require('../config';

var port = process.env.PORT || 3000;

var App = {};

App.start = function() {

  app.listen(port);

  app.configure('development', function(){
    app.set('db-uri', config.default.mongodb);
    app.use(express.errorHandler({ dumpExceptions: true }));
    app.set('view options', {
      pretty: true
    });
  });

  app.configure(function() {
    app.set('views', path.join(__dirname, '..', 'views'));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(connectTimeout({ time: 10000 }));
    app.use(express.session({ store: mongoStore(app.set('db-uri')), secret: '2k3j5ln2n2j' }));
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, '..', 'public')));
  });

  var db = mongoose.connect(app.set('db-uri'));

  function authenticateFromLoginToken(req, res, next) {
    var cookie = JSON.parse(req.cookies.logintoken);

    LoginToken.findOne({ email: cookie.email, series: cookie.series, token: cookie.token }, function(err, token) {
      if (!token) {
        res.redirect('/sessions/new');
        return;
      }

      User.findOne({ email: token.email }, function(err, user) {
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
      locals: {
        user: new User()
      }
    });
  });

  app.get('/assignments', loadUser, function(req, res) {
    
  });
  app.get('/user', routes.getUser);
  app.del('/user', routes.deleteUser);
}

module.exports = App;
