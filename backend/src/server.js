const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files and sample resumes statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/sample_resumes', express.static(path.join(__dirname, '../../sample_resumes')));

// Routes
const screeningRoutes = require('./routes/screening.routes');
const candidateRoutes = require('./routes/candidate.routes');

app.use('/api/screening', screeningRoutes);
app.use('/api/candidates', candidateRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Node.js Express Backend Service' });
});

// Start Server & Connect Database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Express Backend] Server running on http://127.0.0.1:${PORT}`);
  });
});
