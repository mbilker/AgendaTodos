module.exports = function() {
  var app = this.app;
  var loadUser = this.utils.loadUser;

  app.get('/', loadUser, function(req, res) {
<<<<<<< HEAD:src/routes/list.js
    res.render('layout', {
      currentUser: req.currentUser
=======
    res.render('list.jade', {
    //  currentUser: req.currentUser
>>>>>>> 8916cf86b93341f7fca80a23a50fb66db6474c09:src/routes/list.js
    });
  });
}
