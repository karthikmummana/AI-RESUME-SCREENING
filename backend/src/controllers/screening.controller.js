const ScreeningSession = require('../models/ScreeningSession');
const Candidate = require('../models/Candidate');
const Analysis = require('../models/Analysis');
const { extractTextFromPdf, extractTextFromDocx, extractCandidateInfo } = require('../services/jsResumeParser');
const { calculateFullAnalysis } = require('../services/jsScoringEngine');
const path = require('path');

// 1. POST /api/screening/create
exports.createSession = async (req, res) => {
  try {
    const { companyName, jobTitle, jobDescription, requiredSkills, qualifications, experience } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ success: false, message: 'Company Name is required' });
    }
    if (!jobTitle || !jobTitle.trim()) {
      return res.status(400).json({ success: false, message: 'Job Title is required' });
    }
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ success: false, message: 'Job Description is required' });
    }

    const session = await ScreeningSession.create({
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim(),
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      qualifications: qualifications || '',
      experience: experience || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Screening session initialized',
      session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET /api/screening/:id
exports.getSession = async (req, res) => {
  try {
    const session = await ScreeningSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Screening session not found' });
    }
    const candidatesCount = await Candidate.countDocuments({ screeningSessionId: session._id });

    return res.json({
      success: true,
      session,
      candidatesCount
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. POST /api/screening/:id/resumes
exports.uploadResumes = async (req, res) => {
  try {
    const session = await ScreeningSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const createdCandidates = [];

    for (const file of req.files) {
      const candidate = await Candidate.create({
        screeningSessionId: session._id,
        name: file.originalname.replace(/\.[^/.]+$/, '').replace(/[_|-]/g, ' '),
        resumeFile: {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        },
        status: 'Review'
      });
      createdCandidates.push(candidate);
    }

    session.status = 'uploaded';
    await session.save();

    return res.status(201).json({
      success: true,
      message: `${createdCandidates.length} resumes uploaded successfully`,
      candidates: createdCandidates
    });
  } catch (error) {
    console.error('Error uploading resumes:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. GET /api/screening/:id/resumes
exports.getResumes = async (req, res) => {
  try {
    const candidates = await Candidate.find({ screeningSessionId: req.params.id });
    return res.json({
      success: true,
      count: candidates.length,
      candidates
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. POST /api/screening/:id/analyze (100% Pure JavaScript NLP & Match Engine)
exports.analyzeResumes = async (req, res) => {
  try {
    const session = await ScreeningSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const candidates = await Candidate.find({ screeningSessionId: session._id });
    if (candidates.length === 0) {
      return res.status(400).json({ success: false, message: 'No candidates uploaded for this session' });
    }

    session.status = 'processing';
    await session.save();

    const analysisResults = [];

    for (const candidate of candidates) {
      const filePath = candidate.resumeFile ? candidate.resumeFile.path : '';
      let rawText = candidate.extractedText || '';

      if (filePath && path.extname(filePath).toLowerCase() === '.pdf') {
        rawText = await extractTextFromPdf(filePath);
      } else if (filePath && path.extname(filePath).toLowerCase() === '.docx') {
        rawText = await extractTextFromDocx(filePath);
      }

      const candidateInfo = extractCandidateInfo(
        rawText,
        candidate.resumeFile ? candidate.resumeFile.originalName : candidate.name
      );

      const analysis = calculateFullAnalysis({
        resumeText: rawText,
        jdText: session.jobDescription,
        requiredSkills: session.requiredSkills,
        qualifications: session.qualifications,
        experience: session.experience,
        candidateInfo
      });

      // Update Candidate document with extracted info
      candidate.name = candidateInfo.name || candidate.name;
      candidate.email = candidateInfo.email || candidate.email;
      candidate.phone = candidateInfo.phone || candidate.phone;
      candidate.education = candidateInfo.education || candidate.education;
      candidate.experience = candidateInfo.experience || candidate.experience;
      candidate.projects = candidateInfo.projects || candidate.projects;
      candidate.certifications = candidateInfo.certifications || candidate.certifications;
      candidate.skills = analysis.extractedSkills || [];
      candidate.extractedText = rawText;

      // Auto-derive status based on AI Suitability Score (>=80 Shortlisted, <60 Rejected, 60-79 Review)
      let autoStatus = 'Review';
      if (analysis.finalScore >= 80) {
        autoStatus = 'Shortlisted';
      } else if (analysis.finalScore < 60) {
        autoStatus = 'Rejected';
      }

      candidate.status = autoStatus;
      await candidate.save();

      // Upsert Analysis record
      let analysisRecord = await Analysis.findOne({ candidateId: candidate._id });
      if (!analysisRecord) {
        analysisRecord = new Analysis({
          candidateId: candidate._id,
          screeningSessionId: session._id
        });
      }

      analysisRecord.skillMatch = analysis.skillMatch;
      analysisRecord.keywordMatch = analysis.keywordMatch;
      analysisRecord.experienceMatch = analysis.experienceMatch;
      analysisRecord.educationMatch = analysis.educationMatch;
      analysisRecord.projectMatch = analysis.projectMatch;
      analysisRecord.semanticSimilarity = analysis.semanticSimilarity;
      analysisRecord.finalScore = analysis.finalScore;
      analysisRecord.matchedSkills = analysis.matchedSkills;
      analysisRecord.missingSkills = analysis.missingSkills;
      analysisRecord.pillarPoints = analysis.pillarPoints;
      analysisRecord.status = autoStatus;
      analysisRecord.analyzedAt = new Date();

      await analysisRecord.save();
      analysisResults.push({
        candidate,
        analysis: analysisRecord
      });
    }

    session.status = 'completed';
    await session.save();

    return res.json({
      success: true,
      message: 'AI screening analysis completed for all candidates using JavaScript NLP Engine',
      totalAnalyzed: analysisResults.length,
      session
    });
  } catch (error) {
    console.error('Error during AI analysis:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. GET /api/screening/:id/results
exports.getResults = async (req, res) => {
  try {
    const session = await ScreeningSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const analyses = await Analysis.find({ screeningSessionId: session._id }).populate('candidateId');
    
    // Sort default by finalScore descending
    analyses.sort((a, b) => b.finalScore - a.finalScore);

    const formattedResults = analyses.map((item, index) => {
      let status = item.candidateId.status;
      if (!status || status === 'Review') {
        if (item.finalScore >= 80) status = 'Shortlisted';
        else if (item.finalScore < 60) status = 'Rejected';
        else status = 'Review';
      }

      return {
        rank: index + 1,
        candidateId: item.candidateId._id,
        name: item.candidateId.name,
        email: item.candidateId.email,
        phone: item.candidateId.phone,
        finalScore: item.finalScore,
        skillMatch: item.skillMatch,
        keywordMatch: item.keywordMatch,
        experienceMatch: item.experienceMatch,
        educationMatch: item.educationMatch,
        matchedSkills: item.matchedSkills,
        missingSkills: item.missingSkills,
        matchedSkillsCount: item.matchedSkills.length,
        missingSkillsCount: item.missingSkills.length,
        status: status
      };
    });

    return res.json({
      success: true,
      session: {
        id: session._id,
        companyName: session.companyName,
        jobTitle: session.jobTitle,
        jobDescription: session.jobDescription,
        requiredSkills: session.requiredSkills,
        totalResumes: formattedResults.length
      },
      results: formattedResults
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7. GET /api/screening/:id/ranking
exports.getRanking = async (req, res) => {
  try {
    const session = await ScreeningSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const analyses = await Analysis.find({ screeningSessionId: session._id }).populate('candidateId');
    analyses.sort((a, b) => b.finalScore - a.finalScore);

    const rankings = analyses.map((item, index) => {
      let status = item.candidateId.status;
      if (!status || status === 'Review') {
        if (item.finalScore >= 80) status = 'Shortlisted';
        else if (item.finalScore < 60) status = 'Rejected';
        else status = 'Review';
      }

      return {
        rank: index + 1,
        candidateId: item.candidateId._id,
        name: item.candidateId.name,
        finalScore: item.finalScore,
        skillMatch: item.skillMatch,
        experienceMatch: item.experienceMatch,
        educationMatch: item.educationMatch,
        matchedSkillsCount: item.matchedSkills.length,
        status: status
      };
    });

    return res.json({
      success: true,
      rankings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
