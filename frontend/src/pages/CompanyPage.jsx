import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';
import StepProgressBar from '../components/StepProgressBar';

export default function CompanyPage() {
  const navigate = useNavigate();
  const { companyName, setCompanyName } = useScreening();
  const [valError, setValError] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();
    if (!companyName || !companyName.trim()) {
      setValError('Please enter a valid company name to proceed.');
      return;
    }
    setValError('');
    navigate('/screening/job-title');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <StepProgressBar />

      <div className="glass-card p-8 rounded-3xl space-y-6 shadow-2xl border border-slate-800">
        <div className="flex items-center space-x-3 text-brand-400">
          <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Company Information</h1>
            <p className="text-sm text-slate-400">Enter the company name for this resume screening session.</p>
          </div>
        </div>

        <form onSubmit={handleContinue} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200">
              Company Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                if (valError) setValError('');
              }}
              placeholder="e.g. ABC Technologies"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-base"
              autoFocus
            />
            {valError && (
              <p className="text-xs text-rose-400 font-medium pt-1">{valError}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => navigate('/')}
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
