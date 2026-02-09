// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
// This middleware runs BEFORE any route that needs authentication
// It checks if the user has a valid token and extracts their user ID

const jwt = require('jsonwebtoken'); 


const authenticateToken = (req, res, next) => {
  // Getting the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Gets the token part after "Bearer "


  // If no token is provided
  if (!token) {
    return res.status(401).json({ 
      message: 'Access denied, No token provided.' 
    });
  }

  try {
    // Verifying the token using the secret key , if valid, jwt.verify returns the decoded payload(which contains userId )
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attaching the user ID to the request object
    req.userId = decoded.userId;
    
    // next middleware or route handler
    next();

  } catch (error) {

    // Token is invalid or expired
    return res.status(403).json({ 
      message: 'Invalid or expired token' 
    });
  }
};

module.exports = authenticateToken;