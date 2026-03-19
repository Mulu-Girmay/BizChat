const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect – verifies JWT from cookie or Authorization header.
 * Attaches decoded user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Try Authorization: Bearer <token>
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback to HttpOnly cookie
    else if (req.cookies?.bizchat_token) {
      token = req.cookies.bizchat_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please log in.',
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Check user still exists and is active
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated.',
      });
    }

    // 5. Attach to request
    req.user = {
      id:          user._id,
      role:        user.role,
      storeId:     user.storeId,
      permissions: user.permissions,
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    next(err);
  }
};

/**
 * optionalAuth – same as protect but does NOT reject if no token.
 * Used for public shop routes where we want to enrich request if logged in.
 */
const optionalAuth = async (req, _res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.bizchat_token) {
      token = req.cookies.bizchat_token;
    }

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id);

    if (user?.isActive) {
      req.user = {
        id:          user._id,
        role:        user.role,
        storeId:     user.storeId,
        permissions: user.permissions,
      };
    }
  } catch (_) {
    // Silently ignore — this is an optional check
  }
  next();
};

module.exports = { protect, optionalAuth };
