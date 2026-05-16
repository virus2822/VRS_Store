const { body, param, query, validationResult } = require('express-validator');
const { ApiError } = require('../utils/ApiResponse');

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

/* ── Run after rule arrays — collects and throws on first error batch ── */
exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map(e => e.msg).join(' | ');
    return next(new ApiError(400, msg));
  }
  next();
};

/* ── Auth rules ── */
exports.registerRules = [
  body('username').trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username: 3–30 chars')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username: letters, numbers, underscores only'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password: min 8 characters')
    .matches(/[A-Z]/).withMessage('Password: needs at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password: needs at least one number'),
];

exports.loginRules = [
  body('identifier').trim().notEmpty().withMessage('Username or email required'),
  body('password').notEmpty().withMessage('Password required'),
];

exports.changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password: min 8 characters')
    .matches(/[A-Z]/).withMessage('New password needs uppercase')
    .matches(/[0-9]/).withMessage('New password needs a number'),
];

/* ── Product rules ── */
exports.productRules = [
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title: 2–200 chars'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description: 10–2000 chars'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be ≥ 0'),
  body('category')
    .notEmpty().withMessage('Category required')
    .isIn(CATEGORY_VALUES)
    .withMessage('Invalid category'),
  body('parentCategory').optional().isIn(CATEGORY_VALUES).withMessage('Invalid parent category'),
  body('childCategory').optional().isIn(CATEGORY_VALUES).withMessage('Invalid child category'),
  body('subcategory').optional().isIn(CATEGORY_VALUES).withMessage('Invalid subcategory'),
  body('discount').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount: 0–100'),
  body('badge').optional().isIn(['hot','new','sale','ticket','']).withMessage('Invalid badge'),
];

/* ── Review rules ── */
exports.reviewRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('title').optional().trim().isLength({ max: 100 }).withMessage('Review title too long'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment too long'),
];

/* ── Order rules ── */
exports.orderRules = [
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.product').notEmpty().withMessage('Each item must have a product ID'),
  body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be >= 1'),
  body('paymentMethod')
    .isIn(['crypto','paypal','usdt','manual','wallet'])
    .withMessage('Invalid payment method'),
];

/* ── Pagination rules (query params) ── */
exports.paginationRules = [
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt().withMessage('Limit: 1-200'),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
];

/* ── ObjectId param validation ── */
exports.objectIdParam = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
];
