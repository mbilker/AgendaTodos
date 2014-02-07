module.exports = function() {
  var app = this.app;
  var User = this.models.User;

  app.get('/register', function(req, res) {
    res.render('layout');
  });

  app.post('/register', function(req, res) {
    var u = req.body.user;
    var user = new User({ username: u.username, firstName: u.firstName, lastName: u.lastName, email: u.email, password: u.password });

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
}