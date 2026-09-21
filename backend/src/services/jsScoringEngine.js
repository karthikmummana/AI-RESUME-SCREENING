/**
 * JavaScript 6-Pillar Composite ATS & Suitability Scoring Engine
 */

const { extractSkillsFromText, compareSkills } = require('./jsSkillExtractor');
const { calculateTfidfCosineSimilarity, calculateKeywordMatchRatio } = require('./jsMatcher');

/**
 * Evaluate experience alignment score (0.0 to 1.0).
 */
function evaluateExperienceScore(candidateExpStr = '', candidateExpYears = 0, reqExpStr = '') {
  if (!reqExpStr || ['none', 'any', 'n/a', '0', 'fresh', 'fresher'].includes(reqExpStr.trim().toLowerCase())) {
    return 1.0;
  }

  const match = reqExpStr.match(/(\d+)/);
  const reqYears = match ? parseInt(match[1], 10) : 0;

  if (reqYears === 0) return 1.0;

  if (candidateExpYears >= reqYears) {
    return 1.0;
  } else if (candidateExpYears > 0) {
    return Math.min(candidateExpYears / reqYears, 1.0);
  }

  const lowerCandExp = (candidateExpStr || '').toLowerCase();
  if (['year', 'developer', 'engineer', 'lead', 'senior', 'experience'].some(k => lowerCandExp.includes(k))) {
    return 0.75;
  }
  return 0.2;
}

/**
 * Evaluate education/qualification score (0.0 to 1.0).
 */
function evaluateEducationScore(candidateEduStr = '', reqQualStr = '') {
  if (!reqQualStr || ['none', 'any', 'n/a'].includes(reqQualStr.trim().toLowerCase())) {
    return 1.0;
  }

  const reqTerms = reqQualStr.split(/[/,|+]/).map(t => t.trim().toLowerCase()).filter(t => t.length > 1);
  const candEduLower = (candidateEduStr || '').toLowerCase();

  if (!candEduLower) return 0.3;

  for (const term of reqTerms) {
    if (candEduLower.includes(term)) {
      return 1.0;
    }
    // Common degree equivalencies
    if (
      ['b.tech', 'b.e', 'bca', 'b.s', 'bachelor'].includes(term) &&
      ['b.tech', 'b.e', 'bca', 'b.s', 'bachelor', 'master', 'm.tech', 'mca'].some(b => candEduLower.includes(b))
    ) {
      return 1.0;
    }
    if (
      ['m.tech', 'mca', 'm.s', 'master'].includes(term) &&
      ['m.tech', 'mca', 'm.s', 'master', 'ph.d'].some(m => candEduLower.includes(m))
    ) {
      return 1.0;
    }
  }

  return 0.4;
}

/**
 * Calculate full 6-Pillar ATS / AI Suitability Score and analysis breakdown.
 * Formula:
 *   Final Score = (Skill Match * 0.40) + (Keyword Match * 0.20) + (Experience Match * 0.15)
 *                 + (Education Match * 0.10) + (Project Match * 0.05) + (Semantic Similarity * 0.10)
 */
function calculateFullAnalysis({
  resumeText = '',
  jdText = '',
  requiredSkills = [],
  qualifications = '',
  experience = '',
  candidateInfo = {}
}) {
  // 1. Skill Match (40% Weight)
  const extractedCandidateSkills = extractSkillsFromText(resumeText);
  const cleanRequired = (requiredSkills || []).map(s => s.trim()).filter(Boolean);

  const { matchedSkills, missingSkills } = compareSkills(extractedCandidateSkills, cleanRequired, resumeText);

  let skillRatio = 1.0;
  if (cleanRequired.length > 0) {
    skillRatio = matchedSkills.length / cleanRequired.length;
  } else {
    skillRatio = extractedCandidateSkills.length > 0 ? 1.0 : 0.5;
  }

  const skillPct = Math.round(skillRatio * 100.0);
  const skillPoints = Number((skillRatio * 40.0).toFixed(2));

  // 2. Keyword Match (20% Weight)
  const kwRatio = calculateKeywordMatchRatio(resumeText, jdText);
  const kwPct = Math.round(kwRatio * 100.0);
  const keywordPoints = Number((kwRatio * 20.0).toFixed(2));

  // 3. Experience Match (15% Weight)
  const expRatio = evaluateExperienceScore(
    candidateInfo.experience || '',
    candidateInfo.experienceYears || 0,
    experience
  );
  const expPct = Math.round(expRatio * 100.0);
  const experiencePoints = Number((expRatio * 15.0).toFixed(2));

  // 4. Education Match (10% Weight)
  const eduRatio = evaluateEducationScore(
    candidateInfo.education || '',
    qualifications
  );
  const eduPct = Math.round(eduRatio * 100.0);
  const educationPoints = Number((eduRatio * 10.0).toFixed(2));

  // 5. Project Relevance Match (5% Weight)
  const projRatio = calculateTfidfCosineSimilarity(candidateInfo.projects || '', jdText);
  const projPct = Math.round(projRatio * 100.0);
  const projectPoints = Number((projRatio * 5.0).toFixed(2));

  // 6. Semantic Similarity (10% Weight)
  const semRatio = calculateTfidfCosineSimilarity(resumeText, jdText);
  const semPct = Math.round(semRatio * 100.0);
  const semanticPoints = Number((semRatio * 10.0).toFixed(2));

  // Final Composite Score (0 - 100)
  const calculatedSum = skillPoints + keywordPoints + experiencePoints + educationPoints + projectPoints + semanticPoints;
  const finalScore = Math.min(Math.max(Math.round(calculatedSum), 0), 100);

  return {
    finalScore,
    skillMatch: skillPct,
    keywordMatch: kwPct,
    experienceMatch: expPct,
    educationMatch: eduPct,
    projectMatch: projPct,
    semanticSimilarity: semPct,
    matchedSkills,
    missingSkills,
    extractedSkills: extractedCandidateSkills,
    pillarPoints: {
      skillPoints,
      keywordPoints,
      experiencePoints,
      educationPoints,
      projectPoints,
      semanticPoints
    }
  };
}

module.exports = {
  evaluateExperienceScore,
  evaluateEducationScore,
  calculateFullAnalysis
};
