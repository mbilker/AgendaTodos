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
