const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');
const { ApiError, ApiResponse } = require('../utils/ApiResponse');

const TAXONOMY = [
  {
    id: 'cyber_hub',
    name: 'Cyber Hub',
    children: [
      { id: 'pentesting_tools', name: 'Pentesting Tools' },
      { id: 'zero_day_exploits', name: '0-day Exploits' },
      { id: 'red_team_packs', name: 'Red Team Packs' },
      { id: 'cyber_courses', name: 'Courses' },
    ],
  },
  {
    id: 'gaming_zone',
    name: 'Gaming Zone',
    children: [
      { id: 'steam_xbox_psn_keys', name: 'Steam/Xbox/PSN Keys' },
      { id: 'fivem_scripts', name: 'FiveM Scripts' },
      { id: 'game_mods', name: 'Game Mods' },
    ],
  },
  {
    id: 'premium_subs',
    name: 'Premium Subs',
    children: [
      { id: 'netflix', name: 'Netflix' },
      { id: 'spotify', name: 'Spotify' },
      { id: 'vpns', name: 'VPNs' },
      { id: 'windows_office_keys', name: 'Windows/Office Keys' },
    ],
  },
  {
    id: 'ai_dev',
    name: 'AI & Dev',
    children: [
      { id: 'custom_ai_agents', name: 'Custom AI Agents' },
      { id: 'python_js_scripts', name: 'Python/JS Scripts' },
      { id: 'web_services', name: 'Web Services' },
    ],
  },
  {
    id: 'private_accounts',
    name: 'Private Accounts',
    children: [
      { id: 'rare_usernames', name: 'Rare Usernames' },
      { id: 'high_level_gaming_accounts', name: 'High-Level Gaming Accounts' },
    ],
  },
];

const LEGACY_CATEGORY_ALIASES = {
  cyber: 'pentesting_tools',
  hacking: 'pentesting_tools',
  fivem: 'fivem_scripts',
  maps: 'game_mods',
  subs: 'netflix',
  subscriptions: 'netflix',
  web: 'web_services',
  ai: 'custom_ai_agents',
  accounts: 'high_level_gaming_accounts',
  usernames: 'rare_usernames',
  accounts_users: 'private_accounts',
  discord_bots: 'python_js_scripts',
};

const SORT_MAP = {
  newest: '-createdAt',
  oldest: 'createdAt',
  price_asc: 'price',
  price_desc: '-price',
  rating: '-rating',
  popular: '-salesCount',
};

const normalizeCategory = (value) => {
  const key = String(value || '').trim().toLowerCase();
  return LEGACY_CATEGORY_ALIASES[key] || key;
};

const parentById = (id) => TAXONOMY.find((parent) => parent.id === id);

const parentForChild = (childId) => {
  for (const parent of TAXONOMY) {
    if (parent.children.some((child) => child.id === childId)) return parent;
  }
  return null;
};

const firstChildForParent = (parentId) => parentById(parentId)?.children?.[0]?.id || '';

const resolveCategoryPath = (payload = {}) => {
  const raw = normalizeCategory(
    payload.childCategory ||
    payload.subcategory ||
    payload.category ||
    payload.cat ||
    ''
  );

  if (!raw || raw === 'all') {
    return {
      parentCategory: 'gaming_zone',
      childCategory: 'steam_xbox_psn_keys',
    };
  }

  const rawParent = parentById(raw);
  if (rawParent) {
    return {
      parentCategory: rawParent.id,
      childCategory: normalizeCategory(payload.childCategory || payload.subcategory) || firstChildForParent(rawParent.id),
    };
  }

  const parent = parentForChild(raw);
  if (parent) {
    return {
      parentCategory: parent.id,
      childCategory: raw,
    };
  }

  return {
    parentCategory: payload.parentCategory || 'gaming_zone',
    childCategory: raw,
  };
};

