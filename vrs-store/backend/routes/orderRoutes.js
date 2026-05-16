const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { orderRules, objectIdParam, handleValidation } = require('../middleware/validate');
const ctrl = require('../controllers/orderController');

router.use(protect);
router.post('/',             orderRules, handleValidation, ctrl.createOrder);
router.get('/',              ctrl.getMyOrders);
router.get('/:id',           objectIdParam(), handleValidation, ctrl.getOrder);
router.patch('/:id/cancel',  objectIdParam(), handleValidation, ctrl.cancelOrder);

module.exports = router;
