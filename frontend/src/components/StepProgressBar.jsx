import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const STAGES = [
  { path: '/screening/company', aliasPath: '/job-details', label: 'Company' },
  { path: '/screening/job-title', label: 'Job Title' },
  { path: '/screening/job-description', label: 'Description' },
  { path: '/screening/requirements', label: 'Requirements' },
  { path: '/screening/upload', aliasPath: '/upload-resumes', label: 'Upload' },
  { path: '/screening/processing', aliasPath: '/analyzing', label: 'AI Processing' },
  { path: '/screening/results', aliasPath: '/results', label: 'Results' },
  { path: '/screening/ranking', label: 'Ranking' }
];

export default function StepProgressBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  let currentIdx = STAGES.findIndex(s => 
    currentPath === s.path || currentPath === s.aliasPath || (s.path && currentPath.startsWith(s.path))
  );

  if (currentIdx === -1) {
    if (currentPath.includes('/screening/candidate/') || currentPath.includes('/candidate/')) {
      currentIdx = 6; // Map candidate view to Results stage
    } else {
      currentIdx = 0;
    }
  }

  const activeIdx = currentIdx;

  return (
    <div className="w-full max-w-5xl mx-auto mb-10 px-2 sm:px-4">
      <div className="flex items-center justify-between relative px-2">
        {/* Dark Background Track Line */}
        <div className="absolute top-[18px] left-6 right-6 h-0.5 bg-slate-800/80 z-0" />

        {/* Active Gradient Track Line */}
        <div 
          className="absolute top-[18px] left-6 h-0.5 bg-gradient-to-r from-indigo-600 via-brand-500 to-indigo-400 z-0 transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
          style={{ width: `${(activeIdx / (STAGES.length - 1)) * 96}%` }}
        />

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <button
              key={stage.path}
              type="button"
              onClick={() => navigate(stage.path)}
              title={`Jump to ${stage.label} stage`}
              className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
            >
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/40 group-hover:scale-105' 
                    : isCurrent 
                      ? 'bg-slate-950 text-brand-300 border-2 border-brand-500 ring-4 ring-brand-500/20 shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-105' 
                      : 'bg-slate-900/90 text-slate-500 border border-slate-800 group-hover:border-slate-700 group-hover:text-slate-300'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>

              <span className={`text-[11px] sm:text-xs mt-2.5 font-medium tracking-tight whitespace-nowrap transition-colors ${
                isCurrent 
                  ? 'text-brand-300 font-bold drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' 
                  : isCompleted 
                    ? 'text-slate-200 font-semibold group-hover:text-brand-300' 
                    : 'text-slate-500 group-hover:text-slate-300'
              }`}>
                {stage.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
