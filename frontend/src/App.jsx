import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ScreeningProvider } from './context/ScreeningContext';
import Header from './components/Header';

import HomePage from './pages/HomePage';
import CompanyPage from './pages/CompanyPage';
import JobTitlePage from './pages/JobTitlePage';
import JobDescriptionPage from './pages/JobDescriptionPage';
import RequirementsPage from './pages/RequirementsPage';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import ResultsPage from './pages/ResultsPage';
import RankingPage from './pages/RankingPage';
import CandidateDetailsPage from './pages/CandidateDetailsPage';

export default function App() {
  return (
    <ScreeningProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />

              {/* 8-Step Sequential Workflow Routes */}
              <Route path="/screening/company" element={<CompanyPage />} />
              <Route path="/screening/job-title" element={<JobTitlePage />} />
              <Route path="/screening/job-description" element={<JobDescriptionPage />} />
              <Route path="/screening/requirements" element={<RequirementsPage />} />
              <Route path="/screening/upload" element={<UploadPage />} />
              <Route path="/screening/processing" element={<ProcessingPage />} />
              <Route path="/screening/results" element={<ResultsPage />} />
              <Route path="/screening/ranking" element={<RankingPage />} />
              <Route path="/screening/candidate/:candidateId" element={<CandidateDetailsPage />} />

              {/* Route aliases */}
              <Route path="/job-details" element={<Navigate to="/screening/company" replace />} />
              <Route path="/upload-resumes" element={<Navigate to="/screening/upload" replace />} />
              <Route path="/analyzing" element={<Navigate to="/screening/processing" replace />} />
              <Route path="/results" element={<Navigate to="/screening/results" replace />} />
              <Route path="/candidate/:candidateId" element={<CandidateDetailsPage />} />
            </Routes>
          </main>
          
          <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
            <p>AI Resume Screening System • 100% MERN Stack JavaScript NLP & ATS Engine</p>
          </footer>
        </div>
      </Router>
    </ScreeningProvider>
  );
}
