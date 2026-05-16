/* ── Order Routes ── */
const orderRouter = require('express').Router();
const { protect } = require('../middleware/auth');
const { orderRules, objectIdParam, handleValidation } = require('../middleware/validate');
const orderCtrl = require('../controllers/orderController');

orderRouter.use(protect);
orderRouter.post('/',                orderRules, handleValidation, orderCtrl.createOrder);
orderRouter.get('/',                 orderCtrl.getMyOrders);
orderRouter.get('/:id',             objectIdParam(), handleValidation, orderCtrl.getOrder);
orderRouter.patch('/:id/cancel',    objectIdParam(), handleValidation, orderCtrl.cancelOrder);

module.exports.orderRoutes = orderRouter;

/* ── Admin Routes ── */
const adminRouter = require('express').Router();
const { adminOnly } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/security');
const { objectIdParam: oid } = require('../middleware/validate');
const adminCtrl = require('../controllers/adminController');

adminRouter.use(protect, adminOnly, adminLimiter);
adminRouter.get   ('/dashboard',             adminCtrl.getDashboard);
adminRouter.get   ('/users',                 adminCtrl.getAllUsers);
adminRouter.patch ('/users/:id/toggle',      oid(), handleValidation, adminCtrl.toggleUserActive);
adminRouter.get   ('/orders',                adminCtrl.getAllOrders);
adminRouter.patch ('/orders/:id/status',     oid(), handleValidation, adminCtrl.updateOrderStatus);

module.exports.adminRoutes = adminRouter;
