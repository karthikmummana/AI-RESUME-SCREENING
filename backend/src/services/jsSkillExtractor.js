/**
 * JavaScript Skill Extraction & Taxonomy Engine
 */

const SKILL_TAXONOMY = {
  // Programming Languages
  "Python": ["python", "py"],
  "JavaScript": ["javascript", "js", "es6"],
  "TypeScript": ["typescript", "ts"],
  "Java": ["java"],
  "C++": ["c++", "cpp"],
  "C#": ["c#", "csharp"],
  "R": ["r language", "r programming"],
  "SQL": ["sql", "mysql", "postgresql", "postgres", "sqlite", "pl/sql", "t-sql"],
  "HTML": ["html", "html5"],
  "CSS": ["css", "css3"],

  // AI / Machine Learning / Data Science
  "Machine Learning": ["machine learning", "ml"],
  "Deep Learning": ["deep learning", "dl"],
  "Artificial Intelligence": ["artificial intelligence", "ai"],
  "NLP": ["nlp", "natural language processing"],
  "Computer Vision": ["computer vision", "cv", "opencv"],
  "TensorFlow": ["tensorflow", "tf"],
  "PyTorch": ["pytorch"],
  "Keras": ["keras"],
  "Scikit-learn": ["scikit-learn", "sklearn", "scikit learn"],
  "Pandas": ["pandas"],
  "NumPy": ["numpy"],
  "SciPy": ["scipy"],
  "Matplotlib": ["matplotlib"],
  "Seaborn": ["seaborn"],
  "NLTK": ["nltk"],
  "SpaCy": ["spacy"],
  "Transformers": ["transformers", "huggingface", "bert", "gpt", "llm"],
  "GenAI": ["genai", "generative ai", "llm", "langchain"],

  // Web & Frameworks
  "React": ["react", "react.js", "reactjs"],
  "Node.js": ["node", "node.js", "nodejs", "express", "express.js"],
  "Vue.js": ["vue", "vue.js", "vuejs"],
  "Angular": ["angular", "angularjs"],
  "Django": ["django"],
  "Flask": ["flask"],
  "FastAPI": ["fastapi"],
  "Spring Boot": ["spring boot", "spring"],
  "Tailwind CSS": ["tailwind", "tailwind css", "tailwindcss"],
  "Bootstrap": ["bootstrap"],

  // Databases & Big Data
  "MongoDB": ["mongodb", "mongo"],
  "Redis": ["redis"],
  "Cassandra": ["cassandra"],
  "Hadoop": ["hadoop"],
  "Spark": ["spark", "pyspark"],
  "Snowflake": ["snowflake"],
  "BigQuery": ["bigquery"],

  // Cloud & DevOps
  "AWS": ["aws", "amazon web services", "s3", "ec2", "lambda"],
  "Azure": ["azure", "microsoft azure"],
  "GCP": ["gcp", "google cloud", "google cloud platform"],
  "Docker": ["docker"],
  "Kubernetes": ["kubernetes", "k8s"],
  "Git": ["git", "github", "gitlab", "bitbucket"],
  "CI/CD": ["ci/cd", "jenkins", "github actions"],
  "Linux": ["linux", "ubuntu", "bash", "shell"]
};

// Map normalized aliases to standard skill names
const ALIAS_MAP = new Map();
Object.entries(SKILL_TAXONOMY).forEach(([standardName, aliases]) => {
  ALIAS_MAP.set(standardName.toLowerCase(), standardName);
  aliases.forEach(alias => {
    ALIAS_MAP.set(alias.toLowerCase(), standardName);
  });
});

/**
 * Escape special regex characters in skill alias strings
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract technical skills from raw resume text using taxonomy matching.
 */
function extractSkillsFromText(text = '') {
  const textLower = text.toLowerCase();
  const foundSkills = new Set();

  Object.entries(SKILL_TAXONOMY).forEach(([standardName, aliases]) => {
    for (const alias of aliases) {
      const escaped = escapeRegex(alias);
      const pattern = new RegExp(`(?:^|\\b|_|[^a-zA-Z0-9+])${escaped}(?:$|\\b|_|[^a-zA-Z0-9+])`, 'i');
      if (pattern.test(textLower)) {
        foundSkills.add(standardName);
        break;
      }
    }
  });

  return Array.from(foundSkills).sort();
}

/**
 * Compare candidate skills strictly against user-entered required skills.
 * Never auto-adds hardcoded skills. Returns matchedSkills and missingSkills.
 */
function compareSkills(candidateSkills = [], requiredSkills = [], resumeText = '') {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { matchedSkills: [], missingSkills: [] };
  }

  const textLower = (resumeText || '').toLowerCase();
  const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());

  const matched = [];
  const missing = [];

  for (const req of requiredSkills) {
    const reqClean = (req || '').trim();
    if (!reqClean) continue;

    const reqLower = reqClean.toLowerCase();
    let isMatched = false;

    // 1. Check direct match or alias match against candidate skills
    const resolvedReqName = ALIAS_MAP.get(reqLower) || reqClean;
    const resolvedReqLower = resolvedReqName.toLowerCase();

    isMatched = candidateSkillsLower.some(cand => {
      const resolvedCandName = ALIAS_MAP.get(cand) || cand;
      const resolvedCandLower = resolvedCandName.toLowerCase();
      return (
        cand === reqLower ||
        cand === resolvedReqLower ||
        resolvedCandLower === resolvedReqLower ||
        cand.includes(reqLower) ||
        reqLower.includes(cand)
      );
    });

    // 2. Direct regex search in raw candidate text if not found in extracted skills
    if (!isMatched && textLower) {
      const aliases = SKILL_TAXONOMY[resolvedReqName] || [reqClean];
      for (const alias of aliases) {
        const escaped = escapeRegex(alias);
        const pattern = new RegExp(`(?:^|\\b|_|[^a-zA-Z0-9+])${escaped}(?:$|\\b|_|[^a-zA-Z0-9+])`, 'i');
        if (pattern.test(textLower)) {
          isMatched = true;
          break;
        }
      }
    }

    if (isMatched) {
      matched.push(reqClean);
    } else {
      missing.push(reqClean);
    }
  }

  return { matchedSkills: matched, missingSkills: missing };
}

module.exports = {
  SKILL_TAXONOMY,
  extractSkillsFromText,
  compareSkills
};
