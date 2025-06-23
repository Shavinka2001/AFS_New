const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');
const path = require('path');
const fs = require('fs');

// Load .env file from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug log to verify
console.log('MONGO_URI:', process.env.MONGO_URI);

// Connect to MongoDB
connectDB();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/', orderRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Confined Space Inventory API');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});