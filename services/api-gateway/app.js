const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");
const { applyRateLimiter } = require("./utils/rateLimitter")
const app = express();
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
//host.docker.internal
// app.use("/api/users", applyRateLimiter, proxy("host.docker.internal:5001"));
app.use("/api/users", applyRateLimiter, proxy("http://localhost:5001"));
app.use(
  "/api/order",
  applyRateLimiter,
  proxy("http://localhost:5002")
);
app.use(
  "/api/locations",
  applyRateLimiter,
  proxy("http://localhost:5003")
);

//Exporting app to be used by the server.js
module.exports = app;