const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.id;
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    User.findById(req.user)
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        if (!roles.includes(user.role)) {
          return res.status(403).json({ message: 'Forbidden, insufficient role' });
        }
        req.userRole = user.role;
        req.userId = user._id;
        next();
      })
      .catch(err => {
        console.error('Error fetching user for authorization:', err);
        res.status(500).json({ message: 'Server error during authorization' });
      });
  };
};

module.exports = { protect, authorize };