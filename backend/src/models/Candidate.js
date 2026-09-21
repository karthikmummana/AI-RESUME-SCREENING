const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  screeningSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScreeningSession',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    default: 'Not specified'
  },
  phone: {
    type: String,
    default: 'Not specified'
  },
  education: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  projects: {
    type: String,
    default: ''
  },
  certifications: {
    type: String,
    default: ''
  },
  resumeFile: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  },
  extractedText: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Review', 'Shortlisted', 'Rejected'],
    default: 'Review'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Candidate', candidateSchema);
