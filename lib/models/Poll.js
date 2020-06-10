const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 25
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  options: [String]
});

module.exports = mongoose.model('Poll', schema);
