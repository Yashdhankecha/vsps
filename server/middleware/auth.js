const jwt = require('jsonwebtoken');

// Generic role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded.role) {
        return res.status(403).json({ message: 'No role found in token' });
      }
      
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ 
          message: `Access denied. Required roles: ${roles.join(', ')}, your role: ${decoded.role}` 
        });
      }

      // Normalize user ID
      const userId = decoded._id || decoded.id || decoded.userId;
      req.user = {
        ...decoded,
        _id: userId
      };
      
      next();
    } catch (error) {
      console.error('Auth error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      res.status(500).json({ 
        message: 'Server error',
        error: error.message 
      });
    }
  };
};

// Admin only authorization
const adminAuth = authorizeRoles('admin');

// User authorization (all authenticated users)
const userAuth = authorizeRoles('user', 'admin');

module.exports = { adminAuth, userAuth, authorizeRoles };