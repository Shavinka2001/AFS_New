// This file serves as an entry point to start the auth service
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://4.236.138.4'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'http://4.236.138.4'];
  if (allowedOrigins.includes(req.headers.origin)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

require('./src/server.js');
