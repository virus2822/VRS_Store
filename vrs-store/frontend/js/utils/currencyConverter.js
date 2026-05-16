/* ================================================================
   CURRENCY CONVERTER.JS - Dynamic Economy Engine
   VRS STORE V7.0 MIDNIGHT COBALT EDITION
   
   Features:
   - Dynamic USD/IQD exchange rate management
   - Admin config interface for rate updates
   - Smooth price animations on currency switch
   - Base currency storage (USD) with instant IQD display
   - Persistent rate configuration
   ================================================================ */

window.CurrencyConverter = {
  // Base configuration
  config: {
    baseCurrency: 'USD',
    displayCurrency: 'IQD',
    defaultRate: 1500, // Default USD to IQD rate
    animationDuration: 600, // ms for price counting animation
    decimalPlaces: 2,
    thousandsSeparator: ',',
  },

  // Current exchange rate (will be loaded from storage/config)
  currentRate: 1500,

  // Current display currency (IQD or USD)
  currentCurrency: 'IQD',

  // Animation state
  isAnimating: false,
  animationFrames: new Map(),

  /**
   * Initialize the currency converter
   */
  init() {
    this.loadExchangeRate();
    this.loadCurrencyPreference();
    this.bindEvents();
    this.updateAllPrices();
  },

  /**
   * Load exchange rate from localStorage or use default
   */
  loadExchangeRate() {
    const savedRate = localStorage.getItem('vrs_exchange_rate');
    const adminRate = VRS_CONFIG?.admin?.exchangeRate;

    if (adminRate && !isNaN(adminRate)) {
      this.currentRate = Number(adminRate);
    } else if (savedRate && !isNaN(savedRate)) {
      this.currentRate = Number(savedRate);
    } else {
      this.currentRate = this.config.defaultRate;
    }

    // Save to localStorage for persistence
    localStorage.setItem('vrs_exchange_rate', this.currentRate.toString());
  },

  /**
   * Load currency preference from localStorage
   */
  loadCurrencyPreference() {
    const savedCurrency = localStorage.getItem('vrs_currency');
    if (savedCurrency === 'USD' || savedCurrency === 'IQD') {
      this.currentCurrency = savedCurrency;
    }
    this.updateCurrencyLabel();
  },

  /**
   * Toggle between USD and IQD
   */
  toggleCurrency() {
    this.currentCurrency = this.currentCurrency === 'IQD' ? 'USD' : 'IQD';
    localStorage.setItem('vrs_currency', this.currentCurrency);
    this.updateCurrencyLabel();
    this.updateAllPrices(true);
  },

  /**
   * Update currency label in navbar
   */
  updateCurrencyLabel() {
    const label = document.getElementById('currencyLabel');
    if (label) {
      label.textContent = this.currentCurrency;
    }
  },

  /**
   * Get current exchange rate
   */
  getExchangeRate() {
    return this.currentRate;
  },

  /**
   * Set new exchange rate (admin function)
   */
  setExchangeRate(newRate) {
    const rate = Number(newRate);
    if (isNaN(rate) || rate <= 0) {
      throw new Error('Invalid exchange rate. Must be a positive number.');
    }

    const oldRate = this.currentRate;
    this.currentRate = rate;
    
    // Save to localStorage
    localStorage.setItem('vrs_exchange_rate', rate.toString());
    
    // Update all prices with animation
    this.updateAllPrices(true);
    
    // Show success feedback
    Toast.show(`Exchange rate updated: 1 USD = ${rate.toLocaleString()} IQD`, 'success', 'fas fa-exchange-alt');
    
    return { oldRate, newRate: rate };
  },

  /**
   * Convert USD to IQD
   */
  convertToIQD(usdAmount) {
    const amount = Number(usdAmount) || 0;
    return amount * this.currentRate;
  },

  /**
   * Convert IQD to USD
   */
  convertToUSD(iqdAmount) {
    const amount = Number(iqdAmount) || 0;
    return amount / this.currentRate;
  },

  /**
   * Format currency with proper separators
   * HARD RULE: NO "IQD" text when USD is active
   */
  formatCurrency(amount, currency = 'IQD') {
    const num = Number(amount) || 0;
    
    if (currency === 'USD') {
      // USD format: $X.XX - NO IQD text
      return `$${num.toFixed(2)}`;
    }
    
    // IQD format: X,XXX IQD
    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${formatted.replace(/\B(?=(\d{3})+(?!\d))/g, this.config.thousandsSeparator)} IQD`;
  },

  /**
   * Format price for display (automatically converts to display currency)
   */
  formatPrice(baseAmount, baseCurrency = 'USD') {
    if (baseCurrency === 'USD') {
      const iqdAmount = this.convertToIQD(baseAmount);
      return this.formatCurrency(iqdAmount, 'IQD');
    }
    return this.formatCurrency(baseAmount, 'IQD');
  },

  /**
   * Animate price counting from old value to new value
   */
  animatePrice(element, startValue, endValue, currency = 'IQD') {
    if (this.isAnimating) return; // Prevent overlapping animations

    const duration = this.config.animationDuration;
    const startTime = performance.now();
    const elementId = element.dataset.priceId || Math.random().toString(36).substr(2, 9);
    element.dataset.priceId = elementId;

    // Cancel any existing animation for this element
    if (this.animationFrames.has(elementId)) {
      cancelAnimationFrame(this.animationFrames.get(elementId));
    }

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;

      element.textContent = this.formatCurrency(currentValue, currency);

      if (progress < 1) {
        const frameId = requestAnimationFrame(animate);
        this.animationFrames.set(elementId, frameId);
      } else {
        this.animationFrames.delete(elementId);
        element.dataset.priceId = '';
      }
    };

    const frameId = requestAnimationFrame(animate);
    this.animationFrames.set(elementId, frameId);
  },

  /**
   * Update all prices on the page with optional animation
   * Handles both main price and original price elements
   */
  updateAllPrices(animate = false) {
    const currentCurrency = localStorage.getItem('vrs_currency') || 'IQD';
    const rate = this.currentRate;

    // Update main prices (marketplace, flash deals, all prices)
    const priceElements = document.querySelectorAll('.price-tag[data-iqd]');
    priceElements.forEach(element => {
      const iqdPrice = Number(element.dataset.iqd) || 0;
      if (currentCurrency === 'USD') {
        const usdPrice = iqdPrice / rate;
        element.textContent = this.formatCurrency(usdPrice, 'USD');
      } else {
        element.textContent = this.formatCurrency(iqdPrice, 'IQD');
      }
    });

    // Update original prices
    const originalElements = document.querySelectorAll('.original-price[data-iqd]');
    originalElements.forEach(element => {
      const iqdPrice = Number(element.dataset.iqd) || 0;
      if (currentCurrency === 'USD') {
        const usdPrice = iqdPrice / rate;
        element.textContent = this.formatCurrency(usdPrice, 'USD');
      } else {
        element.textContent = this.formatCurrency(iqdPrice, 'IQD');
      }
    });

    // Update cart total if exists
    const cartTotal = document.getElementById('cartTotal');
    if (cartTotal && cartTotal.dataset.iqd) {
      const iqdTotal = Number(cartTotal.dataset.iqd) || 0;
      if (currentCurrency === 'USD') {
        const usdTotal = iqdTotal / rate;
        cartTotal.textContent = this.formatCurrency(usdTotal, 'USD');
      } else {
        cartTotal.textContent = this.formatCurrency(iqdTotal, 'IQD');
      }
    }

    // Re-render product grid to ensure all prices are updated
    if (typeof ProductList !== 'undefined' && ProductList.applyAndRender) {
      ProductList.applyAndRender();
    }

    // Update cart total if exists
    this.updateCartTotal(animate);
  },

  /**
   * Update cart total display
   */
  updateCartTotal(animate = false) {
    const cartTotal = document.getElementById('cartTotal');
    if (!cartTotal) return;

    const cart = Store.cart?.items() || [];
    const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    
    if (animate) {
      const currentValue = this.extractNumericValue(cartTotal.textContent);
      this.animatePrice(cartTotal, currentValue, total, 'IQD');
    } else {
      cartTotal.textContent = this.formatCurrency(total, 'IQD');
    }
  },

  /**
   * Extract numeric value from formatted currency string
   */
  extractNumericValue(formattedString) {
    const clean = formattedString.replace(/[^\d.]/g, '');
    return Number(clean) || 0;
  },

  /**
   * Bind currency toggle events
   */
  bindEvents() {
    // Bind to currency button if exists
    const currencyBtn = document.getElementById('currencyBtn');
    if (currencyBtn) {
      currencyBtn.addEventListener('click', () => {
        this.toggleCurrency();
      });
    }

    // Listen for cart updates to recalculate prices
    document.addEventListener('cart:updated', () => {
      this.updateCartTotal(false);
    });

    // Listen for admin rate updates
    document.addEventListener('admin:rateUpdate', (event) => {
      const { rate } = event.detail;
      this.setExchangeRate(rate);
    });
  },

  /**
   * Toggle between USD and IQD display
   */
  toggleCurrency() {
    this.currentCurrency = this.currentCurrency === 'IQD' ? 'USD' : 'IQD';
    localStorage.setItem('vrs_currency', this.currentCurrency);
    this.updateCurrencyLabel();
    this.updateAllPrices(true);
  },

  /**
   * Update currency label in navbar
   */
  updateCurrencyLabel() {
    const currencyLabel = document.getElementById('currencyLabel');
    if (currencyLabel) {
      currencyLabel.textContent = this.currentCurrency;
    }
  },

  /**
   * Add data-base-price attributes to product elements
   */
  enhanceProductElements() {
    const productCards = document.querySelectorAll('.prod-card');
    
    productCards.forEach(card => {
      const priceElement = card.querySelector('.price-tag');
      if (priceElement && !priceElement.dataset.usd) {
        // Extract current price and convert to base USD
        const currentPrice = this.extractNumericValue(priceElement.textContent);
        const basePrice = this.convertToUSD(currentPrice);
        priceElement.dataset.usd = basePrice.toString();
      }
    });
  },

  /**
   * Admin interface for rate management
   */
  createAdminRateInterface() {
    const existing = document.getElementById('adminRatePanel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'adminRatePanel';
    panel.className = 'admin-rate-panel';
    panel.innerHTML = `
      <div class="admin-rate-content">
        <h4><i class="fas fa-cog"></i> Exchange Rate Configuration</h4>
        <div class="rate-input-group">
          <label>USD to IQD Rate:</label>
          <input type="number" id="rateInput" value="${this.currentRate}" min="1" step="1">
          <button class="btn btn-primary" onclick="CurrencyConverter.updateRateFromInput()">
            <i class="fas fa-save"></i> Update
          </button>
        </div>
        <div class="rate-info">
          <small>Current rate: 1 USD = ${this.currentRate.toLocaleString()} IQD</small><br>
          <small>Last updated: ${new Date().toLocaleString()}</small>
        </div>
        <button class="btn btn-glass rate-close" onclick="CurrencyConverter.closeAdminPanel()">
          <i class="fas fa-times"></i> Close
        </button>
      </div>
    `;

    document.body.appendChild(panel);

    // Add enter key support for input
    document.getElementById('rateInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.updateRateFromInput();
    });
  },

  /**
   * Update rate from admin input
   */
  updateRateFromInput() {
    const input = document.getElementById('rateInput');
    if (!input) return;

    const newRate = Number(input.value);
    try {
      this.setExchangeRate(newRate);
      this.closeAdminPanel();
    } catch (error) {
      Toast.show(error.message, 'error');
      input.value = this.currentRate.toString();
    }
  },

  /**
   * Close admin panel
   */
  closeAdminPanel() {
    document.getElementById('adminRatePanel')?.remove();
  },

  /**
   * Public API to get formatted price for any amount
   */
  getPrice(amount, options = {}) {
    const { baseCurrency = 'USD', animate = false } = options;
    return this.formatPrice(amount, baseCurrency);
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
CurrencyConverter.ready();
