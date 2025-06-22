const {rateLimit} = require('express-rate-limit')

//Rate limiting
exports.applyRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit:1000,
  })