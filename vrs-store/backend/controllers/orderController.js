const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { ApiError, ApiResponse } = require('../utils/ApiResponse');

const COUPONS = {
  VIRUS2026: 15,
};

const formatIQD = (value) => `${Number(value || 0).toLocaleString('en-US')} IQD`;

const normalizeCoupon = (couponCode) => String(couponCode || '').trim().toUpperCase();

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

const safeNotes = (notes) => String(notes || '').slice(0, 500);

exports.createOrder = async (req, res, next) => {
  try {
    const { items = [], paymentMethod, notes, couponCode } = req.body;
    if (!Array.isArray(items) || !items.length) {
      throw new ApiError(400, 'Order must contain at least one item');
    }

    const uniqueProductIds = [...new Set(items.map((item) => String(item.product)))];
    const products = await Product.find({ _id: { $in: uniqueProductIds }, isActive: true });

    if (products.length !== uniqueProductIds.length) {
      throw new ApiError(400, 'One or more products are unavailable');
    }

    const productsById = new Map(products.map((product) => [String(product._id), product]));
    const orderItems = items.map((item) => {
      const product = productsById.get(String(item.product));
      if (!product) throw new ApiError(400, 'Product is unavailable');
      const quantity = Math.max(1, Number(item.quantity || 1));

      return {
        product: product._id,
        title: product.title,
        price: calculateUnitPrice(product),
        quantity,
      };
    });

    const subtotal = +orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
    const normalizedCoupon = normalizeCoupon(couponCode);
    let couponDiscountPct = 0;

    if (normalizedCoupon) {
      if (!COUPONS[normalizedCoupon]) {
        throw new ApiError(400, 'Invalid coupon code');
      }
      couponDiscountPct = COUPONS[normalizedCoupon];
    }

    const discountValue = +(subtotal * (couponDiscountPct / 100)).toFixed(2);
    const finalTotal = Math.max(0, +(subtotal - discountValue).toFixed(2));

    if (paymentMethod === 'wallet') {
      const user = await User.findById(req.user.id);
      if (!user) throw new ApiError(404, 'User not found');
      if (Number(user.balance || 0) < finalTotal) {
        throw new ApiError(400, 'Insufficient wallet balance');
      }

      user.balance = +(Number(user.balance || 0) - finalTotal).toFixed(2);
      await user.save();

      await postDiscordWebhook([
        'Wallet purchase completed',
        `User: ${user.username || req.user.username || 'unknown'}`,
        `Payment method: wallet`,
        `Subtotal: ${formatIQD(subtotal)}`,
        couponDiscountPct > 0 ? `Coupon: ${normalizedCoupon} (${couponDiscountPct}%) -${formatIQD(discountValue)}` : 'Coupon: none',
        `Total: ${formatIQD(finalTotal)}`,
        `Items: ${orderItems.length.toLocaleString('en-US')}`,
        `Time: ${new Date().toLocaleString('en-US')}`,
      ].join('\n'));
    }

    const couponNote = couponDiscountPct > 0
      ? `coupon:${normalizedCoupon} discount:${couponDiscountPct}%`
      : 'coupon:none';

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount: finalTotal,
      paymentMethod,
      notes: safeNotes(`${notes || ''}${notes ? ' | ' : ''}${couponNote}`),
      deliveryData: {
        subtotal,
        discountValue,
        finalTotal,
        couponCode: normalizedCoupon || null,
        couponDiscountPct,
        currency: 'IQD',
      },
    });

    await postDiscordWebhook([
      'New VRS STORE order',
      `Order number: #${order.orderNumber}`,
      `Order ID: ${order._id}`,
      `Payment method: ${paymentMethod}`,
      `Subtotal: ${formatIQD(subtotal)}`,
      couponDiscountPct > 0 ? `Coupon: ${normalizedCoupon} (${couponDiscountPct}%) -${formatIQD(discountValue)}` : 'Coupon: none',
      `Total: ${formatIQD(finalTotal)}`,
    ].join('\n'));

    Promise.all(
      products.map((product) => Product.findByIdAndUpdate(product._id, { $inc: { salesCount: 1 } }))
    ).catch(() => {});

    await order.populate('items.product', 'title image icon category parentCategory childCategory');
    ApiResponse.success(res, order, 'Order created', 201);
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user.id })
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('items.product', 'title image icon category parentCategory childCategory'),
      Order.countDocuments({ user: req.user.id }),
    ]);

    ApiResponse.paginated(res, orders, {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate('items.product', 'title image icon category parentCategory childCategory');
    if (!order) throw new ApiError(404, 'Order not found');
    ApiResponse.success(res, order);
  } catch (err) {
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.status !== 'pending') {
      throw new ApiError(400, `Cannot cancel order with status "${order.status}"`);
    }

    order.status = 'cancelled';
    await order.save();
    ApiResponse.success(res, order, 'Order cancelled');
  } catch (err) {
    next(err);
  }
};

async function postDiscordWebhook(content) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  } catch (_) {
    // Webhook delivery should never block order creation.
  }
}
