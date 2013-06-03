var fs = require('fs');

var Config;
if (process.env.NODE_ENV == 'production') {
  Config = {
    mongodb: process.env.MONGODB
  }
} else {
  Config = require('../dev.config.json');
}

var required = [
  ['mongodb', 'mongodb uri']
];

for (var i = 0, l = required.length; i < l; i++) {
  if (!Config[required[i][0]]) {
    console.error(required[i][1], 'is required, but not defined');
    process.exit(-1);
  }
}

module.exports = Config;
