# 🤖 AI Resume Screening System

An AI-powered web application that automates the initial resume screening process by analyzing candidate resumes against job requirements, extracting relevant information and skills, calculating resume suitability/ATS scores, and ranking candidates based on their job match.

The system is designed to help recruiters reduce manual resume screening effort and quickly identify candidates whose resumes best match the requirements of a particular job.

---

## 🚀 Live Application

### 🌐 Frontend

The frontend is deployed using Vercel.

**Live URL:**

https://YOUR-VERCEL-DOMAIN.vercel.app

> Replace the above URL with your actual Vercel deployment URL.

### ⚙️ Backend API

The backend is deployed using Render.

**Backend URL:**

https://ai-resume-screening-f60a.onrender.com

---

# 📌 Project Overview

Recruiters often receive a large number of resumes for a single job opening. Manually reviewing every resume can be time-consuming and may make it difficult to consistently compare candidates.

The **AI Resume Screening System** provides an automated screening workflow.

The application allows recruiters to:

- Create a screening session
- Enter job requirements
- Upload candidate resumes
- Parse resume content
- Extract candidate information
- Identify candidate skills
- Compare resumes with job requirements
- Identify matching skills
- Identify missing skills
- Calculate ATS/suitability scores
- Rank candidates
- Review candidate information
- Update candidate screening status
- Download candidate resumes

---

# 🎯 Project Objective

The main objective of this project is to develop a web-based resume screening platform that can automate the initial stage of recruitment.

Instead of manually checking every resume, recruiters can upload multiple resumes and allow the system to analyze them against predefined job requirements.

The system produces structured screening results that help recruiters review candidates more efficiently.

---

# 🔄 System Workflow

```text
                ┌───────────────────────┐
                │   Create Screening    │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Enter Job Requirements│
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │    Upload Resumes     │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │    Resume Parsing     │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Skill Extraction    │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ Resume-Job Matching   │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ ATS / Suitability     │
                │       Score           │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ Candidate Ranking     │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ Review / Shortlist /  │
                │        Reject         │
                └───────────────────────┘
