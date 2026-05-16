const mongoose = require('mongoose');
const { v4: uuid } = require('uuid');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title:    { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String, unique: true,
    default: () => `VRS-${Date.now()}-${uuid().slice(0,6).toUpperCase()}`,
  },
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:         [orderItemSchema],
  totalAmount:   { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending','processing','completed','cancelled','refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String, required: true,
    enum: ['crypto','paypal','usdt','manual','wallet'],
  },
  paymentStatus: {
    type: String, enum: ['unpaid','paid','refunded'], default: 'unpaid',
  },
  notes:        { type: String, maxlength: 500 },
  deliveryData: { type: mongoose.Schema.Types.Mixed }, // for digital delivery info
}, { timestamps: true });

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
