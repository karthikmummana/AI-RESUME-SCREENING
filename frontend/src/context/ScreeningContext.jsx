import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const ScreeningContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || '';

export const ScreeningProvider = ({ children }) => {
  const [sessionId, setSessionIdState] = useState(() => {
    return localStorage.getItem('ai_screening_session_id') || null;
  });

  const setSessionId = useCallback((id) => {
    if (id) {
      localStorage.setItem('ai_screening_session_id', id);
    } else {
      localStorage.removeItem('ai_screening_session_id');
    }
    setSessionIdState(id);
  }, []);

  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [qualifications, setQualifications] = useState('');
  const [experience, setExperience] = useState('');
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [serverCandidates, setServerCandidates] = useState([]);
  const [resultsData, setResultsData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Skill management
  const addSkill = useCallback((skill) => {
    const trimmed = skill.trim();
    if (trimmed) {
      setRequiredSkills(prev => {
        if (!prev.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
          return [...prev, trimmed];
        }
        return prev;
      });
    }
  }, []);

  const removeSkill = useCallback((skillToRemove) => {
    setRequiredSkills(prev => prev.filter(s => s !== skillToRemove));
  }, []);

  // File management
  const addFiles = useCallback((newFiles) => {
    const valid = Array.from(newFiles).filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ext === 'pdf' || ext === 'docx';
    });
    setUploadedFiles(prev => [...prev, ...valid]);
  }, []);

  const removeFile = useCallback((index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // API Call: Create Session
  const createSessionOnServer = useCallback(async () => {
    try {
      setError(null);
      const res = await axios.post(`${API_URL}/api/screening/create`, {
        companyName,
        jobTitle,
        jobDescription,
        requiredSkills,
        qualifications,
        experience
      });
      if (res.data.success) {
        const newId = res.data.session._id;
        setSessionId(newId);
        return newId;
      }
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  }, [companyName, jobTitle, jobDescription, requiredSkills, qualifications, experience, setSessionId]);

  // API Call: Upload Resumes
  const uploadResumesToServer = useCallback(async (targetSessionId) => {
    const activeSessionId = targetSessionId || sessionId;
    if (!activeSessionId) {
      throw new Error("No active session ID. Please restart session.");
    }
    if (uploadedFiles.length === 0) {
      throw new Error("Please select at least one PDF or DOCX resume to upload.");
    }

    try {
      setError(null);
      const formData = new FormData();
      uploadedFiles.forEach(file => {
        formData.append('resumes', file);
      });

      const res = await axios.post(`${API_URL}/api/screening/${activeSessionId}/resumes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setServerCandidates(res.data.candidates);
        return res.data.candidates;
      }
    } catch (err) {
      console.error('Failed to upload resumes:', err);
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  }, [sessionId, uploadedFiles]);

  // API Call: Run AI Analysis
  const runAIAnalysis = useCallback(async (targetSessionId) => {
    const activeSessionId = targetSessionId || sessionId;
    if (!activeSessionId) {
      throw new Error("No active session ID.");
    }

    try {
      setError(null);
      setIsProcessing(true);
      const res = await axios.post(`${API_URL}/api/screening/${activeSessionId}/analyze`);
      setIsProcessing(false);
      return res.data;
    } catch (err) {
      setIsProcessing(false);
      console.error('Failed AI analysis:', err);
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  }, [sessionId]);

  // API Call: Fetch Screening Results
  const fetchResults = useCallback(async (targetSessionId) => {
    const activeSessionId = targetSessionId || sessionId || localStorage.getItem('ai_screening_session_id');
    if (!activeSessionId) return null;

    try {
      setError(null);
      const res = await axios.get(`${API_URL}/api/screening/${activeSessionId}/results`);
      if (res.data.success) {
        setResultsData(res.data);
        return res.data;
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
      setError(err.response?.data?.message || err.message);
    }
  }, [sessionId]);

  // API Call: Update Candidate Status
  const updateCandidateStatus = useCallback(async (candidateId, newStatus) => {
    try {
      const res = await axios.put(`${API_URL}/api/candidates/${candidateId}/status`, { status: newStatus });
      if (res.data.success) {
        setResultsData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            results: prev.results.map(cand => 
              cand.candidateId === candidateId ? { ...cand, status: newStatus } : cand
            )
          };
        });
        return res.data;
      }
    } catch (err) {
      console.error('Failed to update candidate status:', err);
      throw err;
    }
  }, []);

  // Reset / Start New Session
  const resetSession = useCallback(() => {
    setSessionId(null);
    setCompanyName('');
    setJobTitle('');
    setJobDescription('');
    setRequiredSkills([]);
    setQualifications('');
    setExperience('');
    setUploadedFiles([]);
    setServerCandidates([]);
    setResultsData(null);
    setError(null);
    localStorage.removeItem('ai_screening_session_id');
  }, [setSessionId]);

  return (
    <ScreeningContext.Provider
      value={{
        sessionId,
        setSessionId,
        companyName,
        setCompanyName,
        jobTitle,
        setJobTitle,
        jobDescription,
        setJobDescription,
        requiredSkills,
        setRequiredSkills,
        addSkill,
        removeSkill,
        qualifications,
        setQualifications,
        experience,
        setExperience,
        uploadedFiles,
        setUploadedFiles,
        addFiles,
        removeFile,
        serverCandidates,
        resultsData,
        isProcessing,
        error,
        setError,
        createSessionOnServer,
        uploadResumesToServer,
        runAIAnalysis,
        fetchResults,
        updateCandidateStatus,
        resetSession
      }}
    >
      {children}
    </ScreeningContext.Provider>
  );
};

export const useScreening = () => useContext(ScreeningContext);

