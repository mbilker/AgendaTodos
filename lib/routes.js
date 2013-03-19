var util = require('util')
  , mongoose = require('mongoose')
  , models = require('./models');

var Routes = {};

function findUser(id, cb) {
  if (id == null) {
    cb('id');
    return;
  }
  models.User.find({ id: id }, function(err, user) {
    if (err) {
      console.log(err);
      cb(err);
    } else {
      cb(null, user);
    }
  });
}

Routes.getUser = function(req, res) {
  console.log(req.params);
  findUser(req.params.id, function(err, user) {
    if (err) {
      console.log(err);
      res.send(err);
    } else if (user[0]) {
      console.log(user[0]);
      res.send(user[0]);
    } else {
      res.send({});
    }
    res.end();
  });
}

Routes.addUser = function(req, res) {
  console.log(req.body);
  findUser(req.body.id, function(err, user) {
    if (err) {
      console.log(err);
      res.send(err);
      res.end();
      return;
    } else if (user.length != 0) {
      console.log(user);
      res.send(user[0]);
      res.end();
      return;
    }
    var nuser = new models.User({ id: req.body.id, name: req.body.name });
    nuser.save(function(err, nuser) {
      if (err) {
        res.send({ err: err });
      } else {
        res.send(nuser);
      }
      res.end();
    });
    res.end(util.inspect(nuser));
  });
}

Routes.deleteUser = function(req, res) {
  console.log(req.body);
  findUser(req.body.id);
  res.end();
}

module.exports = Routes;
