const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, trim: true, maxlength: 100 },
  comment: { type: String, trim: true, maxlength: 1000 },
  isVerifiedPurchase: { type: Boolean, default: false },
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

/* One review per user per product */
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

/* Auto-recalculate product rating after every save/delete */
async function recalcRating(productId) {
  const Review  = mongoose.model('Review');
  const Product = mongoose.model('Product');
  const [stats] = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, stats
    ? { rating: +stats.avgRating.toFixed(1), reviewCount: stats.count }
    : { rating: 0, reviewCount: 0 }
  );
}

reviewSchema.post('save',              async function ()    { await recalcRating(this.product); });
reviewSchema.post('findOneAndDelete',  async function (doc) { if (doc) await recalcRating(doc.product); });

module.exports = mongoose.model('Review', reviewSchema);
