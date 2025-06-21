const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');
const path = require('path');

// Load .env file from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug log to verify
console.log('MONGO_URI:', process.env.MONGO_URI);

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

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