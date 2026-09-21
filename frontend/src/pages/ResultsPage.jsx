import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Award, Search, Filter, ArrowUpDown, Eye, ListOrdered, Building2, Briefcase, Users } from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';
import StepProgressBar from '../components/StepProgressBar';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { sessionId, resultsData, fetchResults, companyName, jobTitle } = useScreening();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Highest Score');
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

  const rawResults = resultsData?.results || [];

  // Filter & Search Logic
  let filtered = rawResults.filter(cand => {
    const matchesSearch = cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cand.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'All' ? true : cand.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // Sort Logic
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'Highest Score') return b.finalScore - a.finalScore;
    if (sortBy === 'Lowest Score') return a.finalScore - b.finalScore;
    if (sortBy === 'Name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <StepProgressBar />

      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-brand-400" />
              <span>Resume Screening Results</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              AI Suitability Score analysis and candidate match ranking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-1.5 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-brand-400" />
              <span>Company: <strong className="text-white">{resultsData?.session?.companyName || companyName}</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-1.5 text-slate-300">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Job: <strong className="text-white">{resultsData?.session?.jobTitle || jobTitle}</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 font-semibold flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-brand-400" />
              <span>Total Resumes: {resultsData?.results?.length || 0}</span>
            </div>

            <Link
              to="/screening/ranking"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center space-x-1.5 shadow-md shadow-brand-600/20 transition-all ml-auto"
            >
              <ListOrdered className="w-4 h-4" />
              <span>View Leaderboard Ranking</span>
            </Link>
          </div>
        </div>

        {/* Controls: Search, Filters, Sort */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Candidate Name or Email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {/* Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-2.5 mr-1.5" />
              {['All', 'Shortlisted', 'Review', 'Rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="Highest Score">Highest Score</option>
                <option value="Lowest Score">Lowest Score</option>
                <option value="Name">Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Loading AI Screening Results...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No candidates found matching the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4 text-center w-16">Rank</th>
                    <th className="py-3.5 px-4">Candidate</th>
                    <th className="py-3.5 px-4 text-center">Suitability Score</th>
                    <th className="py-3.5 px-4 text-center">Skill Match</th>
                    <th className="py-3.5 px-4 text-center">Matched Skills</th>
                    <th className="py-3.5 px-4 text-center">Missing Skills</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filtered.map((cand) => {
                    const isTopScore = cand.finalScore >= 80;
                    const isMedium = cand.finalScore >= 60 && cand.finalScore < 80;

                    return (
                      <tr key={cand.candidateId} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-4 px-4 text-center font-bold text-slate-400">
                          #{cand.rank}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-100 text-sm">{cand.name}</p>
                          <p className="text-[11px] text-slate-500">{cand.email}</p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full font-extrabold text-sm ${
                              isTopScore
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : isMedium
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {cand.finalScore}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-slate-300">
                          {cand.skillMatch}%
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                            {cand.matchedSkillsCount}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                            {cand.missingSkillsCount}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                              cand.status === 'Shortlisted'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : cand.status === 'Rejected'
                                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {cand.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => navigate(`/screening/candidate/${cand.candidateId}`)}
                            className="px-3 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 text-xs font-semibold inline-flex items-center space-x-1 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
