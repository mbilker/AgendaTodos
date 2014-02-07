module.exports = function() {
  var app = this.app;
  var loadUser = this.utils.loadUser;
  var User = this.models.User;
  var LoginToken = this.models.LoginToken;

  app.get('/login', function(req, res) {
    res.render('layout', {
      login: true
    });
  });

<<<<<<< HEAD:src/routes/sessions.js
  app.post('/login', function(req, res) {
=======
  app.post('/sessions', function(req, res) {
    return res.redirect('/');
>>>>>>> 8916cf86b93341f7fca80a23a50fb66db6474c09:src/routes/sessions.js
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
        res.redirect('/login');
      }
    }); 
  });

  app.get('/logout', loadUser, function(req, res) {
    if (req.session) {
      LoginToken.remove({ username: req.currentUser.username }, function() {});
      res.clearCookie('logintoken');
      req.session.destroy(function() {});
    }
    res.redirect('/login');
  });
}
