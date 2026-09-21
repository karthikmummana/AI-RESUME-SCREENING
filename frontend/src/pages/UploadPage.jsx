import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Trash2, ArrowLeft, Play, Sparkles, AlertCircle } from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';
import StepProgressBar from '../components/StepProgressBar';

export default function UploadPage() {
  const navigate = useNavigate();
  const {
    uploadedFiles,
    addFiles,
    removeFile,
    createSessionOnServer,
    uploadResumesToServer,
    setError,
    setUploadedFiles
  } = useScreening();

  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localErr, setLocalErr] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
      setLocalErr('');
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      setLocalErr('');
    }
  };

  const loadSampleResumes = async () => {
    try {
      setLocalErr('');
      setLoading(true);
      const sampleNames = [
        'Rahul_Kumar_AI_Engineer.pdf',
        'Priya_Sharma_Data_Scientist.pdf',
        'Arjun_Rao_ML_Engineer.docx',
        'Sneha_Patel_Frontend_Dev.pdf',
        'Vikram_Singh_Python_Backend.docx',
        'Ananya_Deshmukh_NLP_Engineer.pdf',
        'Amit_Verma_Junior_Dev.docx'
      ];

      const loadedFiles = await Promise.all(
        sampleNames.map(async (fileName) => {
          const res = await fetch(`/sample_resumes/${fileName}`);
          const blob = await res.blob();
          const mimeType = fileName.endsWith('.pdf') 
            ? 'application/pdf' 
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          return new File([blob], fileName, { type: mimeType });
        })
      );

      setUploadedFiles(loadedFiles);
    } catch (err) {
      console.error('Failed to load sample resumes:', err);
      setLocalErr('Failed to load real sample files.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartScreening = async () => {
    if (uploadedFiles.length === 0) {
      setLocalErr('Please upload at least one PDF or DOCX candidate resume to start AI screening.');
      return;
    }

    try {
      setLoading(true);
      setLocalErr('');
      
      // 1. Create session on server
      const newSessionId = await createSessionOnServer();
      
      // 2. Upload files to server
      await uploadResumesToServer(newSessionId);
      
      // 3. Navigate to Processing Page (does NOT run analysis until page mounts / trigger)
      navigate('/screening/processing');
    } catch (err) {
      console.error(err);
      setLocalErr(err.message || 'Error initializing screening session.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <StepProgressBar />

      <div className="glass-card p-8 rounded-3xl space-y-8 shadow-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3 text-brand-400">
            <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Upload Candidate Resumes</h1>
              <p className="text-sm text-slate-400">Upload multiple PDF or DOCX resumes for screening.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadSampleResumes}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-brand-300 flex items-center space-x-1.5 self-start sm:self-auto transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Load 7 Sample Resumes</span>
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragging 
              ? 'border-brand-500 bg-brand-500/10 scale-[1.01]' 
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
          }`}
          onClick={() => document.getElementById('resumeFileInput').click()}
        >
          <input
            id="resumeFileInput"
            type="file"
            multiple
            accept=".pdf,.docx"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-4 border border-brand-500/20">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Drag & Drop Resumes Here</h3>
          <p className="text-xs text-slate-400 mb-4">
            Supports <span className="font-semibold text-slate-300">PDF</span> and <span className="font-semibold text-slate-300">DOCX</span> documents (Multiple files allowed)
          </p>
          <span className="inline-block px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700">
            Browse Files from Computer
          </span>
        </div>

        {localErr && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{localErr}</span>
          </div>
        )}

        {/* File List Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
            <span>Uploaded Resumes ({uploadedFiles.length})</span>
            {uploadedFiles.length > 0 && (
              <button
                type="button"
                onClick={() => setUploadedFiles([])}
                className="text-slate-500 hover:text-rose-400 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {uploadedFiles.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900/30 border border-slate-800/80 text-center text-xs text-slate-500">
              No resumes uploaded yet. Drag and drop files above or click 'Load 7 Sample Resumes'.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-900 transition-colors">
                  <div className="flex items-center space-x-3 overflow-hidden pr-2">
                    <div className="p-2 rounded-lg bg-slate-800 text-brand-400 flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {file.name.endsWith('.pdf') ? 'PDF Document' : 'DOCX Document'} • {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-700">
                      Ready for Screening
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => navigate('/screening/requirements')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-sm flex items-center space-x-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleStartScreening}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{loading ? 'Uploading & Preparing...' : 'Start AI Screening'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
