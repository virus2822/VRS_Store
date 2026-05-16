const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');
const {
  registerRules, loginRules, changePasswordRules, handleValidation,
} = require('../middleware/validate');
const ctrl = require('../controllers/authController');

/* Public */
router.post('/register', authLimiter, registerRules,    handleValidation, ctrl.register);
router.post('/login',    authLimiter, loginRules,       handleValidation, ctrl.login);
router.post('/refresh',              ctrl.refreshToken);

/* Protected */
router.post  ('/logout',          protect, ctrl.logout);
router.get   ('/me',              protect, ctrl.getMe);
router.patch ('/profile',         protect, ctrl.updateProfile);
router.patch ('/password',        protect, changePasswordRules, handleValidation, ctrl.changePassword);
router.post  ('/wishlist/:productId', protect, ctrl.toggleWishlist);

module.exports = router;
