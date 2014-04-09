// This file is part of Agenda Todos.

// Agenda Todos is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Agenda Todos is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Agenda Todos.  If not, see <http://www.gnu.org/licenses/>.

module.exports = function() {
  var app = this.app;
  var loadUser = this.utils.loadUser;
  var User = this.models.User;
  var LoginToken = this.models.LoginToken;

  app.get('/login', function(req, res) {
    res.render('layout', {
      loadPage: 'login'
    });
  });

  app.post('/login', function(req, res) {
    if (!req.body || !req.body.user || !req.body.user.username) {
      return res.redirect('/login');
    }

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
