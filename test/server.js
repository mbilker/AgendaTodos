var assert = require('assert');
var request = require('supertest')
var app = require('../src/index.js');

describe('Server', function() {
  before(function() {
    app.init();
  });

  describe('API', function() {
    it('should expect 302 redirect when unauthenticated', function(done) {
      request(app.app).get('/').expect(302).end(function(err, res) {
        assert.ifError(err);
        done();
      });
    });

    it('should 403 Forbidden on GET /tasks API request', function(done) {
      request(app.app).get('/tasks').expect(403).end(function(err, res) {
        assert.ifError(err);
        done();
      });
    });

    it('should 403 Forbidden on PUT /tasks/:id API request', function(done) {
      request(app.app).put('/tasks/test_task').expect(403).end(function(err, res) {
        assert.ifError(err);
        done();
      });
    });

    it('should 403 Forbidden on DEL /tasks/:id API request', function(done) {
      request(app.app).del('/tasks/test_task').expect(403).end(function(err, res) {
        assert.ifError(err);
        done();
      });
    });

    it('should 403 Forbidden on POST /tasks API request', function(done) {
      request(app.app).post('/tasks').expect(403).end(function(err, res) {
        assert.ifError(err);
        done();
      });
    });
  });

  describe('Sessions', function() {
    it('should render login page on /login', function(done) {
      request(app.app).get('/login').expect(200).end(function(err, res) {
        assert.ifError(err);
        done();
      });
    });

    it('should redirect on /logout even when not logged in', function(done) {
      request(app.app).get('/logout').expect(302).end(function(err, res) {
        assert.ifError(err);
        done();
      });
    });

    it('should redirect on invalid POST data to POST /login', function(done) {
      request(app.app).post('/login').expect(302).end(function(err, res) {
        assert.ifError(err);
        done();
      });
    });
  });
});
