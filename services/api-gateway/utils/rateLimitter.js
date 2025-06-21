const {rateLimit} = require('express-rate-limit')

//Rate limiting
exports.applyRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit:100,
  })