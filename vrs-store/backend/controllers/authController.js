const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError, ApiResponse } = require('../utils/ApiResponse');

/* ── Token helpers ── */
const signAccess   = (id) => jwt.sign({ id }, process.env.JWT_SECRET,         { expiresIn: process.env.JWT_EXPIRES || '7d' });
const signRefresh  = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

const sendTokens = (res, user, statusCode = 200) => {
  const token        = signAccess(user._id);
  const refreshToken = signRefresh(user._id);
  user.refreshToken  = refreshToken;
  user.save({ validateBeforeSave: false }); // fire-and-forget
  user.password     = undefined;
  user.refreshToken = undefined;
  ApiResponse.success(res, { user, token, refreshToken }, 'OK', statusCode);
};

/* ── Register ── */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });
    sendTokens(res, user, 201);
  } catch (err) { next(err); }
};

/* ── Login ── */
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    }).select('+password +loginAttempts +lockUntil +refreshToken');

    if (!user)           throw new ApiError(401, 'Invalid credentials');
    if (user.isLocked()) throw new ApiError(429, 'Account temporarily locked — try again in 2 hours');
    if (!user.isActive)  throw new ApiError(401, 'Account disabled');

    const valid = await user.comparePassword(password);
    if (!valid) {
      await user.incrementLoginAttempts();
      throw new ApiError(401, 'Invalid credentials');
    }

    await user.resetLoginAttempts();
    sendTokens(res, user);
  } catch (err) { next(err); }
};

/* ── Refresh Access Token ── */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ApiError(401, 'Refresh token required');

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) throw new ApiError(401, 'Invalid refresh token');

    const newToken = signAccess(user._id);
    ApiResponse.success(res, { token: newToken }, 'Token refreshed');
  } catch (err) {
    if (['JsonWebTokenError','TokenExpiredError'].includes(err.name)) {
      return next(new ApiError(401, 'Invalid or expired refresh token'));
    }
    next(err);
  }
};

/* ── Logout ── */
exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    ApiResponse.success(res, null, 'Logged out');
  } catch (err) { next(err); }
};

/* ── Get current user ── */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('wishlist', 'title price image icon category')
      .populate('recentlyViewed', 'title price image icon');
    ApiResponse.success(res, user);
  } catch (err) { next(err); }
};

/* ── Update profile ── */
exports.updateProfile = async (req, res, next) => {
  try {
    const ALLOWED = ['username', 'avatar'];
    const updates = {};
    ALLOWED.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    ApiResponse.success(res, user, 'Profile updated');
  } catch (err) { next(err); }
};

/* ── Change password ── */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!await user.comparePassword(currentPassword)) {
      throw new ApiError(401, 'Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    ApiResponse.success(res, null, 'Password changed');
  } catch (err) { next(err); }
};

/* ── Toggle wishlist ── */
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    const idx  = user.wishlist.indexOf(productId);
    if (idx === -1) user.wishlist.push(productId);
    else            user.wishlist.splice(idx, 1);
    await user.save();
    ApiResponse.success(res, user.wishlist, idx === -1 ? 'Added to wishlist' : 'Removed from wishlist');
  } catch (err) { next(err); }
};
