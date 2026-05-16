const User    = require('../models/User');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const { ApiError, ApiResponse } = require('../utils/ApiResponse');

/* ── GET /admin/dashboard ── */
exports.getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers, totalProducts, totalOrders,
      recentOrders, topProducts, revenueData, ordersByStatus,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.find().sort('-createdAt').limit(10)
        .populate('user', 'username email'),
      Product.find({ isActive: true }).sort('-salesCount').limit(5)
        .select('title salesCount rating icon'),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    ApiResponse.success(res, {
      stats: {
        users:       totalUsers,
        products:    totalProducts,
        orders:      totalOrders,
        revenue:     revenueData[0]?.total || 0,
        paidOrders:  revenueData[0]?.count || 0,
      },
      recentOrders,
      topProducts,
      ordersByStatus: Object.fromEntries(ordersByStatus.map(s => [s._id, s.count])),
    });
  } catch (err) { next(err); }
};

/* ── GET /admin/users ── */
exports.getAllUsers = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const filter = {};
    if (req.query.role)   filter.role     = req.query.role;
    if (req.query.active) filter.isActive = req.query.active === 'true';

    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt')
        .skip((page-1)*limit).limit(limit)
        .select('-password -refreshToken'),
      User.countDocuments(filter),
    ]);
    ApiResponse.paginated(res, users, { total, page, limit, pages: Math.ceil(total/limit) });
  } catch (err) { next(err); }
};

/* ── PATCH /admin/users/:id/toggle ── */
exports.toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.role === 'admin') throw new ApiError(403, 'Cannot deactivate admin accounts');
    user.isActive = !user.isActive;
    await user.save();
    ApiResponse.success(res, { isActive: user.isActive },
      `User ${user.isActive ? 'activated' : 'deactivated'}`
    );
  } catch (err) { next(err); }
};

/* ── GET /admin/orders ── */
exports.getAllOrders = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const filter = {};
    if (req.query.status)        filter.status        = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort('-createdAt')
        .skip((page-1)*limit).limit(limit)
        .populate('user', 'username email'),
      Order.countDocuments(filter),
    ]);
    ApiResponse.paginated(res, orders, { total, page, limit, pages: Math.ceil(total/limit) });
  } catch (err) { next(err); }
};

/* ── PATCH /admin/orders/:id/status ── */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const VALID_STATUS  = ['pending','processing','completed','cancelled','refunded'];
    const VALID_PAYMENT = ['unpaid','paid','refunded'];

    const { status, paymentStatus } = req.body;
    const updates = {};
    if (status        && VALID_STATUS.includes(status))         updates.status        = status;
    if (paymentStatus && VALID_PAYMENT.includes(paymentStatus)) updates.paymentStatus = paymentStatus;
    if (!Object.keys(updates).length) throw new ApiError(400, 'No valid fields to update');

    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('user', 'username email');
    if (!order) throw new ApiError(404, 'Order not found');
    ApiResponse.success(res, order, 'Order updated');
  } catch (err) { next(err); }
};
