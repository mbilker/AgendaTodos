var crypto = require('crypto');

var User, LoginToken, Assignment, Section;

function validatePresenceOf(value) {
  return value && value.length;
}

function defineModels(mongoose, cb) {
  var Schema = mongoose.Schema;

  User = new Schema({
    'name': { type: String, validate: [validatePresenceOf, 'a name is required'], index: { unique: true } },
    'email': { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
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
    console.log(plainText, this.hashed_password);
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
    name: { type: String, index: true },
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
    name: String,
    teacher: String
  });

  Assignment = new Schema({
    name: String,
    priority: Number,
    completed: Boolean,
    dueDate: {
      type: Date,
      default: Date.now
    }
  });

  mongoose.model('User', User);
  mongoose.model('LoginToken', LoginToken);
  mongoose.model('Section', Section);
  mongoose.model('Assignment', Assignment);

  cb();
}

exports.defineModels = defineModels;
