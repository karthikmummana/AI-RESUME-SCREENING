import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, CheckCircle2, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';
import StepProgressBar from '../components/StepProgressBar';

const PROCESSING_STAGES = [
  'Upload Validation',
  'PDF/DOCX Parsing',
  'Resume Text Extraction',
  'Resume Information Extraction',
  'NLP Processing',
  'Skill Extraction',
  'Job Description Analysis',
  'Resume ↔ JD Matching',
  'Suitability Score Calculation',
  'Matched/Missing Skill Detection',
  'Candidate Ranking'
];

export default function ProcessingPage() {
  const navigate = useNavigate();
  const { sessionId, runAIAnalysis, uploadedFiles, serverCandidates } = useScreening();

  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [currentResumeIdx, setCurrentResumeIdx] = useState(1);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const hasTriggeredRef = useRef(false);

  const totalResumes = uploadedFiles.length || serverCandidates.length || 1;

  useEffect(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    let stageInterval;
    
    const executeAIProcessing = async () => {
      try {
        // Stage progress animation tick
        stageInterval = setInterval(() => {
          setCurrentStageIdx(prev => {
            if (prev < PROCESSING_STAGES.length - 1) {
              return prev + 1;
            }
            return prev;
          });
          setCurrentResumeIdx(prev => Math.min(prev + 1, totalResumes));
        }, 600);

        // Call real backend & Python AI service endpoint
        await runAIAnalysis(sessionId);

        clearInterval(stageInterval);
        setCurrentStageIdx(PROCESSING_STAGES.length - 1);
        setCurrentResumeIdx(totalResumes);
        setIsDone(true);
      } catch (err) {
        clearInterval(stageInterval);
        console.error('Processing error:', err);
        setErrorMsg(err.message || 'AI Processing failed. Please check AI Service backend.');
      }
    };

    executeAIProcessing();

    return () => {
      if (stageInterval) clearInterval(stageInterval);
    };
  }, [sessionId, runAIAnalysis, totalResumes]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <StepProgressBar />

      <div className="glass-card p-8 rounded-3xl space-y-8 shadow-2xl border border-slate-800">
        <div className="flex items-center space-x-3 text-brand-400">
          <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Analyzing Resumes</h1>
            <p className="text-sm text-slate-400">
              {isDone 
                ? 'AI analysis completed for all candidate resumes!' 
                : `Analyzing Resume ${currentResumeIdx} of ${totalResumes}`}
            </p>
          </div>
        </div>

        {errorMsg ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-3">
            <div className="flex items-center space-x-2 font-semibold text-sm">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>AI Processing Error</span>
            </div>
            <p className="text-xs">{errorMsg}</p>
            <button
              onClick={() => navigate('/screening/upload')}
              className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-white border border-slate-800"
            >
              Return to Upload Page
            </button>
          </div>
        ) : (
          <>
            {/* Realtime Stage Progress Indicator */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-brand-300">
                  {isDone ? 'Screening Pipeline Complete' : `Stage ${currentStageIdx + 1}: ${PROCESSING_STAGES[currentStageIdx]}`}
                </span>
                <span className="text-slate-400">
                  {Math.round(((currentStageIdx + 1) / PROCESSING_STAGES.length) * 100)}%
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStageIdx + 1) / PROCESSING_STAGES.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Stages Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {PROCESSING_STAGES.map((stageName, idx) => {
                const isFinished = idx <= currentStageIdx || isDone;
                const isCurrent = idx === currentStageIdx && !isDone;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isFinished
                        ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                        : 'bg-slate-950/40 border-slate-900 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-[10px] text-slate-500">{(idx + 1).toString().padStart(2, '0')}.</span>
                      <span className="font-medium">{stageName}</span>
                    </div>

                    <div>
                      {isFinished ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-800" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Action Bar: Back and Continue */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => navigate('/screening/upload')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-sm flex items-center space-x-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={!isDone}
                onClick={() => navigate('/screening/results')}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 flex items-center space-x-2 transition-all disabled:opacity-40"
              >
                <span>View Screening Results</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
