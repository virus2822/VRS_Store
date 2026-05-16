const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: [true,'Username required'],
    unique: true, trim: true,
    minlength: [3,'Min 3 chars'], maxlength: [30,'Max 30 chars'],
    match: [/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'],
  },
  email: {
    type: String, required: [true,'Email required'],
    unique: true, lowercase: true, trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
  },
  password: {
    type: String, required: [true,'Password required'],
    minlength: [8,'Min 8 chars'], select: false,
  },
  role:             { type: String, enum: ['user','admin'], default: 'user' },
  avatar:           { type: String, default: '' },
  isActive:         { type: Boolean, default: true },
  isEmailVerified:  { type: Boolean, default: false },
  refreshToken:     { type: String, select: false },
  wishlist:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  recentlyViewed:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  loginAttempts:    { type: Number, default: 0 },
  lockUntil:        { type: Date },
  lastLogin:        { type: Date },
  balance:          { type: Number, default: 0, min: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (_, ret) => { delete ret.password; delete ret.refreshToken; return ret; } },
});

/* ── Indexes ── */
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

/* ── Hash password before save ── */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ── Instance methods ── */
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incrementLoginAttempts = function () {
  // Reset lock if it has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  // Lock after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 },
  });
};

module.exports = mongoose.model('User', userSchema);
