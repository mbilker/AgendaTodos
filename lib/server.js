var path = require('path')
  , express = require('express')
  , app = express()
  , mongoose = require('mongoose')
  , mongoStore = require('connect-mongodb')
  , routes = require('./routes')
  , config = require('../config';

var port = process.env.PORT || 3000;

var Server = {};

Server.start = function() {

  app.listen(port);

  app.configure(function() {
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieDecoder());
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, '..', 'public')));
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
    app.set('db-uri', config.default.mongodb);
  });

  var db = mongoose.connect(app.set('db-uri'));

  function mongoStoreConnectionArgs() {
    return { dbname: db.db.databaseName,
             host: db.db.serverConfig.host,
             port: db.db.serverConfig.port,
             username: db.uri.username,
             password: db.uri.password };
  }

  app.use(express.session({
    store: mongoStore(mongoStoreConnectionArgs())
  }));

  app.post('/user', routes.addUser);
  app.get('/user/:id', routes.getUser);
  app.delete('/user/:id', routes.deleteUser);
}

module.exports = Server;
