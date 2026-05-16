const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const { ApiError } = require('../utils/ApiResponse');

/* ── Verify JWT — blocks if missing/invalid ── */
exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) throw new ApiError(401, 'Authentication required');

    const token   = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user)          throw new ApiError(401, 'User not found');
    if (!user.isActive) throw new ApiError(401, 'Account disabled');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError')  return next(new ApiError(401, 'Invalid token'));
    if (err.name === 'TokenExpiredError')  return next(new ApiError(401, 'Token expired — please login again'));
    next(err);
  }
};

/* ── Admin only — must be used AFTER protect ── */
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Admin access required'));
  next();
};

/* ── Optional auth — attaches user if token present, does not fail ── */
exports.optionalAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      const token   = auth.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
    }
  } catch { /* silent — guest access */ }
  next();
};
