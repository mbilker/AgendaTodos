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

var crypto = require('crypto');
var mongoose = require('mongoose');

function validatePresenceOf(value) {
  return value && value.length;
}

function validatePrefix(value) {
  return /Mr.|Mrs.|Dr./.test(value);
}

var Schema = mongoose.Schema;

var User = new Schema({
  'username': { type: String, validate: [validatePresenceOf, 'a username is required'], index: { unique: true } },
  'email': { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
  'hashed_password': String,
  'salt': String,
  'firstName': String,
  'lastName': String,
});

User.virtual('id').get(function() {
  return this._id.toHexString();
});

User.virtual('password').set(function(password) {
  this._password = password;
  this.salt = this.makeSalt();
  this.hashed_password = this.encryptPassword(password);
}).get(function() {
  return this._password;
});

User.method('authenticate', function(plainText) {
  return this.encryptPassword(plainText) === this.hashed_password;
});
  
User.method('makeSalt', function() {
  return Math.round((new Date().valueOf() * Math.random())) + '';
});

User.method('encryptPassword', function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
});

User.virtual('fullName').get(function() {
  return this.firstName + ' ' + this.lastName;
});

User.virtual('teacherName').get(function() {
  return this.prefix + ' ' + this.lastName;
});

User.pre('save', function(next) {
  if (!validatePresenceOf(this.password)) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
});

var LoginToken = new Schema({
  username: { type: String, index: true },
  series: { type: String, index: true },
  token: { type: String, index: true }
});

LoginToken.method('randomToken', function() {
  return Math.round((new Date().valueOf() * Math.random())) + '';
});

LoginToken.pre('save', function(next) {
  // Automatically create the tokens
  this.token = this.randomToken();

  if (this.isNew)
    this.series = this.randomToken();

  next();
});

LoginToken.virtual('id').get(function() {
  return this._id.toHexString();
});

LoginToken.virtual('cookieValue').get(function() {
  return JSON.stringify({ name: this.name, token: this.token, series: this.series });
});

var Section = new Schema({
  name: { type: String },
  teacher: { type: String }
});

var Task = new Schema({
  'userID': String,
  'title': String,
  'priority': Number,
  'completed': Boolean,
  'dueDate': { type: Date, default: Date.now },
  'category': String
});

mongoose.model('User', User);
mongoose.model('LoginToken', LoginToken);
mongoose.model('Section', Section);
mongoose.model('Task', Task);

module.exports = {
  User: mongoose.model('User'),
  LoginToken: mongoose.model('LoginToken'),
  Section: mongoose.model('Section'),
  Task: mongoose.model('Task')
}