const categoryCandidates = (category) => {
  const selected = normalizeCategory(category);
  if (!selected || selected === 'all') return null;

  const parent = parentById(selected);
  if (parent) {
    const childIds = parent.children.map((child) => child.id);
    const legacyIds = Object.entries(LEGACY_CATEGORY_ALIASES)
      .filter(([, mapped]) => childIds.includes(mapped) || mapped === parent.id)
      .map(([legacy]) => legacy);

    return {
      isParent: true,
      parentId: parent.id,
      childIds,
      allIds: [parent.id, ...childIds, ...legacyIds],
    };
  }

  const childParent = parentForChild(selected);
  const legacyIds = Object.entries(LEGACY_CATEGORY_ALIASES)
    .filter(([, mapped]) => mapped === selected)
    .map(([legacy]) => legacy);

  return {
    isParent: false,
    parentId: childParent?.id || '',
    childIds: [selected],
    allIds: [selected, ...legacyIds],
  };
};

const buildFilter = (query) => {
  const filter = { isActive: true };

  const category = categoryCandidates(query.category);
  if (category) {
    filter.$or = [
      { childCategory: { $in: category.childIds } },
      { subcategory: { $in: category.childIds } },
      { category: { $in: category.allIds } },
    ];
    if (category.isParent) {
      filter.$or.unshift({ parentCategory: category.parentId });
    }
  }

  if (query.badge) filter.badge = query.badge;
  if (query.featured === 'true') filter.isFeatured = true;

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.search) filter.$text = { $search: query.search };

  return filter;
};

const calculateUnitPrice = (product) => {
  const price = Number(product.price || 0);
  const originalPrice = product.originalPrice !== null && product.originalPrice !== undefined
    ? Number(product.originalPrice)
    : price;
  const discount = Math.max(0, Math.min(100, Number(product.discount || product.discountPercentage || 0)));

  if (!Number.isFinite(originalPrice)) return 0;
  if (!discount) return Number(price.toFixed(2));
  return +(originalPrice * (1 - discount / 100)).toFixed(2);
};

const decorateProduct = (product) => {
  const obj = typeof product.toObject === 'function'
    ? product.toObject({ virtuals: true })
    : { ...product };

  const path = resolveCategoryPath(obj);
  const parent = parentById(path.parentCategory);
  const child = parent?.children.find((item) => item.id === path.childCategory);
  const unitPrice = calculateUnitPrice(obj);

  return {
    ...obj,
    legacyCategory: obj.category,
    category: path.childCategory,
    parentCategory: path.parentCategory,
    childCategory: path.childCategory,
    categoryPath: {
      parent: parent?.name || path.parentCategory,
      child: child?.name || path.childCategory,
    },
    finalPrice: unitPrice,
    discountedPrice: unitPrice,
    requiresTicket: Boolean(obj.requiresTicket || path.parentCategory === 'cyber_hub' || path.childCategory === 'custom_ai_agents'),
  };
};

const normalizePricing = (payload = {}) => {
  const data = { ...payload };
  const originalPrice = Number(data.originalPrice ?? data.price ?? 0);
  const discount = Math.max(0, Math.min(100, Number(data.discountPercentage ?? data.discount ?? 0) || 0));
  const safeOriginal = Number.isFinite(originalPrice) ? originalPrice : 0;
  const path = resolveCategoryPath(data);

  data.price = safeOriginal;
  data.originalPrice = discount > 0 ? safeOriginal : (data.originalPrice ?? null);
  data.discount = discount;
  data.discountPercentage = discount;
  data.category = path.childCategory;
  data.parentCategory = path.parentCategory;
  data.childCategory = path.childCategory;
  data.requiresTicket = Boolean(data.requiresTicket || path.parentCategory === 'cyber_hub' || path.childCategory === 'custom_ai_agents');

  return data;
};

