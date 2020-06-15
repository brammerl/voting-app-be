const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  imageUrl: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Organization', schema);
