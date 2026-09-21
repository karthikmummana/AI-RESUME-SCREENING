/**
 * JavaScript TF-IDF Vectorizer & Cosine Similarity Matcher
 */

const { cleanText } = require('./jsTextProcessor');

/**
 * Extract unigrams and bigrams from cleaned text token array.
 */
function getNGrams(cleanedText) {
  if (!cleanedText) return [];
  const tokens = cleanedText.split(' ').filter(Boolean);
  const nGrams = [...tokens];

  for (let i = 0; i < tokens.length - 1; i++) {
    nGrams.push(`${tokens[i]}_${tokens[i + 1]}`);
  }
  return nGrams;
}

/**
 * Compute term frequencies for an n-gram list.
 */
function computeTF(nGrams) {
  const tf = {};
  const total = nGrams.length;
  if (total === 0) return tf;

  nGrams.forEach(gram => {
    tf[gram] = (tf[gram] || 0) + 1;
  });

  Object.keys(tf).forEach(gram => {
    tf[gram] = tf[gram] / total;
  });

  return tf;
}

/**
 * Calculate Cosine Similarity using TF-IDF vectorization between resume text and job description text.
 * Returns float from 0.0 to 1.0.
 */
function calculateTfidfCosineSimilarity(resumeText = '', jdText = '') {
  const cleanResume = cleanText(resumeText);
  const cleanJd = cleanText(jdText);

  if (!cleanResume || !cleanJd) return 0.0;

  const resumeGrams = getNGrams(cleanResume);
  const jdGrams = getNGrams(cleanJd);

  if (resumeGrams.length === 0 || jdGrams.length === 0) return 0.0;

  // Build combined vocabulary
  const vocabSet = new Set([...resumeGrams, ...jdGrams]);
  const vocabulary = Array.from(vocabSet);

  const tfJd = computeTF(jdGrams);
  const tfResume = computeTF(resumeGrams);

  // Compute document frequencies & IDF
  const docCount = 2;
  const idf = {};

  vocabulary.forEach(term => {
    let count = 0;
    if (tfJd[term]) count++;
    if (tfResume[term]) count++;
    // Add smoothing +1
    idf[term] = Math.log((1 + docCount) / (1 + count)) + 1;
  });

  // Calculate TF-IDF vectors
  let dotProduct = 0;
  let magJdSq = 0;
  let magResumeSq = 0;

  vocabulary.forEach(term => {
    const valJd = (tfJd[term] || 0) * idf[term];
    const valResume = (tfResume[term] || 0) * idf[term];

    dotProduct += valJd * valResume;
    magJdSq += valJd * valJd;
    magResumeSq += valResume * valResume;
  });

  const magJd = Math.sqrt(magJdSq);
  const magResume = Math.sqrt(magResumeSq);

  if (magJd === 0 || magResume === 0) return 0.0;

  const similarity = dotProduct / (magJd * magResume);
  return parseFloat(Math.min(Math.max(similarity, 0.0), 1.0).toFixed(4));
}

/**
 * Calculate keyword match ratio between resume and JD.
 */
function calculateKeywordMatchRatio(resumeText = '', jdText = '') {
  const cleanR = cleanText(resumeText);
  const cleanJ = cleanText(jdText);

  if (!cleanR || !cleanJ) return 0.0;

  const jdWords = new Set(cleanJ.split(' ').filter(Boolean));
  if (jdWords.size === 0) return 0.0;

  const resumeWords = new Set(cleanR.split(' ').filter(Boolean));

  let matchedCount = 0;
  jdWords.forEach(word => {
    if (resumeWords.has(word)) matchedCount++;
  });

  return parseFloat((matchedCount / jdWords.size).toFixed(4));
}

module.exports = {
  calculateTfidfCosineSimilarity,
  calculateKeywordMatchRatio
};
