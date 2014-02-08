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

  app.get('/', loadUser, function(req, res) {
    res.render('layout', {
      currentUser: req.currentUser
    });
  });
}
