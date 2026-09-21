/**
 * JavaScript Text Processor & Stopword Cleaner
 */

const stopword = require('stopword');

/**
 * Clean and normalize text by preserving tech terms, lowercasing,
 * removing punctuation, and stripping stopwords.
 */
function cleanText(text = '') {
  if (!text) return '';

  let str = text.toLowerCase();

  // Preserve tech symbols
  str = str.replace(/c\+\+/g, 'cpp')
           .replace(/c\#/g, 'csharp')
           .replace(/\.net/g, 'dotnet')
           .replace(/node\.js/g, 'nodejs')
           .replace(/react\.js/g, 'reactjs')
           .replace(/vue\.js/g, 'vuejs')
           .replace(/scikit-learn/g, 'sklearn');

  // Replace punctuation with space
  str = str.replace(/[^\w\s]/g, ' ');

  // Tokenize
  const rawTokens = str.split(/\s+/).filter(t => t.length > 1 && !/^\d+$/.test(t));

  // Remove English stopwords
  const filteredTokens = stopword.removeStopwords(rawTokens);

  return filteredTokens.join(' ');
}

/**
 * Extract frequent meaningful keywords from text.
 */
function extractKeywords(text = '', topN = 20) {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  const words = cleaned.split(' ');
  const freq = {};

  words.forEach(w => {
    freq[w] = (freq[w] || 0) + 1;
  });

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, topN).map(([word]) => word);
}

module.exports = {
  cleanText,
  extractKeywords
};
