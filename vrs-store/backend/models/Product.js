const mongoose = require('mongoose');

const CATEGORY_VALUES = [
  '',
  'cyber_hub',
  'pentesting_tools',
  'zero_day_exploits',
  'red_team_packs',
  'cyber_courses',
  'gaming_zone',
  'steam_xbox_psn_keys',
  'fivem_scripts',
  'game_mods',
  'premium_subs',
  'netflix',
  'spotify',
  'vpns',
  'windows_office_keys',
  'ai_dev',
  'custom_ai_agents',
  'python_js_scripts',
  'web_services',
  'private_accounts',
  'rare_usernames',
  'high_level_gaming_accounts',
  'fivem',
  'maps',
  'cyber',
  'web',
  'ai',
  'accounts',
  'usernames',
  'subs',
  'discord_bots',
  'accounts_users',
];

const productSchema = new mongoose.Schema({
  title:         { type: String, required: [true,'Title required'], trim: true, maxlength: [200,'Too long'] },
  description:   { type: String, required: [true,'Description required'], maxlength: [2000] },
  price:         { type: Number, required: [true,'Price required'], min: [0,'Must be >= 0'] },
  originalPrice: { type: Number, default: null },
  discount:      { type: Number, default: 0, min: 0, max: 100 }, // %
  image:         { type: String, default: '' },
  images:        [{ type: String }],
  icon:          { type: String, default: '📦' },
  category: {
    type: String, required: true,
    enum: CATEGORY_VALUES,
  },
  parentCategory: { type: String, enum: CATEGORY_VALUES, default: '' },
  childCategory:  { type: String, enum: CATEGORY_VALUES, default: '' },
  subcategory:    { type: String, enum: CATEGORY_VALUES, default: '' },
  requiresTicket: { type: Boolean, default: false },
  badge:         { type: String, enum: ['hot','new','sale','ticket',''], default: '' },
  badgeText:     { type: String, default: '' },
  stock:         { type: Number, default: -1 },          // -1 = unlimited
  isActive:      { type: Boolean, default: true },
  isFeatured:    { type: Boolean, default: false },
  buyLink:       { type: String, default: '#' },
  tags:          [{ type: String }],
  rating:        { type: Number, default: 0, min: 0, max: 5 },
  reviewCount:   { type: Number, default: 0 },
  salesCount:    { type: Number, default: 0 },
  viewCount:     { type: Number, default: 0 },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

/* ── Virtual: discounted price ── */
productSchema.virtual('discountedPrice').get(function () {
  if (!this.discount) return this.price;
  const base = this.originalPrice !== null && this.originalPrice !== undefined ? this.originalPrice : this.price;
  return +(base * (1 - this.discount / 100)).toFixed(2);
});

/* ── Virtual: reviews ref ── */
productSchema.virtual('reviews', {
  ref: 'Review', localField: '_id', foreignField: 'product',
});

/* ── Compound indexes for common query patterns ── */
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ parentCategory: 1, childCategory: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
