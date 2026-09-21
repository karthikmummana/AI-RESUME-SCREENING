import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  User, Mail, Phone, Award, CheckCircle, XCircle, FileText, ArrowLeft,
  ThumbsUp, HelpCircle, ThumbsDown, Check, ExternalLink, Sparkles, X
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { useScreening } from '../context/ScreeningContext';
import StepProgressBar from '../components/StepProgressBar';

export default function CandidateDetailsPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { updateCandidateStatus } = useScreening();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [showResumeModal, setShowResumeModal] = useState(false);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/candidates/${candidateId}`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load candidate details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (candidateId) {
      fetchCandidateData();
    }
  }, [candidateId]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateCandidateStatus(candidateId, newStatus);
      setData(prev => ({
        ...prev,
        candidate: { ...prev.candidate, status: newStatus },
        analysis: { ...prev.analysis, status: newStatus }
      }));
      setStatusMsg('Candidate status updated successfully.');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">
        Loading candidate screening analysis...
      </div>
    );
  }

  if (!data || !data.candidate) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-400">Candidate data not found.</p>
        <button
          onClick={() => navigate('/screening/results')}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs"
        >
          Return to Results
        </button>
      </div>
    );
  }

  const { candidate, analysis, session } = data;
  const currentStatus = candidate.status || 'Review';

  // Radar chart score breakdown dataset
  const radarData = [
    { subject: 'Skill Match (40%)', A: analysis?.skillMatch || 0 },
    { subject: 'Keyword Match (20%)', A: analysis?.keywordMatch || 0 },
    { subject: 'Experience Match (15%)', A: analysis?.experienceMatch || 0 },
    { subject: 'Education Match (10%)', A: analysis?.educationMatch || 0 },
    { subject: 'Project Match (5%)', A: analysis?.projectMatch || 0 },
    { subject: 'Semantic Sim (10%)', A: analysis?.semanticSimilarity || 0 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <StepProgressBar />

      {/* Header Bar */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/screening/results')}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Candidate Screening Analysis</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">{candidate.name}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowResumeModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-brand-300 text-xs font-semibold flex items-center space-x-2 transition-all"
          >
            <FileText className="w-4 h-4 text-brand-400" />
            <span>View Original Resume</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Top Overview: Candidate Details & Big AI Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Candidate Info Card & Status Badge */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-lg">
                {candidate.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" /> {candidate.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-500" /> {candidate.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border ${
                  currentStatus === 'Shortlisted'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : currentStatus === 'Rejected'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                {currentStatus}
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Skill Match</span>
              <span className="text-base font-bold text-emerald-400">{analysis?.skillMatch || 0}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Keyword Match</span>
              <span className="text-base font-bold text-brand-400">{analysis?.keywordMatch || 0}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Experience</span>
              <span className="text-base font-bold text-indigo-400">{analysis?.experienceMatch || 0}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Education</span>
              <span className="text-base font-bold text-purple-400">{analysis?.educationMatch || 0}%</span>
            </div>
          </div>
        </div>

        {/* Right Col: AI SUITABILITY SCORE Ring & Radar */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Suitability Score</span>
          
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="10" className="text-slate-800" fill="transparent" />
              <circle
                cx="64" cy="64" r="54"
                stroke="currentColor" strokeWidth="10"
                className="text-brand-500 transition-all duration-1000 ease-out"
                strokeDasharray={339}
                strokeDashoffset={339 - (339 * (analysis?.finalScore || 0)) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-white">{analysis?.finalScore || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">/ 100</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Weighted composite match calculated from 6 NLP parameters.
          </p>
        </div>
      </div>

      {/* Score Breakdown Bars & Radar Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pillar Progress Bars */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-400" />
            <span>Score Breakdown</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            {/* 1. Skill Match 40% */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Skill Match (40% Weight)</span>
                <span className="text-emerald-400">{analysis?.skillMatch || 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analysis?.skillMatch || 0}%` }} />
              </div>
            </div>

            {/* 2. Keyword Match 20% */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Keyword Match (20% Weight)</span>
                <span className="text-brand-400">{analysis?.keywordMatch || 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${analysis?.keywordMatch || 0}%` }} />
              </div>
            </div>

            {/* 3. Experience Match 15% */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Experience Match (15% Weight)</span>
                <span className="text-indigo-400">{analysis?.experienceMatch || 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${analysis?.experienceMatch || 0}%` }} />
              </div>
            </div>

            {/* 4. Education Match 10% */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Education Match (10% Weight)</span>
                <span className="text-purple-400">{analysis?.educationMatch || 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${analysis?.educationMatch || 0}%` }} />
              </div>
            </div>

            {/* 5. Project Relevance 5% */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Project Relevance (5% Weight)</span>
                <span className="text-amber-400">{analysis?.projectMatch || 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${analysis?.projectMatch || 0}%` }} />
              </div>
            </div>

            {/* 6. Semantic Similarity 10% */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Semantic Similarity (10% Weight)</span>
                <span className="text-cyan-400">{analysis?.semanticSimilarity || 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${analysis?.semanticSimilarity || 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Score Radar Visual */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center">
          <h3 className="text-base font-bold text-white mb-2 self-start">Evaluation Profile</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Radar name="Candidate Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Matched vs Missing Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Matched Skills ({analysis?.matchedSkills?.length || 0})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {!analysis?.matchedSkills || analysis.matchedSkills.length === 0 ? (
              <p className="text-xs text-slate-500">No direct required skill matches found.</p>
            ) : (
              analysis.matchedSkills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{skill}</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-rose-400">
            <XCircle className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Missing Skills ({analysis?.missingSkills?.length || 0})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {!analysis?.missingSkills || analysis.missingSkills.length === 0 ? (
              <p className="text-xs text-emerald-400 font-semibold">✓ All required skills present in candidate resume!</p>
            ) : (
              analysis.missingSkills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{skill}</span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Extracted Resume Information */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Extracted Resume Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Education</span>
            <p className="text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
              {candidate.education || 'Extracting education details...'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Work Experience</span>
            <p className="text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
              {candidate.experience || 'Extracting work history...'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Key Projects</span>
            <p className="text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
              {candidate.projects || 'Extracting project technical summaries...'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Certifications</span>
            <p className="text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
              {candidate.certifications || 'Technical certifications...'}
            </p>
          </div>
        </div>
      </div>

      {/* FINAL ACTIONS: Shortlist / Review / Reject */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Recruiter Evaluation Action</h4>
          <p className="text-xs text-slate-400">Update candidate review status for this screening session.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => handleStatusChange('Shortlisted')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-all ${
              currentStatus === 'Shortlisted'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Shortlist</span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('Review')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-all ${
              currentStatus === 'Review'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-900 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Review</span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('Rejected')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-all ${
              currentStatus === 'Rejected'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-900 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>Reject</span>
          </button>
        </div>
      </div>

      {/* Resume File Preview Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-4xl rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <FileText className="w-4 h-4 text-brand-400" />
                <span>Original Resume — {candidate.name}</span>
              </div>
              <button
                onClick={() => setShowResumeModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono whitespace-pre-wrap">
                {candidate.extractedText || 'Original document content stream parsed.'}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-end space-x-3">
              <a
                href={`/api/candidates/${candidate._id}/resume`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center space-x-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Raw Document</span>
              </a>
              <button
                onClick={() => setShowResumeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium border border-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
