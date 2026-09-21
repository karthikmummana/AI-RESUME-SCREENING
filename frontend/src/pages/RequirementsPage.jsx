import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Plus, X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';
import StepProgressBar from '../components/StepProgressBar';

export default function RequirementsPage() {
  const navigate = useNavigate();
  const {
    requiredSkills,
    setRequiredSkills,
    addSkill,
    removeSkill,
    qualifications,
    setQualifications,
    experience,
    setExperience,
    jobTitle,
    jobDescription
  } = useScreening();

  const [newSkillInput, setNewSkillInput] = useState('');

  const handleAutoSuggest = () => {
    const titleLower = (jobTitle || '').toLowerCase();
    const jdText = (jobDescription || '').toLowerCase();
    const textToSearch = `${titleLower} ${jdText}`;

    const skillCatalog = [
      'Python', 'Machine Learning', 'NumPy', 'Pandas', 'Scikit-learn', 'SQL', 
      'PyTorch', 'TensorFlow', 'Deep Learning', 'NLP', 'Computer Vision', 'Data Science',
      'React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'HTML5', 'CSS3', 'Vue.js', 'Next.js',
      'Node.js', 'FastAPI', 'Express', 'Django', 'Flask', 'REST API', 'GraphQL',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
      'Git', 'CI/CD', 'Java', 'C++', 'Go', 'Rust', 'Linux'
    ];

    const foundSkills = [];
    skillCatalog.forEach(skill => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(textToSearch)) {
        foundSkills.push(skill);
      }
    });

    if (foundSkills.length > 0) {
      setRequiredSkills(prev => {
        const combined = new Set([...prev, ...foundSkills]);
        return Array.from(combined);
      });
    }

    if (!qualifications) setQualifications('B.Tech / B.E / MCA');
    if (!experience) setExperience('0–2 Years');
  };

  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    if (newSkillInput.trim()) {
      addSkill(newSkillInput.trim());
      setNewSkillInput('');
    }
  };

  const handleClearAll = () => {
    setRequiredSkills([]);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    navigate('/screening/upload');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <StepProgressBar />

      <div className="glass-card p-8 rounded-3xl space-y-8 shadow-2xl border border-slate-800">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-3 text-brand-400">
            <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Required Skills & Qualifications</h1>
              <p className="text-sm text-slate-400">
                Type skills manually or click Auto-Generate to populate skills directly in the box below.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutoSuggest}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-brand-600/20 flex items-center space-x-2 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>✨ Auto-Generate Skills</span>
          </button>
        </div>

        <form onSubmit={handleContinue} className="space-y-8">
          {/* Required Skills Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-200">
                Required Skills Space <span className="text-xs font-normal text-slate-400">(Manual type or Auto-generate)</span>
              </label>

              {requiredSkills.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                >
                  Clear All ({requiredSkills.length})
                </button>
              )}
            </div>
            
            {/* Manual Typing Input Bar */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
                placeholder="Type a skill manually and press Enter or Add (e.g. PyTorch)..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-sm"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm flex items-center space-x-1.5 shadow-md shadow-brand-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Skill</span>
              </button>
            </div>

            {/* Direct Skill Badges Container Space */}
            <div className="flex flex-wrap gap-2 pt-2 min-h-[60px] p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-inner">
              {requiredSkills.length === 0 ? (
                <div className="w-full text-center py-3 text-xs text-slate-500 flex flex-col items-center justify-center space-y-1">
                  <span>No required skills added yet.</span>
                  <span>
                    Type a skill in the box above to add manually, or click{' '}
                    <button
                      type="button"
                      onClick={handleAutoSuggest}
                      className="text-brand-400 underline font-semibold hover:text-brand-300"
                    >
                      ✨ Auto-Generate Skills
                    </button>{' '}
                    to generate them directly into this space.
                  </span>
                </div>
              ) : (
                requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold shadow-sm animate-fadeIn"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-rose-400 transition-colors p-0.5 rounded-md hover:bg-rose-500/10"
                      title={`Remove ${skill}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Required Qualifications */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">Required Qualifications</label>
              <input
                type="text"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="e.g. B.Tech / B.E / MCA"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-sm"
              />
            </div>

            {/* Required Experience */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">Required Experience</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 0–2 Years"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => navigate('/screening/job-description')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-sm flex items-center space-x-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm shadow-lg shadow-brand-600/25 flex items-center space-x-2 transition-all"
            >
              <span>Continue to Resume Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
