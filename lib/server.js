var path = require('path')
  , express = require('express')
  , app = express()
  , routes = require('./routes');

var port = process.env.PORT || 3000;

var Server = {};

Server.start = function() {
  app.listen(port);

  app.configure(function() {
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, '..', 'public')));
    app.use(function(req, res, next) {
      next();
    });
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
  });

  app.post('/user', routes.addUser);
  app.get('/user/:id', routes.getUser);
  app.delete('/user/:id', routes.deleteUser);
}

module.exports = Server;
