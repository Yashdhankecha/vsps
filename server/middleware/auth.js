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
      
      // Super admin has access to everything
      if (decoded.role === 'superadmin') {
        req.user = {
          ...decoded,
          _id: decoded._id || decoded.id || decoded.userId
        };
        return next();
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

// Super admin only authorization
const superAdminAuth = authorizeRoles('superadmin');

// Admin authorization (includes super admin)
const adminAuth = authorizeRoles('admin', 'superadmin');

// Specialized role authorizations
const userManagerAuth = authorizeRoles('usermanager', 'superadmin');
const contentManagerAuth = authorizeRoles('contentmanager', 'superadmin');
const formManagerAuth = authorizeRoles('formmanager', 'superadmin');
const bookingManagerAuth = authorizeRoles('bookingmanager', 'superadmin');
const contactManagerAuth = authorizeRoles('contactmanager', 'superadmin');

// User authorization (all authenticated users)
const userAuth = authorizeRoles('user', 'admin', 'superadmin', 'usermanager', 'contentmanager', 'formmanager', 'bookingmanager', 'contactmanager');

module.exports = { 
  superAdminAuth, 
  adminAuth, 
  userManagerAuth, 
  contentManagerAuth, 
  formManagerAuth, 
  bookingManagerAuth, 
  contactManagerAuth, 
  userAuth, 
  authorizeRoles 
};