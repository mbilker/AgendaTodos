var assert = require('assert');
var mongoose = require('mongoose');
var models = require('../src/models.js');

var Config = require('../runtime.config.json');

mongoose.connect(Config.mongodb);

describe('Models', function() {
  describe('User', function() {
    var user = new models.User();
    it('should throw when values are not set', function(done) {
      user.save(function(err) {
        assert.ifError(!err); // Should fail validation
        done();
      });
    });

    it('should throw when email is invalid', function(done) {
      user.email = 'hello.world.com';
      user.save(function(err) {
        assert.ifError(!err);
        done();
      });
    });

    it('should require a email, username, and password', function(done) {
      user.email = 'hello@world.com';
      user.username = 'hello_world';
      user.password = 'hello_world';
      user.save(function(err, user) {
        assert.ifError(err);
        assert.equal(user.email, 'hello@world.com');
        assert.equal(user.username, 'hello_world');
        assert.equal(user.password, 'hello_world');
        assert.ok(user.hashed_password);
        assert.ok(user.salt);

        user.remove(done);
      });
    });

    it('should return values that we set', function(done) {
      user.email = 'hello@world.com';
      user.username = 'hello_world';
      user.password = 'hello_world';
      user.firstName = 'Hello';
      user.lastName = 'World';
      user.save(function(err, user) {
        assert.ifError(err);
        assert.equal(user.email, 'hello@world.com');
        assert.equal(user.username, 'hello_world');
        assert.equal(user.firstName, 'Hello');
        assert.equal(user.lastName, 'World');
        assert.ok(user.hashed_password);
        assert.ok(user.salt);

        user.remove(done);
      });
    });

    it('should have the full name should consist of the first and last name', function(done) {
      user.email = 'hello@world.com';
      user.username = 'hello_world';
      user.password = 'hello_world';
      user.firstName = 'Hello';
      user.lastName = 'World';
      user.save(function(err, user) {
        assert.ifError(err);
        assert.equal(user.fullName, 'Hello World');
        done();
      });
    });

    before(function(done) {
      models.User.findOne({ email: 'hello@world.com'}, function(err, email) {
        if (err || !email) return done();

        email.remove(done);
      });
    });

    after(function(done) {
      models.User.findOne({ email: 'hello@world.com'}, function(err, email) {
        if (err || !email) return done();

        email.remove(done);
      });
    });
  });

  describe('Task', function() {
    var task = new models.Task();

    it('should save with the values set', function(done) {
      task.userID = 'test_id';
      task.title = 'Example task';
      task.priority = 1;
      task.completed = false;
      task.save(function(err, task) {
        assert.ifError(err);
        assert.equal(task.userID, 'test_id');
        assert.equal(task.title, 'Example task');
        assert.equal(task.priority, 1);
        assert.equal(task.completed, false);

        task.remove(done);
      });
    });
  });
});
