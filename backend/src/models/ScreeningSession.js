const mongoose = require('mongoose');

const screeningSessionSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  qualifications: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'uploaded', 'processing', 'completed'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScreeningSession', screeningSessionSchema);
