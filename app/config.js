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
  { opt: 'mongodb', desc: 'mongodb uri' }
];

for (var i = 0, l = required.length; i < l; i++) {
  if (!Config[required[i].opt]) {
    console.error(required[i].desc, 'is required, but not defined');
    process.exit(-1);
  }
}

module.exports = Config;
