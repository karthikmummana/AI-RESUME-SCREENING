import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, ShieldCheck, Sparkles } from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';

export default function Header() {
  const location = useLocation();
  const { companyName, jobTitle, resultsData, resetSession } = useScreening();

  const isHome = location.pathname === '/';
  const displayCompany = resultsData?.session?.companyName || companyName || 'Not Set';
  const displayJob = resultsData?.session?.jobTitle || jobTitle || 'Not Set';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              AI Resume Screening <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">System</span>
            </span>
            <p className="text-xs text-slate-400 hidden sm:block">Automated NLP & ATS Matching Engine</p>
          </div>
        </Link>

        {!isHome && (
          <div className="hidden md:flex items-center space-x-4 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="text-slate-500">Company:</span>
              <span className="font-semibold text-brand-300">{displayCompany}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="text-slate-500">Job:</span>
              <span className="font-semibold text-indigo-300">{displayJob}</span>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <span className="hidden lg:inline-flex items-center text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> AI Engine Ready
          </span>
          <Link
            to="/screening/company"
            onClick={() => resetSession()}
            className="inline-flex items-center justify-center text-xs font-medium px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> New Screening
          </Link>
        </div>
      </div>
    </header>
  );
}
