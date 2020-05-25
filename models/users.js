const mongoose = require('mongoose');

const User = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  bookcase: {
    type: Array
  },
  codeid: {
    type: String
  },
  registerdate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Users', User);