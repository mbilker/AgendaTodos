module.exports = function() {
  var app = this.app;
  var checkForUserJSON = this.utils.checkForUserJSON;
  var User = this.models.User;
  var Task = this.models.Task;

  function error(err, res) {
<<<<<<< HEAD:src/routes/sync.js
    console.log(err);
    res.send(500, 'Error: [' + err.toString() + ']');
=======
    console.log(err.stack);
    res.send(500, 'Error on sync [' + err.toString() + ']');
>>>>>>> 8916cf86b93341f7fca80a23a50fb66db6474c09:src/routes/sync.js
  }

  app.get('/tasks', checkForUserJSON, function(req, res) {
    Task.find({ userID: req.currentUser.id }, function(err, tasks) {
      if (err) return error(err, res);

      res.json(200, tasks);
    });
  });

  app.post('/tasks', checkForUserJSON, function(req, res) {
    var task = new Task({
      userID: req.currentUser.id,
      title: req.body.title,
      completed: req.body.completed,
      priority: req.body.priority,
      dueDate: new Date(req.body.dueDate)
    });

    task.save(function(err) {
      if (err) return error(err, res);

      res.json(200, task);
    });
  });

  app.put('/tasks/:id', checkForUserJSON, function(req, res) {
    Task.findOne({ userID: req.currentUser.id, _id: req.params.id }, function(err, task) {
      if (err) return error(err, res);

      ['title', 'completed', 'priority', 'dueDate'].forEach(function(x) {
        task[x] = req.body[x];
      });

      task.save(function(err) {
        if (err) return error(err, res);

        res.json(200, task);
      });
    });
  });

  app.del('/tasks/:id', checkForUserJSON, function(req, res) {
    Task.remove({ userID: req.currentUser.id, _id: req.params.id }, function(err) {
      if (err) return error(err, res);
      
      res.end();
    });
  });
}
