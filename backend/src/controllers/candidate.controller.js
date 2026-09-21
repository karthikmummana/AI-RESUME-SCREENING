const Candidate = require('../models/Candidate');
const Analysis = require('../models/Analysis');
const ScreeningSession = require('../models/ScreeningSession');
const path = require('path');
const fs = require('fs');

// 1. GET /api/candidates/:id
exports.getCandidateDetails = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const analysis = await Analysis.findOne({ candidateId: candidate._id });
    const session = await ScreeningSession.findById(candidate.screeningSessionId);

    if (analysis && (!candidate.status || candidate.status === 'Review')) {
      if (analysis.finalScore >= 80) {
        candidate.status = 'Shortlisted';
        analysis.status = 'Shortlisted';
      } else if (analysis.finalScore < 60) {
        candidate.status = 'Rejected';
        analysis.status = 'Rejected';
      }
    }

    return res.json({
      success: true,
      candidate,
      analysis,
      session: session ? {
        id: session._id,
        companyName: session.companyName,
        jobTitle: session.jobTitle,
        requiredSkills: session.requiredSkills
      } : null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. PUT /api/candidates/:id/status
exports.updateCandidateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Review', 'Shortlisted', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be Review, Shortlisted, or Rejected.' });
    }

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    candidate.status = status;
    await candidate.save();

    await Analysis.updateOne(
      { candidateId: candidate._id },
      { status: status }
    );

    return res.json({
      success: true,
      message: 'Candidate status updated successfully.',
      status: candidate.status,
      candidateId: candidate._id
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET /api/candidates/:id/resume
exports.getOriginalResume = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate || !candidate.resumeFile || !candidate.resumeFile.path) {
      return res.status(404).json({ success: false, message: 'Resume file not found' });
    }

    const filePath = candidate.resumeFile.path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume file missing on disk' });
    }

    res.setHeader('Content-Type', candidate.resumeFile.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${candidate.resumeFile.originalName}"`);
    return res.sendFile(path.resolve(filePath));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
