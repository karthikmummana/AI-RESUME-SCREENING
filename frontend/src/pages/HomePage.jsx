import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, FileText, Upload, Sparkles, Target, Award, ListOrdered } from 'lucide-react';

export default function HomePage() {
  const steps = [
    { icon: FileText, title: 'Job Requirements', desc: 'Define Company, Job Title, Description & Qualifications' },
    { icon: Upload, title: 'Upload Resumes', desc: 'Upload multiple PDF or DOCX candidate resumes' },
    { icon: Cpu, title: 'AI Analysis', desc: 'JavaScript NLP text extraction & TF-IDF term vectorization' },
    { icon: Target, title: 'Resume ↔ JD Match', desc: 'Compare candidate skills and work experience against requirements' },
    { icon: Award, title: 'Suitability Score', desc: 'Transparent 6-pillar weighted ATS match scoring (0–100)' },
    { icon: ListOrdered, title: 'Candidate Ranking', desc: 'Rank candidates dynamically and make Shortlist/Review/Reject decisions' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>100% MERN Stack AI Resume Analysis</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          AI Resume Screening <span className="bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">System</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
          Analyze resumes against your job requirements, identify matching and missing skills, calculate suitability scores, and rank candidates automatically.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/screening/company"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-base shadow-xl shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all group"
          >
            <span>Start Screening</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Workflow Diagram Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">Screening Workflow</h2>
          <p className="text-sm text-slate-400 mt-1">Simple 6-stage candidate screening and match evaluation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s, idx) => {
            const IconComponent = s.icon;
            return (
              <div key={idx} className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-4 right-4 text-3xl font-extrabold text-slate-800 group-hover:text-brand-500/20 transition-colors">
                  0{idx + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
