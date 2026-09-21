const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract raw text from a PDF file.
 */
async function extractTextFromPdf(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return (pdfData.text || '').trim();
  } catch (err) {
    console.error(`[jsResumeParser] Error reading PDF file ${filePath}:`, err.message);
    return '';
  }
}

/**
 * Extract raw text from a DOCX file.
 */
async function extractTextFromDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return (result.value || '').trim();
  } catch (err) {
    console.error(`[jsResumeParser] Error reading DOCX file ${filePath}:`, err.message);
    return '';
  }
}

/**
 * Parse candidate contact info, education, experience, projects, and certifications from text.
 */
function extractCandidateInfo(text = '', filename = '') {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Email extraction
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const emails = text.match(emailRegex);
  const email = emails && emails.length > 0 ? emails[0] : 'Not specified';

  // 2. Phone extraction
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
  const phoneMatches = text.match(phoneRegex);
  let phone = 'Not specified';
  if (phoneMatches) {
    const validPhone = phoneMatches.find(p => p.replace(/\D/g, '').length >= 10);
    if (validPhone) phone = validPhone.trim();
  }

  // 3. Name extraction heuristic
  let candidateName = '';
  for (const line of lines.slice(0, 5)) {
    const lowerLine = line.toLowerCase();
    const wordCount = line.split(/\s+/).length;
    if (
      !emailRegex.test(line) &&
      !line.match(/\d{10}/) &&
      wordCount <= 4 &&
      !['resume', 'curriculum', 'cv', 'page', 'email', 'phone', 'contact'].some(h => lowerLine.includes(h))
    ) {
      candidateName = line;
      break;
    }
  }

  if (!candidateName && filename) {
    const cleanFile = path.basename(filename)
      .replace(/\.(pdf|docx)$/i, '')
      .replace(/[_|-]/g, ' ');
    candidateName = cleanFile.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  if (!candidateName) {
    candidateName = 'Candidate';
  }

  // 4. Education section extraction
  const eduKeywords = ['b.tech', 'b.e', 'b.s', 'bachelor', 'm.tech', 'm.s', 'master', 'mca', 'bca', 'ph.d', 'degree', 'university', 'college', 'institute'];
  const eduMatches = lines.filter(line => eduKeywords.some(kw => line.toLowerCase().includes(kw)));
  const educationStr = eduMatches.length > 0
    ? eduMatches.slice(0, 3).join(' | ')
    : 'Education details extracted from resume';

  // 5. Work Experience & Years
  let expYears = 0;
  const yearMatches = [...text.matchAll(/(\d+)\+?\s*(?:years?|yrs?)/gi)];
  if (yearMatches.length > 0) {
    const parsedYears = yearMatches.map(m => parseInt(m[1], 10)).filter(y => y < 40);
    if (parsedYears.length > 0) expYears = Math.max(...parsedYears, 0);
  }

  const expSnippets = [];
  let inExp = false;
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (['experience', 'work history', 'employment', 'internship'].some(h => lower.includes(h))) {
      inExp = true;
      continue;
    } else if (['education', 'projects', 'skills', 'certifications'].some(h => lower.includes(h))) {
      inExp = false;
    }
    if (inExp && line.length > 5) {
      expSnippets.push(line);
    }
  }
  const experienceStr = expSnippets.length > 0
    ? expSnippets.slice(0, 4).join(' | ')
    : `${expYears} Years Experience`;

  // 6. Projects section
  const projSnippets = [];
  let inProj = false;
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (['projects', 'academic projects', 'key projects'].some(h => lower.includes(h))) {
      inProj = true;
      continue;
    } else if (['education', 'experience', 'skills', 'certifications'].some(h => lower.includes(h))) {
      inProj = false;
    }
    if (inProj && line.length > 5) {
      projSnippets.push(line);
    }
  }
  const projectsStr = projSnippets.length > 0
    ? projSnippets.slice(0, 3).join(' | ')
    : 'Key relevant technical projects';

  // 7. Certifications
  const certKeywords = ['certified', 'certification', 'aws', 'coursera', 'udemy', 'certificate'];
  const certSnippets = lines.filter(line => certKeywords.some(ck => line.toLowerCase().includes(ck)));
  const certStr = certSnippets.length > 0
    ? certSnippets.slice(0, 2).join(' | ')
    : 'Technical certifications';

  return {
    name: candidateName,
    email,
    phone,
    education: educationStr,
    experience: experienceStr,
    experienceYears: expYears,
    projects: projectsStr,
    certifications: certStr
  };
}

module.exports = {
  extractTextFromPdf,
  extractTextFromDocx,
  extractCandidateInfo
};
