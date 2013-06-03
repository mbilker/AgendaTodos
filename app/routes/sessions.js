module.exports = function() {
  var app = this.app,
      loadUser = this.utils.loadUser,
      User = this.models.User,
      LoginToken = this.models.LoginToken;

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
            res.redirect('/');
          });
        } else {
          res.redirect('/');
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
}