const router = require('express').Router();
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { searchLimiter } = require('../middleware/security');
const {
  productRules, reviewRules, paginationRules,
  objectIdParam, handleValidation,
} = require('../middleware/validate');
const ctrl = require('../controllers/productController');

/* Public / optional auth */
router.get('/',           searchLimiter, paginationRules, handleValidation, optionalAuth, ctrl.getProducts);
router.get('/featured',   ctrl.getFeatured);
router.get('/categories', ctrl.getCategories);
router.get('/:id',        objectIdParam(), handleValidation, optionalAuth, ctrl.getProduct);
router.get('/:id/related',objectIdParam(), handleValidation, ctrl.getRelated);

/* Reviews (auth required) */
router.post  ('/:id/reviews',            objectIdParam(), handleValidation, protect, reviewRules, handleValidation, ctrl.createReview);
router.delete('/:id/reviews/:reviewId',  protect, ctrl.deleteReview);

/* Admin CRUD */
router.post  ('/',    protect, adminOnly, productRules, handleValidation, ctrl.createProduct);
router.put   ('/:id', protect, adminOnly, objectIdParam(), productRules, handleValidation, ctrl.updateProduct);
router.delete('/:id', protect, adminOnly, objectIdParam(), handleValidation, ctrl.deleteProduct);

module.exports = router;
