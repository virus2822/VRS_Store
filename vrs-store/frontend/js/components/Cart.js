/* ================================================================
   CART.JS - Sliding cart, stable item IDs, coupon UI, and checkout.
   VIRUS2026 applies a verified 15% discount.
   ================================================================ */
window.Cart = {
  COUPONS: {
    VIRUS2026: 15,
  },
  _couponCode: '',
  _couponDiscountPct: 0,
  _couponError: '',

  init() {
    this._couponCode = localStorage.getItem('vrs_coupon_code') || '';
    if (this._couponCode && this.COUPONS[this._couponCode]) {
      this._couponDiscountPct = this.COUPONS[this._couponCode];
    }

    this._render();
    document.addEventListener('cart:updated', () => this._render());
    document.getElementById('cartOverlay')?.addEventListener('click', () => Cart.close());
  },

  formatIQD(value) {
    return `${Number(value || 0).toLocaleString('en-US')} IQD`;
  },

  itemKey(id) {
    return String(id || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },

  open() {
    document.getElementById('cartSidebar')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  close() {
    document.getElementById('cartSidebar')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('show');
    document.body.style.overflow = '';
  },

  updateBadge() {
    const el = document.getElementById('cartCount');
    if (!el) return;
    const count = Store.cart.count();
    el.textContent = Number(count).toLocaleString('en-US');
    el.classList.toggle('has-items', count > 0);
  },

  getCoupon() {
    return {
      code: this._couponDiscountPct > 0 ? this._couponCode : '',
      discountPct: this._couponDiscountPct,
    };
  },

  getTotals() {
    const subtotal = Store.cart.total();
    const discount = this._couponDiscountPct > 0
      ? +(subtotal * (this._couponDiscountPct / 100)).toFixed(2)
      : 0;
    const total = Math.max(0, +(subtotal - discount).toFixed(2));

    return {
      subtotal,
      discount,
      total,
      couponCode: this._couponDiscountPct > 0 ? this._couponCode : '',
      couponDiscountPct: this._couponDiscountPct,
    };
  },

  _render() {
    this.updateBadge();
    const wrap = document.getElementById('cartItems');
    const foot = document.getElementById('cartFoot');
    if (!wrap) return;

    const items = Store.cart.items();
    if (!items.length) {
      wrap.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-cart-shopping"></i>
          <p>Your cart is empty.</p>
          <button class="btn btn-glass" onclick="Cart.close()">
            <i class="fas fa-store"></i> Continue Shopping
          </button>
        </div>
      `;
      if (foot) foot.style.display = 'none';
      return;
    }

    wrap.innerHTML = items.map((item) => {
      const id = this.itemKey(item.id);
      const qty = Number(item.qty || 1);
      return `
        <div class="cart-item" data-id="${id}">
          <div class="ci-icon">${item.icon || '<i class="fas fa-box"></i>'}</div>
          <div class="ci-info">
            <div class="ci-name">${this.escape(item.name || 'Product')}</div>
            <div class="ci-price">${this.formatIQD(Number(item.price || 0) * qty)}</div>
          </div>
          <div class="ci-actions">
            <div class="ci-qty" aria-label="Quantity controls">
              <button onclick="Cart._changeQty('${id}', -1)" aria-label="Decrease quantity">
                <i class="fas fa-minus"></i>
              </button>
              <span>${qty.toLocaleString('en-US')}</span>
              <button onclick="Cart._changeQty('${id}', 1)" aria-label="Increase quantity">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <button class="ci-remove" onclick="Cart._remove('${id}')" title="Remove item" aria-label="Remove item">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    const totals = this.getTotals();
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = this.formatIQD(totals.total);

    const couponWrap = document.getElementById('cartCouponWrap');
    if (couponWrap) {
      couponWrap.innerHTML = `
        <div class="coupon-row">
          <input id="cartCouponInput" class="coupon-input" placeholder="Coupon code" value="${this.escape(this._couponCode)}" autocomplete="off">
          <button class="btn btn-glass" onclick="Cart.applyCoupon()">Apply</button>
        </div>
        <div class="cart-row"><span>Subtotal</span><strong>${this.formatIQD(totals.subtotal)}</strong></div>
        ${totals.discount > 0 ? `<div class="cart-row coupon-summary"><span>${this.escape(totals.couponCode)} discount (${totals.couponDiscountPct}%)</span><strong>-${this.formatIQD(totals.discount)}</strong></div>` : ''}
        ${this._couponError ? `<div class="coupon-error">${this.escape(this._couponError)}</div>` : ''}
        ${this._couponDiscountPct > 0 ? `<div class="coupon-ok">Coupon applied: ${this.escape(this._couponCode)} saves ${this._couponDiscountPct}%.</div>` : ''}
      `;
    }

    if (foot) foot.style.display = 'block';
  },

  _changeQty(id, delta) {
    const item = Store.cart.items().find((entry) => String(entry.id) === String(id));
    if (!item) return;

    const nextQty = Number(item.qty || 1) + Number(delta || 0);
    if (nextQty < 1) {
      this._remove(id);
      return;
    }

    Store.cart.updateQty(id, nextQty);
  },

  _remove(id) {
    Store.cart.remove(id);
    Toast.show('Item removed from cart.', 'info', 'fas fa-trash');
  },

  applyCoupon() {
    const input = document.getElementById('cartCouponInput');
    const code = (input?.value || '').trim().toUpperCase();
    this._couponCode = code;

    if (!code) {
      this._couponDiscountPct = 0;
      this._couponError = '';
      localStorage.removeItem('vrs_coupon_code');
      this._render();
      document.dispatchEvent(new CustomEvent('coupon:updated', { detail: this.getTotals() }));
      return;
    }

    if (this.COUPONS[code]) {
      this._couponDiscountPct = this.COUPONS[code];
      this._couponError = '';
      localStorage.setItem('vrs_coupon_code', code);
      Toast.show(`Coupon ${code} applied: ${this._couponDiscountPct}% off.`, 'success');
    } else {
      this._couponDiscountPct = 0;
      this._couponError = 'Invalid coupon code.';
      localStorage.removeItem('vrs_coupon_code');
      Toast.show('Invalid coupon code.', 'error');
    }

    this._render();
    document.dispatchEvent(new CustomEvent('coupon:updated', { detail: this.getTotals() }));
  },

  async checkout() {
    if (!Store.auth.isLoggedIn()) {
      this.close();
      Auth.openModal();
      Toast.show('Login is required before checkout.', 'warn', 'fas fa-lock');
      return;
    }

    const items = Store.cart.items();
    if (!items.length) return;

    const button = document.querySelector('.cart-foot .btn-primary');
    const original = button?.innerHTML;
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating order...';
    }

    const totals = this.getTotals();
    try {
      await endpoints.createOrder({
        items: items.map((item) => ({ product: item.id, quantity: item.qty || 1 })),
        paymentMethod: 'manual',
        notes: totals.couponCode ? `Website checkout | coupon:${totals.couponCode}` : 'Website checkout',
        couponCode: totals.couponCode || undefined,
      });

      Store.cart.clear();
      this.close();
      Toast.show('Order created successfully.', 'success', 'fas fa-check-circle');
    } catch (err) {
      Toast.show(err?.message || 'Order creation failed.', 'error');
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = original || '<i class="fas fa-credit-card"></i> Continue to Payment';
      }
    }
  },

  escape(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
};
