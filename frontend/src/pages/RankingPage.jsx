import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Award, Eye, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';
import StepProgressBar from '../components/StepProgressBar';

export default function RankingPage() {
  const navigate = useNavigate();
  const { sessionId, resultsData, fetchResults } = useScreening();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (resultsData?.results?.length > 0) {
        setLoading(false);
      } else {
        setLoading(true);
      }
      await fetchResults(sessionId);
      if (isMounted) {
        setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [sessionId, fetchResults]);

  const results = resultsData?.results || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <StepProgressBar />

      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-brand-400">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Candidate Ranking</h1>
              <p className="text-xs text-slate-400">Dynamic candidate ranking ordered by AI Suitability Score.</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/screening/results')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center space-x-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Table</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading Ranking Leaderboard...
          </div>
        ) : results.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm glass-card rounded-3xl border border-slate-800">
            No candidates ranked yet. Please run screening analysis first.
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((cand, idx) => {
              const rank = idx + 1;
              const isTopThree = rank <= 3;

              return (
                <div
                  key={cand.candidateId}
                  className={`glass-card p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                    rank === 1
                      ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900'
                      : rank === 2
                        ? 'border-slate-400/30 bg-gradient-to-r from-slate-400/10 via-slate-900 to-slate-900'
                        : rank === 3
                          ? 'border-amber-700/30 bg-gradient-to-r from-amber-800/10 via-slate-900 to-slate-900'
                          : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Left: Rank badge & Name */}
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl ${
                        rank === 1
                          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                          : rank === 2
                            ? 'bg-slate-300 text-slate-950 shadow-lg shadow-slate-300/20'
                            : rank === 3
                              ? 'bg-amber-700 text-white shadow-lg'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      #{rank}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-bold text-white">{cand.name}</h2>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            cand.status === 'Shortlisted'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : cand.status === 'Rejected'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {cand.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{cand.email}</p>
                    </div>
                  </div>

                  {/* Middle: Breakdown badges */}
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Skill Match</span>
                      <span className="font-bold text-brand-300">{cand.skillMatch}%</span>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Experience</span>
                      <span className="font-bold text-indigo-300">{cand.experienceMatch}%</span>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Education</span>
                      <span className="font-bold text-purple-300">{cand.educationMatch}%</span>
                    </div>
                  </div>

                  {/* Right: Big Score & View Button */}
                  <div className="flex items-center space-x-4 self-end md:self-auto">
                    <div className="text-right">
                      <span className="text-2xl font-black text-white">{cand.finalScore}</span>
                      <span className="text-xs text-slate-400 font-medium"> / 100</span>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">AI Suitability Score</p>
                    </div>

                    <button
                      onClick={() => navigate(`/screening/candidate/${cand.candidateId}`)}
                      className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 flex items-center space-x-1.5 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Candidate</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
