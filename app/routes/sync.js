module.exports = function() {
  var app = this.app,
      checkForUserJSON = this.utils.checkForUserJSON,
      User = this.models.User,
      Task = this.models.Task;

  function error(err, res) {
    console.log(err);
    res.writeHead(500);
    res.end();
  }

  app.get('/assignments/sync', checkForUserJSON, function(req, res) {
    Task.find({ userID: req.currentUser.id }, function(err, tasks) {
      if (err) return error(err, res);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tasks));
    });
  });

  app.post('/assignments/sync', checkForUserJSON, function(req, res) {
    var task = new Task({
      userID: req.currentUser.id,
      title: req.body.title,
      completed: req.body.completed,
      priority: req.body.priority,
      dueDate: new Date(req.body.dueDate)
    });

    task.save(function(err) {
      if (err) return error(err, res);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(task));
    });
  });

  app.put('/assignments/sync/:id', checkForUserJSON, function(req, res) {
    Task.findOne({ userID: req.currentUser.id, _id: req.params.id }, function(err, task) {
      if (err) return error(err, res);

      ['title', 'completed', 'priority', 'dueDate'].forEach(function(x) {
        task[x] = req.body[x];
      });

      task.save(function(err) {
        if (err) return error(err, res);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(task));
      });
    });
  });

  app.del('/assignments/sync/:id', checkForUserJSON, function(req, res) {
    Task.remove({ userID: req.currentUser.id, _id: req.params.id }, function(err) {
      if (err) return error(err, res);
      
      res.end();
    });
  });
}