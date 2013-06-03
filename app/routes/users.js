module.exports = function() {
  var app = this.app,
      User = this.models.User;

  app.get('/users/new', function(req, res) {
    res.render('users/new.jade', {
      user: new User(),
      register: true
    });
  });

  app.post('/users', function(req, res) {
    console.log(req.body.user);
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