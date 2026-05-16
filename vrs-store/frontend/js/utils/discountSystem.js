/* ================================================================
   DISCOUNT SYSTEM.JS - Advanced Discount Logic Engine
   VRS STORE V7.0 MIDNIGHT COBALT EDITION
   
   Features:
   - Coupon validation against Coupons object
   - Percentage and fixed amount discount support
   - Success badges and click sounds
   - Exact savings amount display
   - Humanized error messages
   - Auto-calculation with base currency
   ================================================================ */

window.DiscountSystem = {
  // Coupon database (can be extended with admin interface)
  coupons: {
    'VIRUS2026': {
      type: 'percentage',
      value: 15,
      description: '15% off all products',
      maxUses: 1000,
      currentUses: 0,
      expires: '2026-12-31',
      minAmount: 5000,
      categories: ['all'],
      userLimit: 1,
      active: true
    },
    'SAVE10': {
      type: 'percentage',
      value: 10,
      description: '10% off orders above 10,000 IQD',
      maxUses: 500,
      currentUses: 0,
      expires: '2026-06-30',
      minAmount: 10000,
      categories: ['all'],
      userLimit: 3,
      active: true
    },
    'FLAT5000': {
      type: 'fixed',
      value: 5000,
      description: '5,000 IQD off your order',
      maxUses: 200,
      currentUses: 0,
      expires: '2026-05-31',
      minAmount: 20000,
      categories: ['all'],
      userLimit: 2,
      active: true
    },
    'WELCOME': {
      type: 'percentage',
      value: 20,
      description: '20% off for new users',
      maxUses: 100,
      currentUses: 0,
      expires: '2026-12-31',
      minAmount: 0,
      categories: ['all'],
      userLimit: 1,
      active: true,
      newUsersOnly: true
    },
    'CYBER25': {
      type: 'percentage',
      value: 25,
      description: '25% off Cyber Hub products',
      maxUses: 50,
      currentUses: 0,
      expires: '2026-08-31',
      minAmount: 25000,
      categories: ['cyber_hub'],
      userLimit: 2,
      active: true
    }
  },

  // Current applied coupon
  currentCoupon: null,
  appliedDiscount: 0,
  originalTotal: 0,

  // User coupon usage tracking
  userCouponHistory: JSON.parse(localStorage.getItem('vrs_coupon_history') || '{}'),

  /**
   * Initialize the discount system
   */
  init() {
    this.bindEvents();
    this.loadSavedCoupon();
  },

  /**
   * Validate coupon against all rules
   */
  validateCoupon(code, cartTotal = 0, user = null) {
    const coupon = this.coupons[code.toUpperCase()];
    
    if (!coupon) {
      return {
        valid: false,
        error: 'Oops! This code doesn\'t seem to work. Try another?',
        code: 'NOT_FOUND'
      };
    }

    if (!coupon.active) {
      return {
        valid: false,
        error: 'This coupon is currently inactive.',
        code: 'INACTIVE'
      };
    }

    // Check expiration
    if (coupon.expires && new Date(coupon.expires) < new Date()) {
      return {
        valid: false,
        error: 'This coupon has expired. Check for new deals!',
        code: 'EXPIRED'
      };
    }

    // Check usage limits
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return {
        valid: false,
        error: 'This coupon has reached its usage limit.',
        code: 'MAX_USES'
      };
    }

    // Check minimum amount
    if (coupon.minAmount && cartTotal < coupon.minAmount) {
      const minFormatted = CurrencyConverter.formatCurrency(coupon.minAmount);
      return {
        valid: false,
        error: `Minimum order of ${minFormatted} required for this coupon.`,
        code: 'MIN_AMOUNT'
      };
    }

    // Check category restrictions
    if (coupon.categories && !coupon.categories.includes('all')) {
      const hasValidCategory = this.validateCategories(coupon.categories);
      if (!hasValidCategory) {
        return {
          valid: false,
          error: 'This coupon is only valid for specific categories.',
          code: 'CATEGORY_RESTRICTION'
        };
      }
    }

    // Check user-specific limits
    if (user && coupon.userLimit) {
      const userUsage = this.userCouponHistory[user.username]?.[code] || 0;
      if (userUsage >= coupon.userLimit) {
        return {
          valid: false,
          error: `You've used this coupon ${userUsage} times. Limit is ${coupon.userLimit}.`,
          code: 'USER_LIMIT'
        };
      }
    }

    // Check new user restriction
    if (coupon.newUsersOnly && user && !this.isNewUser(user)) {
      return {
        valid: false,
        error: 'This coupon is only for new users.',
        code: 'NEW_USERS_ONLY'
      };
    }

    return {
      valid: true,
      coupon: coupon,
      code: 'VALID'
    };
  },

  /**
   * Check if cart contains valid categories for coupon
   */
  validateCategories(requiredCategories) {
    const cart = Store.cart?.items() || [];
    return cart.some(item => {
      const product = ProductList.getProduct(item.id);
      return product && requiredCategories.includes(product.parentCategory);
    });
  },

  /**
   * Check if user is considered new
   */
  isNewUser(user) {
    if (!user) return false;
    const createdAt = new Date(user.createdAt || 0);
    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation <= 7; // New users within 7 days
  },

  /**
   * Calculate discount amount
   */
  calculateDiscount(coupon, total) {
    if (coupon.type === 'percentage') {
      return Math.round(total * (coupon.value / 100));
    } else if (coupon.type === 'fixed') {
      return Math.min(coupon.value, total); // Can't discount more than total
    }
    return 0;
  },

  /**
   * Apply coupon to cart
   */
  applyCoupon(code) {
    const cart = Store.cart?.items() || [];
    const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const user = Store.auth?.getUser?.() || null;

    // Validate coupon
    const validation = this.validateCoupon(code, cartTotal, user);
    
    if (!validation.valid) {
      this.showError(validation.error);
      return false;
    }

    const coupon = validation.coupon;
    const discountAmount = this.calculateDiscount(coupon, cartTotal);
    const finalTotal = cartTotal - discountAmount;

    // Store coupon info
    this.currentCoupon = coupon;
    this.originalTotal = cartTotal;
    this.appliedDiscount = discountAmount;

    // Update coupon usage
    this.updateCouponUsage(code, user);

    // Update UI
    this.updateCouponUI(coupon, discountAmount, finalTotal);
    
    // Show success feedback
    this.showSuccess(coupon, discountAmount);

    // Play success sound
    this.playSuccessSound();

    // Save applied coupon
    localStorage.setItem('vrs_applied_coupon', JSON.stringify({
      code: code.toUpperCase(),
      discount: discountAmount,
      originalTotal: cartTotal,
      finalTotal: finalTotal,
      appliedAt: new Date().toISOString()
    }));

    return true;
  },

  /**
   * Remove applied coupon
   */
  removeCoupon() {
    this.currentCoupon = null;
    this.appliedDiscount = 0;
    this.originalTotal = 0;
    
    localStorage.removeItem('vrs_applied_coupon');
    
    this.updateCouponUI(null, 0, 0);
    Toast.show('Coupon removed', 'info', 'fas fa-times-circle');
  },

  /**
   * Lock coupon after successful purchase (one-time use enforcement)
   */
  lockCoupon(code) {
    if (!code) code = this.getCurrentCoupon()?.code;
    if (!code) return;
    
    const usedCodes = JSON.parse(localStorage.getItem('used_codes') || '[]');
    if (!usedCodes.includes(code.toUpperCase())) {
      usedCodes.push(code.toUpperCase());
      localStorage.setItem('used_codes', JSON.stringify(usedCodes));
    }
  },

  /**
   * Update coupon usage tracking
   */
  updateCouponUsage(code, user) {
    // Update global usage
    if (this.coupons[code]) {
      this.coupons[code].currentUses++;
    }

    // Update user-specific usage
    if (user) {
      if (!this.userCouponHistory[user.username]) {
        this.userCouponHistory[user.username] = {};
      }
      if (!this.userCouponHistory[user.username][code]) {
        this.userCouponHistory[user.username][code] = 0;
      }
      this.userCouponHistory[user.username][code]++;
      
      localStorage.setItem('vrs_coupon_history', JSON.stringify(this.userCouponHistory));
    }
  },

  /**
   * Update coupon UI elements
   */
  updateCouponUI(coupon, discountAmount, finalTotal) {
    const couponWrap = document.getElementById('cartCouponWrap');
    const cartTotal = document.getElementById('cartTotal');
    const couponCode = coupon ? Object.keys(this.coupons).find(key => this.coupons[key] === coupon) : '';
    
    if (!couponWrap) return;

    if (coupon) {
      const savingsText = this.formatSavings(discountAmount);
      couponWrap.innerHTML = `
        <div class="coupon-applied">
          <div class="coupon-badge">
            <i class="fas fa-tag"></i>
            <span>${couponCode.toUpperCase()}</span>
            <button class="coupon-remove" onclick="DiscountSystem.removeCoupon()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="coupon-savings">
            <span class="savings-text">${savingsText}</span>
          </div>
        </div>
      `;

      // Update cart total with discount
      if (cartTotal) {
        const cart = Store.cart?.items() || [];
        const currentTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const newTotal = currentTotal - discountAmount;
        cartTotal.textContent = CurrencyConverter.formatCurrency(newTotal);
      }
    } else {
      couponWrap.innerHTML = '';
      // Reset cart total to original
      if (cartTotal) {
        const cart = Store.cart?.items() || [];
        const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        cartTotal.textContent = CurrencyConverter.formatCurrency(total);
      }
    }
  },

  /**
   * Format savings message
   */
  formatSavings(amount) {
    const formatted = CurrencyConverter.formatCurrency(amount);
    return `You just saved ${formatted}! 🎉`;
  },

  /**
   * Show success feedback
   */
  showSuccess(coupon, savings) {
    const savingsText = this.formatSavings(savings);
    Toast.show(savingsText, 'success', 'fas fa-check-circle');
    
    // Add visual feedback to cart
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
      cartSidebar.classList.add('coupon-success');
      setTimeout(() => {
        cartSidebar.classList.remove('coupon-success');
      }, 2000);
    }
  },

  /**
   * Show error feedback
   */
  showError(message) {
    Toast.show(message, 'error', 'fas fa-exclamation-triangle');
    
    // Shake animation for coupon input
    const couponInput = document.getElementById('couponInput');
    if (couponInput) {
      couponInput.classList.add('error-shake');
      setTimeout(() => {
        couponInput.classList.remove('error-shake');
      }, 600);
    }
  },

  /**
   * Play success sound effect
   */
  playSuccessSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi6Gy/DaiTkGHWnA7+OZURE');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silent fail if audio is blocked
      });
    } catch (error) {
      // Silent fail
    }
  },

  /**
   * Load saved coupon from localStorage
   */
  loadSavedCoupon() {
    const saved = localStorage.getItem('vrs_applied_coupon');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Re-apply coupon if it's still valid and recent (within 30 minutes)
        const appliedAt = new Date(data.appliedAt);
        const now = new Date();
        const diffMinutes = (now - appliedAt) / (1000 * 60);
        
        if (diffMinutes < 30) {
          // Re-validate coupon
          const validation = this.validateCoupon(data.code);
          if (validation.valid) {
            this.currentCoupon = validation.coupon;
            this.originalTotal = data.originalTotal;
            this.appliedDiscount = data.discount;
            this.updateCouponUI(validation.coupon, data.discount, data.finalTotal);
          }
        } else {
          // Remove expired saved coupon
          localStorage.removeItem('vrs_applied_coupon');
        }
      } catch (error) {
        localStorage.removeItem('vrs_applied_coupon');
      }
    }
  },

  /**
   * Bind coupon input events
   */
  bindEvents() {
    // Add coupon input to cart if not exists
    this.addCouponInput();

    // Listen for cart updates
    document.addEventListener('cart:updated', () => {
      if (this.currentCoupon) {
        // Re-calculate discount with new cart total
        const cart = Store.cart?.items() || [];
        const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const newDiscount = this.calculateDiscount(this.currentCoupon, cartTotal);
        
        if (newDiscount !== this.appliedDiscount) {
          this.appliedDiscount = newDiscount;
          this.updateCouponUI(this.currentCoupon, newDiscount, cartTotal - newDiscount);
        }
      }
    });

    // Listen for user login
    document.addEventListener('auth:login', () => {
      // Re-validate current coupon for new user
      if (this.currentCoupon) {
        const user = Store.auth.getUser();
        const validation = this.validateCoupon(Object.keys(this.coupons).find(key => this.coupons[key] === this.currentCoupon), this.originalTotal, user);
        
        if (!validation.valid) {
          this.removeCoupon();
          this.showError(validation.error);
        }
      }
    });
  },

  /**
   * Add coupon input to cart sidebar
   */
  addCouponInput() {
    const couponWrap = document.getElementById('cartCouponWrap');
    if (!couponWrap || couponWrap.querySelector('.coupon-input-section')) return;

    const inputSection = document.createElement('div');
    inputSection.className = 'coupon-input-section';
    inputSection.innerHTML = `
      <div class="coupon-input-group">
        <input type="text" id="couponInput" placeholder="Enter coupon code" maxlength="20">
        <button class="btn btn-primary" onclick="DiscountSystem.applyCouponFromInput()">
          <i class="fas fa-tag"></i> Apply
        </button>
      </div>
    `;

    couponWrap.appendChild(inputSection);

    // Add enter key support
    document.getElementById('couponInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.applyCouponFromInput();
    });
  },

  /**
   * Apply coupon from input field
   */
  applyCouponFromInput() {
    const input = document.getElementById('couponInput');
    if (!input) return;

    const code = input.value.trim();
    if (!code) {
      this.showError('Please enter a coupon code.');
      return;
    }

    if (this.applyCoupon(code)) {
      input.value = '';
      input.disabled = true;
      setTimeout(() => {
        input.disabled = false;
      }, 2000);
    }
  },

  /**
   * Admin interface for coupon management
   */
  createAdminCouponInterface() {
    const existing = document.getElementById('adminCouponPanel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'adminCouponPanel';
    panel.className = 'admin-coupon-panel';
    panel.innerHTML = `
      <div class="admin-coupon-content">
        <h4><i class="fas fa-tags"></i> Coupon Management</h4>
        <div class="coupon-list">
          ${Object.entries(this.coupons).map(([code, coupon]) => `
            <div class="coupon-item ${coupon.active ? 'active' : 'inactive'}">
              <div class="coupon-info">
                <strong>${code}</strong>
                <span>${coupon.description}</span>
                <small>Uses: ${coupon.currentUses}/${coupon.maxUses || '∞'}</small>
              </div>
              <div class="coupon-actions">
                <button class="btn btn-glass" onclick="DiscountSystem.toggleCoupon('${code}')">
                  ${coupon.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-glass coupon-close" onclick="DiscountSystem.closeAdminPanel()">
          <i class="fas fa-times"></i> Close
        </button>
      </div>
    `;

    document.body.appendChild(panel);
  },

  /**
   * Toggle coupon active status
   */
  toggleCoupon(code) {
    if (this.coupons[code]) {
      this.coupons[code].active = !this.coupons[code].active;
      this.createAdminCouponInterface(); // Refresh panel
      Toast.show(`Coupon ${code} ${this.coupons[code].active ? 'activated' : 'deactivated'}`, 'info');
    }
  },

  /**
   * Close admin panel
   */
  closeAdminPanel() {
    document.getElementById('adminCouponPanel')?.remove();
  },

  /**
   * Get current applied coupon info
   */
  getCurrentCoupon() {
    return this.currentCoupon ? {
      code: Object.keys(this.coupons).find(key => this.coupons[key] === this.currentCoupon),
      discount: this.appliedDiscount,
      originalTotal: this.originalTotal
    } : null;
  },

  /**
   * Initialize on DOM ready
   */
  ready() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }
};

// Auto-initialize when DOM is ready
DiscountSystem.ready();
