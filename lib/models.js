var crypto = require('crypto')
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema;

function validatePresenceOf(value) {
  return value && value.length;
}

var User = new Schema({
  'name': {
    type: String,
    validate: [validatePresenceOf, 'a name is required'],
    index: {
      unique: true
    }
  },
  'hashed_password': String,
  'salt': String
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

User.pre('save', function(next) {
  if (!validatePresenceOf(this.password)) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
});

LoginToken = new Schema({
  email: { type: String, index: true },
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
  return JSON.stringify({ email: this.email, token: this.token, series: this.series });
});

var Section = new Schema({
  name: String,
  teacher: String
});

var AssignmentSchema = new Schema({
  name: String,
  priority: Number,
  completed: Boolean,
  dueDate: {
    type: Date,
    default: Date.now
  }
});

var Models = {
  User: mongoose.model('User', User),
  Section: mongoose.model('Section', Section),
  Assignment: mongoose.model('Assignment', Assignment)
}

module.exports = Models;
