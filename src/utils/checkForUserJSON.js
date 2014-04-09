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

var models = require('../models'),
    User = models.User,
    LoginToken = models.LoginToken;

function sendNotAuthenticated(res) {
  res.json(403, { err: 'Not authenticated' });
}

module.exports = function checkForUserJSON(req, res, next) {
  if (req.session.user_id) {
    User.findById(req.session.user_id, function(err, user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        sendNotAuthenticated(res);
      }
    });
  } else if (req.cookies.logintoken) {
    var c = JSON.parse(req.cookies.logintoken);
    LoginToken.findOne({ username: c.username, series: c.series, token: c.token }, function(err, token) {
      if (!token) return sendNotAuthenticated(res);
      
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
          sendNotAuthenticated(res);
        }
      });
    });
  } else {
    sendNotAuthenticated(res);
  }
}
