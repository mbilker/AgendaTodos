module.exports = function() {
  var app = this.app;
  var loadUser = this.utils.loadUser;

  app.get('/', loadUser, function(req, res) {
    res.render('list.jade', {
    //  currentUser: req.currentUser
    });
  });
}
