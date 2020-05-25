const mongoose = require('mongoose');

const Book = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  author:{
    type: String,
    required: true
  },
  isFinished:{
    type: Boolean,
    required: true
  },
  note:{
    type: String
  },
  score:{
    type: Number
  },
  howManyAdded:{
    type: Number
  }
});

module.exports = mongoose.model('Books', Book);