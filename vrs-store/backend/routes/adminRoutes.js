const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/security');
const { objectIdParam, handleValidation } = require('../middleware/validate');
const ctrl = require('../controllers/adminController');

router.use(protect, adminOnly, adminLimiter);
router.get   ('/dashboard',           ctrl.getDashboard);
router.get   ('/users',               ctrl.getAllUsers);
router.patch ('/users/:id/toggle',    objectIdParam(), handleValidation, ctrl.toggleUserActive);
router.get   ('/orders',              ctrl.getAllOrders);
router.patch ('/orders/:id/status',   objectIdParam(), handleValidation, ctrl.updateOrderStatus);

module.exports = router;
