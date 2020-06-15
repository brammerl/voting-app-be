const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlenth: 25
  },
  phone: {
    type: String,
    required: true,
    maxlength: 13
  },
  email: {
    type: String,
    required: true,
    maxlength: 25
  },
  communicationMedium: {
    type: String,
    required: true,
    enum: ['phone', 'email']
  },
  imageUrl: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('User', schema);
