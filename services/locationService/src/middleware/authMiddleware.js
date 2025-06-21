const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Verifies the JWT access token from the Authorization header
 * Sets the decoded user information in the request object
 */
const protect = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  // Check if header exists and has the right format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication failed: No valid token provided"
    });
  }

  // Extract the token
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request object
    req.user = decoded;
    
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication failed: Token expired",
        expired: true
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: "Authentication failed: Invalid token" 
    });
  }
};

module.exports = protect;
