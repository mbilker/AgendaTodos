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
  var User = this.models.User;

  app.get('/register', function(req, res) {
    res.render('layout', {
      loadPage: 'register'
    });
  });

  app.post('/register', function(req, res) {
    var u = req.body.user;
    var user = new User({ username: u.username, firstName: u.firstName, lastName: u.lastName, email: u.email, password: u.password });

    function userSaveFailed(err) {
      req.flash('error', 'Account creation failed');
      res.redirect('/register');
    }

    user.save(function(err) {
      if (err) return userSaveFailed(err);

      req.flash('info', 'Your account has been created');

      req.session.user_id = user.id;
      res.redirect('/');
    });
  });
}
