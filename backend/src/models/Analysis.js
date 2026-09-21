const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  screeningSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScreeningSession',
    required: true
  },
  skillMatch: {
    type: Number,
    required: true
  },
  keywordMatch: {
    type: Number,
    required: true
  },
  experienceMatch: {
    type: Number,
    required: true
  },
  educationMatch: {
    type: Number,
    required: true
  },
  projectMatch: {
    type: Number,
    required: true
  },
  semanticSimilarity: {
    type: Number,
    required: true
  },
  finalScore: {
    type: Number,
    required: true
  },
  matchedSkills: [{
    type: String
  }],
  missingSkills: [{
    type: String
  }],
  pillarPoints: {
    skillPoints: Number,
    keywordPoints: Number,
    experiencePoints: Number,
    educationPoints: Number,
    projectPoints: Number,
    semanticPoints: Number
  },
  status: {
    type: String,
    enum: ['Review', 'Shortlisted', 'Rejected'],
    default: 'Review'
  },
  analyzedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analysis', analysisSchema);
