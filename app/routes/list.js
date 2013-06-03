module.exports = function() {
  var app = this.app,
      loadUser = this.utils.loadUser;

  app.get('/', loadUser, function(req, res) {
    res.render('list.jade', {
      currentUser: req.currentUser
    });
  });
}