const express = require('express');
const router = express.Router();
const screeningController = require('../controllers/screening.controller');
const { upload } = require('../utils/fileParser');

// Screening Session Endpoints
router.post('/create', screeningController.createSession);
router.get('/:id', screeningController.getSession);

// Resume Upload & Retrieval
router.post('/:id/resumes', upload.array('resumes', 20), screeningController.uploadResumes);
router.get('/:id/resumes', screeningController.getResumes);

// Analysis & Results
router.post('/:id/analyze', screeningController.analyzeResumes);
router.get('/:id/results', screeningController.getResults);
router.get('/:id/ranking', screeningController.getRanking);

module.exports = router;