exports.getProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 24));
    const skip = (page - 1) * limit;
    const sort = SORT_MAP[req.query.sort] || '-createdAt';
    const filter = buildFilter(req.query);

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).select('-__v'),
      Product.countDocuments(filter),
    ]);

    ApiResponse.paginated(res, products.map(decorateProduct), {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

exports.getFeatured = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .sort('-salesCount')
      .limit(8)
      .select('-__v');
    ApiResponse.success(res, products.map(decorateProduct));
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .select('category parentCategory childCategory subcategory price originalPrice discount rating')
      .lean();

    const counts = new Map();
    const ratings = new Map();
    const minPrices = new Map();

    products.forEach((product) => {
      const decorated = decorateProduct(product);
      const parentKey = decorated.parentCategory;
      const childKey = decorated.childCategory;
      const price = calculateUnitPrice(decorated);

      [parentKey, childKey].forEach((key) => {
        counts.set(key, (counts.get(key) || 0) + 1);
        ratings.set(key, [...(ratings.get(key) || []), Number(product.rating || 0)]);
        minPrices.set(key, Math.min(minPrices.get(key) ?? price, price));
      });
    });

    const response = TAXONOMY.map((parent) => ({
      id: parent.id,
      name: parent.name,
      count: counts.get(parent.id) || 0,
      avgRating: average(ratings.get(parent.id)),
      minPrice: minPrices.get(parent.id) || 0,
      children: parent.children.map((child) => ({
        id: child.id,
        name: child.name,
        count: counts.get(child.id) || 0,
        avgRating: average(ratings.get(child.id)),
        minPrice: minPrices.get(child.id) || 0,
      })),
    }));

    ApiResponse.success(res, response);
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'username avatar' },
        options: { sort: { createdAt: -1 }, limit: 20 },
      });

    if (!product || !product.isActive) throw new ApiError(404, 'Product not found');

    Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec();

    if (req.user) {
      User.findByIdAndUpdate(req.user.id, {
        $pull: { recentlyViewed: product._id },
      }).then(() =>
        User.findByIdAndUpdate(req.user.id, {
          $push: { recentlyViewed: { $each: [product._id], $position: 0, $slice: 10 } },
        })
      ).catch(() => {});
    }

    ApiResponse.success(res, decorateProduct(product));
  } catch (err) {
    next(err);
  }
};

exports.getRelated = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).select('category parentCategory childCategory subcategory tags');
    if (!product) throw new ApiError(404, 'Product not found');

    const path = resolveCategoryPath(product);
    const candidates = categoryCandidates(path.childCategory);
    const related = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [
        { parentCategory: path.parentCategory },
        { childCategory: path.childCategory },
        { category: { $in: candidates?.allIds || [path.childCategory] } },
        { tags: { $in: product.tags || [] } },
      ],
    }).sort('-salesCount').limit(6).select('-__v');

    ApiResponse.success(res, related.map(decorateProduct));
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const normalized = normalizePricing(req.body);
    const product = await Product.create({ ...normalized, createdBy: req.user.id });
    ApiResponse.success(res, decorateProduct(product), 'Product created', 201);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const normalized = normalizePricing(req.body);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      normalized,
      { new: true, runValidators: true }
    );
    if (!product) throw new ApiError(404, 'Product not found');
    ApiResponse.success(res, decorateProduct(product), 'Product updated');
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!product) throw new ApiError(404, 'Product not found');
    ApiResponse.success(res, null, 'Product removed');
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const exists = await Review.findOne({ product: req.params.id, user: req.user.id });
    if (exists) throw new ApiError(409, 'You already reviewed this product');

    const review = await Review.create({
      product: req.params.id,
      user: req.user.id,
      rating,
      title,
      comment,
    });

    const stats = await Review.aggregate([
      { $match: { product: review.product } },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const avgRating = stats[0]?.avgRating || 0;
    const totalReviews = stats[0]?.totalReviews || 0;

    await Product.findByIdAndUpdate(req.params.id, {
      rating: Number(avgRating.toFixed(2)),
      reviewCount: totalReviews,
    });

    await review.populate('user', 'username avatar');
    ApiResponse.success(res, review, 'Review submitted', 201);
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.reviewId }
      : { _id: req.params.reviewId, user: req.user.id };

    const review = await Review.findOneAndDelete(filter);
    if (!review) throw new ApiError(404, 'Review not found or not yours');
    ApiResponse.success(res, null, 'Review deleted');
  } catch (err) {
    next(err);
  }
};

function average(values = []) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length).toFixed(2));
}
