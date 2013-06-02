var assert = require('assert');

var Config = require('../runtime.config.json');

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
