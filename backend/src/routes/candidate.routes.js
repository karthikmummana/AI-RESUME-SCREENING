const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidate.controller');

// Candidate Profile & Actions
router.get('/:id', candidateController.getCandidateDetails);
router.put('/:id/status', candidateController.updateCandidateStatus);
router.get('/:id/resume', candidateController.getOriginalResume);

module.exports = router;
