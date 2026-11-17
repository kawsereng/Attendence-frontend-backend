const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
    
  },

  records: [
{
      attendance: {
        type: Boolean,
        required: true
      },

      homeWork: {
        type: Boolean,
        required: true
      },

      date: {
        type: Date,
        required: true
      }
    }
  ]

}, 
);

module.exports = mongoose.model('Student', studentSchema);