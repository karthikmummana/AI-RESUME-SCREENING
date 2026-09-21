import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';
import StepProgressBar from '../components/StepProgressBar';

export default function JobDescriptionPage() {
  const navigate = useNavigate();
  const { jobDescription, setJobDescription, companyName, jobTitle, requiredSkills } = useScreening();
  const [valError, setValError] = useState('');

  const handleAutoGenerate = () => {
    const company = companyName.trim() || 'Tech Mahindra';
    const title = jobTitle.trim() || 'AI Engineer';
    const skillsList = requiredSkills.length > 0 ? requiredSkills.join(', ') : 'Python, Machine Learning, SQL';

    const generatedJD = `As a ${title} at ${company}, you will design, develop, and deploy scalable solutions that solve complex technical problems. You will work with cross-functional teams to build data pipelines, integrate backend microservices, and optimize overall system performance for enterprise use cases.

Key Responsibilities:
- Architect, write, and maintain clean, efficient, and well-documented technical code.
- Collaborate with engineering leads to define system specifications, data models, and API endpoints.
- Conduct data processing, algorithm optimization, and troubleshoot production system bottlenecks.
- Participate in code reviews, testing automation, and deployment pipeline management.

Core Requirements & Skills:
- Relevant technical background with experience in ${skillsList}.
- Strong problem-solving abilities, analytical thinking, and effective communication skills.`;

    setJobDescription(generatedJD);
    if (valError) setValError('');
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!jobDescription || !jobDescription.trim()) {
      setValError('Job description cannot be empty. Please enter detailed requirements.');
      return;
    }
    setValError('');
    navigate('/screening/requirements');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <StepProgressBar />

      <div className="glass-card p-8 rounded-3xl space-y-6 shadow-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-3 text-brand-400">
            <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Job Description</h1>
              <p className="text-sm text-slate-400">
                Enter or auto-generate the job description used to evaluate candidate resumes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutoGenerate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-brand-600/20 flex items-center space-x-1.5 self-start sm:self-auto transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>✨ Auto-Generate with AI</span>
          </button>
        </div>

        <form onSubmit={handleContinue} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-200">
                Detailed Job Description & Key Responsibilities <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-500">Manual typing, copy-paste, or auto-generated</span>
            </div>

            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                if (valError) setValError('');
              }}
              placeholder="e.g. Type or copy-paste detailed requirements here, or click 'Auto-Generate with AI' above..."
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm leading-relaxed"
            />
            {valError && (
              <p className="text-xs text-rose-400 font-medium pt-1">{valError}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => navigate('/screening/job-title')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-sm flex items-center space-x-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm shadow-lg shadow-brand-600/25 flex items-center space-x-2 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
