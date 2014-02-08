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
  var checkForUserJSON = this.utils.checkForUserJSON;
  var User = this.models.User;
  var Task = this.models.Task;

  function error(err, res) {
    console.log(err);
    res.send(500, 'Error: [' + err.toString() + ']');
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
