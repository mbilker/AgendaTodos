module.exports = function(models) {
  function sendNotAuthenticated(req, res) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ err: 'Not authenticated' }));
  }

  return (function checkForUserJSON(req, res, next) {
    if (req.session.user_id) {
      User.findById(req.session.user_id, function(err, user) {
        if (user) {
          req.currentUser = user;
          next();
        } else {
          sendNotAuthenticated(req, res);
        }
      });
    } else if (req.cookies.logintoken) {
      var c = JSON.parse(req.cookies.logintoken);
      LoginToken.findOne({ username: c.username, series: c.series, token: c.token }, function(err, token) {
        if (!token) sendNotAuthenticated(req, res);
      });
    } else {
      sendNotAuthenticated(req, res);
    }
  });
}
