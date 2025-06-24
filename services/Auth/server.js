// This file serves as an entry point to start the auth service
require('./src/server.js');
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] // <-- Add PATCH here









}); next();  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS'); // <-- Add PATCH  res.header('Access-Control-Allow-Credentials', 'true');  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');app.use((req, res, next) => {}));}));
