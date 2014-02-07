var models = require('../models'),
    User = models.User,
    LoginToken = models.LoginToken;

function sendNotAuthenticated(res) {
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ err: 'Not authenticated' }));
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