const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const locationRoutes = require('./routes/locationRoutes');

// Load environment variables
dotenv.config({path: path.join(__dirname, '../.env')});

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/locations', locationRoutes);

// Health check route
app.get('/', (req, res) => res.json({
  service: 'Location Service',
  status: 'running',
  timestamp: new Date().toISOString()
}));

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error' 
  });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`✅ Location service running on port ${PORT}`);
});
