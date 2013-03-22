var crypto = require('crypto');

var User, LoginToken, Assignment, Section;

function validatePresenceOf(value) {
  return value && value.length;
}

function validatePrefix(value) {
  return /Mr.|Mrs.|Dr./.test(value);
}

function defineModels(mongoose, cb) {
  var Schema = mongoose.Schema;

  User = new Schema({
    'username': { type: String, validate: [validatePresenceOf, 'a username is required'], index: { unique: true } },
    'email': { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
    'hashed_password': String,
    'salt': String,
    'firstName': String,
    'lastName': String,
    'prefix': { type: String, validate: [validatePrefix, 'a prefix needs to be of the following types'] },
    'type': { type: String, default: 'empty' }
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
    return this.firstname + ' ' + this.lastname;
  });

  User.virtual('teacherName').get(function() {
    return this.prefix + this.lastName;
  });

  User.pre('save', function(next) {
    if (!validatePresenceOf(this.password)) {
      next(new Error('Invalid password'));
    } else {
      next();
    }
  });

  LoginToken = new Schema({
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

  Section = new Schema({
    name: { type: String },
    teacher: { type: String }
  });

  Assignment = new Schema({
    name: { type: String },
    priority: { type: Number },
    completed: { type: Boolean },
    dueDate: { type: Date, default: Date.now }
  });

  mongoose.model('User', User);
  mongoose.model('LoginToken', LoginToken);
  mongoose.model('Section', Section);
  mongoose.model('Assignment', Assignment);

  cb();
}

exports.defineModels = defineModels;
