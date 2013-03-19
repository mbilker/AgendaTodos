var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  id: Number,
  name: String
});

var SectionSchema = new mongoose.Schema({
  id: Number,
  name: String,
  teacher: String
});

var AssignmentSchema = new mongoose.Schema({
  id: Number,
  name: String,
  priority: Number,
  completed: Boolean,
  dueDate: {
    type: Date,
    default: Date.now
  }
});

var Models = {
  User: mongoose.model('User', UserSchema),
  Section: mongoose.model('Section', SectionSchema),
  Assignment: mongoose.model('Assignment', AssignmentSchema)
}

module.exports = Models;