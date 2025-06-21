const jwt = require('jsonwebtoken');
const User = require('../model/User');

// Generate tokens: access token (short-lived) and refresh token (long-lived)
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      userId: user._id, 
      isAdmin: user.isAdmin, 
      userType: user.userType 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' } // short-lived token - 30 minutes
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // longer-lived refresh token
  );

  return { accessToken, refreshToken };
};

// Refresh the access token using refresh token
const refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookies (more secure approach)
    const refreshToken = req.cookies.refreshToken;
    
    // Fallback to request body if not in cookies
    const bodyToken = req.body.refreshToken;
    
    if (!refreshToken && !bodyToken) {
      return res.status(401).json({ 
        success: false,
        message: 'Refresh token is required',
        expired: true // Add expired flag to trigger auto logout
      });
    }
    
    const tokenToUse = refreshToken || bodyToken;
    
    // Verify the refresh token
    const decoded = jwt.verify(tokenToUse, process.env.JWT_REFRESH_SECRET);
    
    // Get user details
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        expired: true // Add expired flag to trigger auto logout
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
        expired: true // Add expired flag to trigger auto logout
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);
    
    // Set new refresh token in cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Return new access token
    res.json({
      success: true,
      accessToken: tokens.accessToken,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        userType: user.userType,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({ 
      success: false,
      expired: true,
      message: 'Invalid or expired refresh token' 
    });
  }
};

module.exports = {
  generateTokens,
  refreshToken
};
