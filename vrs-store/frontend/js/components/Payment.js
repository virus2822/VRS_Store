/* ================================================================
   PAYMENT.JS - VRS STORE V7.0 MIDNIGHT COBALT EDITION
   Humanized payment flow with interactive payment instructions
   Supports: Site checkout, Discord, Telegram, WhatsApp, Zain Cash, AsiaCell
   Features: Click-to-copy wallet numbers, professional yet friendly UX copy
   ================================================================ */
window.Payment = {
  _items: [],
  _totals: {
    subtotal: 0,
    discount: 0,
    total: 0,
    couponCode: '',
    couponDiscountPct: 0,
  },
  _discordMsg: '',

  init() {
    const el = document.createElement('div');
    el.id = 'paymentModal';
    el.className = 'modal-overlay';
    el.innerHTML = `
      <div class="modal pay-modal">
        <button class="modal-close" onclick="Payment.close()" aria-label="Close payment modal"><i class="fas fa-times"></i></button>
        <div class="pay-head">
          <div class="modal-logo">Secure Checkout</div>
          <p class="modal-sub">Total: <strong id="payTotalDisplay">0 IQD</strong></p>
        </div>

        <div class="pay-methods" id="payMethods"></div>

        <div id="payStepSite" style="display:none;">
          <div class="pay-step-head">
            <button class="pay-back" onclick="Payment._backToMethods()"><i class="fas fa-arrow-left"></i> Back</button>
            <strong>Website Order</strong>
          </div>
          <div class="pay-order-summary" id="payOrderSummary"></div>
          <div class="form-group" style="margin-top:1rem;">
            <label>Notes</label>
            <textarea id="payNotes" rows="2" placeholder="Optional order details"></textarea>
          </div>
          <button class="btn btn-primary btn-block" style="margin-top:1rem;" onclick="Payment._confirmSite()">
            <i class="fas fa-check-circle"></i> Confirm Order
          </button>
        </div>

        <div id="payStepWallet" style="display:none;">
          <div class="pay-step-head">
            <button class="pay-back" onclick="Payment._backToMethods()"><i class="fas fa-arrow-left"></i> Back</button>
            <strong>Wallet Payment</strong>
          </div>
          <div class="pay-order-summary" id="payWalletSummary"></div>
          <div class="form-group" style="margin-top:1rem;">
            <label>Notes</label>
            <textarea id="payWalletNotes" rows="2" placeholder="Optional order details"></textarea>
          </div>
          <button class="btn btn-primary btn-block" style="margin-top:1rem;" onclick="Payment._confirmWallet()">
            <i class="fas fa-wallet"></i> Pay from Wallet
          </button>
        </div>

        <div id="payStepDiscord" style="display:none;">
          <div class="pay-step-head">
            <button class="pay-back" onclick="Payment._backToMethods()"><i class="fas fa-arrow-left"></i> Back</button>
            <strong>Discord Ticket</strong>
          </div>
          <div class="discord-info">
            <div class="discord-icon"><i class="fab fa-discord"></i></div>
            <p>Your order payload will be copied. Paste it inside a Discord ticket for fulfillment.</p>
            <p class="pay-note"><i class="fas fa-circle-info"></i> Coupon discounts are included in this ticket.</p>
            <div id="discordTicketPreview" class="ticket-preview"></div>
          </div>
          <div class="pay-discord-btns">
            <a id="discordServerLink" class="btn btn-glass" target="_blank" rel="noopener">
              <i class="fab fa-discord"></i> Join Server
            </a>
            <button class="btn btn-discord" onclick="Payment._openDiscordTicket()">
              <i class="fas fa-ticket"></i> Copy and Open Ticket
            </button>
          </div>
        </div>

        <div id="payStepTelegram" style="display:none;">
          <div class="pay-step-head">
            <button class="pay-back" onclick="Payment._backToMethods()"><i class="fas fa-arrow-left"></i> Back</button>
            <strong>Telegram Contact</strong>
          </div>
          <div class="contact-info-box tg">
            <i class="fab fa-telegram"></i>
            <p>Open Telegram with your order ready for support follow-up.</p>
          </div>
          <a id="telegramOrderLink" class="btn btn-telegram btn-block" style="margin-top:1rem;" target="_blank" rel="noopener" onclick="Payment._registerContactOrder('telegram')">
            <i class="fab fa-telegram"></i> Open Telegram
          </a>
        </div>

        <div id="payStepZaincash" style="display:none;">
          <div class="pay-step-head">
            <button class="pay-back" onclick="Payment._backToMethods()"><i class="fas fa-arrow-left"></i> Back</button>
            <strong>Zain Cash Payment</strong>
          </div>
          <div class="payment-instructions">
            <div class="payment-icon zaincash"><i class="fas fa-mobile-alt"></i></div>
            <p>Securing your connection to the vault...</p>
            <div class="wallet-info">
              <div class="wallet-number">
                <label>Wallet Number:</label>
                <div class="copy-group">
                  <input type="text" id="zaincashNumber" readonly value="${window.VRS_CONFIG?.payment?.zaincash?.number || '07XXXXXXXXX'}">
                  <button class="copy-btn" onclick="Payment._copyToClipboard('zaincashNumber', 'Zain Cash number')">
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
              <div class="wallet-name">
                <label>Account Name:</label>
                <div class="copy-group">
                  <input type="text" id="zaincashName" readonly value="${window.VRS_CONFIG?.payment?.zaincash?.name || 'VRS STORE'}">
                  <button class="copy-btn" onclick="Payment._copyToClipboard('zaincashName', 'Zain Cash name')">
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="payment-steps">
              <h4>How to complete your payment:</h4>
              <ol>
                <li>Open your Zain Cash application</li>
                <li>Click "Send Money" or "Transfer"</li>
                <li>Enter the wallet number above</li>
                <li>Enter the amount: <strong>${this.formatIQD(this._totals.total)}</strong></li>
                <li>Confirm and complete the transfer</li>
                <li>Screenshot the confirmation and send to us</li>
              </ol>
            </div>
            <div class="pay-order-summary" id="zaincashSummary"></div>
            <button class="btn btn-primary btn-block" style="margin-top:1rem;" onclick="Payment._confirmZaincash()">
              <i class="fas fa-check-circle"></i> I've Sent Payment
            </button>
          </div>
        </div>

        <div id="payStepAsiacell" style="display:none;">
          <div class="pay-step-head">
            <button class="pay-back" onclick="Payment._backToMethods()"><i class="fas fa-arrow-left"></i> Back</button>
            <strong>AsiaCell Payment</strong>
          </div>
          <div class="payment-instructions">
            <div class="payment-icon asiacell"><i class="fas fa-mobile-alt"></i></div>
            <p>Securing your connection to the vault...</p>
            <div class="wallet-info">
              <div class="wallet-number">
                <label>Account Number:</label>
                <div class="copy-group">
                  <input type="text" id="asiacellNumber" readonly value="${window.VRS_CONFIG?.payment?.asiahawala?.account || '07XXXXXXXXX'}">
                  <button class="copy-btn" onclick="Payment._copyToClipboard('asiacellNumber', 'AsiaCell account')">
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
              <div class="wallet-name">
                <label>Account Name:</label>
                <div class="copy-group">
                  <input type="text" id="asiacellName" readonly value="${window.VRS_CONFIG?.payment?.asiahawala?.name || 'VRS STORE'}">
                  <button class="copy-btn" onclick="Payment._copyToClipboard('asiacellName', 'AsiaCell name')">
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="payment-steps">
              <h4>How to complete your payment:</h4>
              <ol>
                <li>Visit any AsiaCell agent location</li>
                <li>Request to transfer funds to the account above</li>
                <li>Specify the amount: <strong>${this.formatIQD(this._totals.total)}</strong></li>
                <li>Keep the transaction receipt</li>
                <li>Send us a photo of the receipt</li>
              </ol>
            </div>
            <div class="pay-order-summary" id="asiacellSummary"></div>
            <button class="btn btn-primary btn-block" style="margin-top:1rem;" onclick="Payment._confirmAsiacell()">
              <i class="fas fa-check-circle"></i> I've Sent Payment
            </button>
          </div>
        </div>

        <div id="payStepWhatsapp" style="display:none;">
          <div class="pay-step-head">
            <button class="pay-back" onclick="Payment._backToMethods()"><i class="fas fa-arrow-left"></i> Back</button>
            <strong>WhatsApp Contact</strong>
          </div>
          <div class="contact-info-box wa">
            <i class="fab fa-whatsapp"></i>
            <p>Open WhatsApp with a prepared order message.</p>
          </div>
          <a id="whatsappOrderLink" class="btn btn-glass btn-block" style="margin-top:1rem;" target="_blank" rel="noopener" onclick="Payment._registerContactOrder('whatsapp')">
            <i class="fab fa-whatsapp"></i> Open WhatsApp
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    el.addEventListener('click', (event) => {
      if (event.target === el) Payment.close();
    });
    document.addEventListener('coupon:updated', () => {
      if (document.getElementById('paymentModal')?.classList.contains('show')) {
        this._syncTotals();
        this._updateTotalDisplay();
      }
    });
  },

  formatIQD(value) {
    return `${Number(value || 0).toLocaleString('en-US')} IQD`;
  },

  open() {
    if (!Store.auth.isLoggedIn()) {
      Auth.openModal();
      Toast.show('Login is required before payment.', 'warn', 'fas fa-lock');
      return;
    }

    this._items = Store.cart.items();
    this._syncTotals();
    if (!this._items.length) {
      Toast.show('Your cart is empty.', 'warn');
      return;
    }

    this._updateTotalDisplay();
    const serverLink = document.getElementById('discordServerLink');
    if (serverLink) serverLink.href = window.VRS_CONFIG?.contact?.discordServer || 'https://discord.gg/XNVFmg54Vq';

    this._renderMethods();
    this._backToMethods();
    document.getElementById('paymentModal')?.classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  close() {
    document.getElementById('paymentModal')?.classList.remove('show');
    document.body.style.overflow = '';
  },

  _syncTotals() {
    this._totals = Cart.getTotals();
  },

  _updateTotalDisplay() {
    const display = document.getElementById('payTotalDisplay');
    if (display) display.textContent = this.formatIQD(this._totals.total);
  },

  _renderMethods() {
    const methods = document.getElementById('payMethods');
    if (!methods) return;

    methods.innerHTML = `
      <button class="pay-method-btn" onclick="Payment._selectMethod('site')">
        <div class="pmb-icon"><i class="fas fa-credit-card"></i></div>
        <div class="pmb-info">
          <strong>Website Order</strong>
          <span>Create an order with support fulfillment.</span>
        </div>
        <i class="fas fa-chevron-right pmb-arrow"></i>
      </button>
      <button class="pay-method-btn" onclick="Payment._selectMethod('wallet')">
        <div class="pmb-icon"><i class="fas fa-wallet"></i></div>
        <div class="pmb-info">
          <strong>Wallet</strong>
          <span>Pay with your VRS wallet balance.</span>
        </div>
        <i class="fas fa-chevron-right pmb-arrow"></i>
      </button>
      <button class="pay-method-btn discord" onclick="Payment._selectMethod('discord')">
        <div class="pmb-icon"><i class="fab fa-discord"></i></div>
        <div class="pmb-info">
          <strong>Discord Ticket</strong>
          <span>Copy the order payload and open Discord.</span>
        </div>
        <i class="fas fa-chevron-right pmb-arrow"></i>
      </button>
      <button class="pay-method-btn telegram" onclick="Payment._selectMethod('telegram')">
        <div class="pmb-icon"><i class="fab fa-telegram"></i></div>
        <div class="pmb-info">
          <strong>Telegram</strong>
          <span>Contact support with order details.</span>
        </div>
        <i class="fas fa-chevron-right pmb-arrow"></i>
      </button>
      <button class="pay-method-btn zaincash" onclick="Payment._selectMethod('zaincash')">
        <div class="pmb-icon"><i class="fas fa-mobile-alt"></i></div>
        <div class="pmb-info">
          <strong>Zain Cash</strong>
          <span>Pay instantly with your Zain Cash wallet.</span>
        </div>
        <i class="fas fa-chevron-right pmb-arrow"></i>
      </button>
      <button class="pay-method-btn asiacell" onclick="Payment._selectMethod('asiacell')">
        <div class="pmb-icon"><i class="fas fa-store"></i></div>
        <div class="pmb-info">
          <strong>AsiaCell</strong>
          <span>Pay through AsiaCell agent locations.</span>
        </div>
        <i class="fas fa-chevron-right pmb-arrow"></i>
      </button>
      <button class="pay-method-btn whatsapp" onclick="Payment._selectMethod('whatsapp')">
        <div class="pmb-icon"><i class="fab fa-whatsapp"></i></div>
        <div class="pmb-info">
          <strong>WhatsApp</strong>
          <span>Open a prepared WhatsApp order message.</span>
        </div>
        <i class="fas fa-chevron-right pmb-arrow"></i>
      </button>
    `;
  },

  _selectMethod(method) {
    document.getElementById('payMethods').style.display = 'none';
    ['Site', 'Wallet', 'Discord', 'Telegram', 'Zaincash', 'Asiacell', 'Whatsapp'].forEach((name) => {
      const step = document.getElementById(`payStep${name}`);
      if (step) step.style.display = 'none';
    });

    if (method === 'site') this._setupSite();
    if (method === 'wallet') this._setupWallet();
    if (method === 'discord') this._setupDiscord();
    if (method === 'telegram') this._setupTelegram();
    if (method === 'zaincash') this._setupZaincash();
    if (method === 'asiacell') this._setupAsiacell();
    if (method === 'whatsapp') this._setupWhatsapp();

    const cap = method.charAt(0).toUpperCase() + method.slice(1);
    const step = document.getElementById(`payStep${cap}`);
    if (step) step.style.display = 'block';
  },

  _backToMethods() {
    ['Site', 'Wallet', 'Discord', 'Telegram', 'Zaincash', 'Asiacell', 'Whatsapp'].forEach((name) => {
      const step = document.getElementById(`payStep${name}`);
      if (step) step.style.display = 'none';
    });
    const methods = document.getElementById('payMethods');
    if (methods) methods.style.display = 'flex';
    const notes = document.getElementById('payNotes');
    if (notes) notes.value = '';
  },

  _summaryHtml() {
    const lines = this._items.map((item) => {
      const qty = Number(item.qty || 1);
      return `
        <div class="order-line">
          <span>${item.icon || ''} ${this.escape(item.name || 'Product')}</span>
          <span>${qty.toLocaleString('en-US')}x - ${this.formatIQD(Number(item.price || 0) * qty)}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="order-lines">
        ${lines}
        <div class="order-line">
          <span>Subtotal</span>
          <strong>${this.formatIQD(this._totals.subtotal)}</strong>
        </div>
        ${this._totals.discount > 0 ? `
          <div class="order-line order-discount">
            <span>Coupon ${this.escape(this._totals.couponCode)} (${this._totals.couponDiscountPct}%)</span>
            <strong>-${this.formatIQD(this._totals.discount)}</strong>
          </div>
        ` : ''}
        <div class="order-line order-total">
          <strong>Total</strong>
          <strong>${this.formatIQD(this._totals.total)}</strong>
        </div>
      </div>
    `;
  },

  _setupSite() {
    const summary = document.getElementById('payOrderSummary');
    if (summary) summary.innerHTML = this._summaryHtml();
  },

  _setupWallet() {
    const summary = document.getElementById('payWalletSummary');
    if (summary) summary.innerHTML = this._summaryHtml();
  },

  async _confirmSite() {
    const button = document.querySelector('#payStepSite .btn-primary');
    const original = button?.innerHTML;
    const notes = document.getElementById('payNotes')?.value.trim() || '';
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating order...';
    }

    try {
      await endpoints.createOrder({
        items: this._items.map((item) => ({ product: item.id, quantity: item.qty || 1 })),
        paymentMethod: 'manual',
        notes: this._buildNotes(notes || 'Website order'),
        couponCode: this._totals.couponCode || undefined,
      });
      // Lock coupon after successful purchase
      if (this._totals.couponCode) {
        DiscountSystem?.lockCoupon(this._totals.couponCode);
      }
      Store.cart.clear();
      this.close();
      Cart.close();
      Toast.show('Order created successfully. Support will follow up shortly.', 'success');
    } catch (err) {
      Toast.show(err?.message || 'Order creation failed.', 'error');
      if (button) {
        button.disabled = false;
        button.innerHTML = original || '<i class="fas fa-check-circle"></i> Confirm Order';
      }
    }
  },

  async _confirmWallet() {
    const button = document.querySelector('#payStepWallet .btn-primary');
    const original = button?.innerHTML;
    const notes = document.getElementById('payWalletNotes')?.value.trim() || '';
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Paying...';
    }

    try {
      await endpoints.createOrder({
        items: this._items.map((item) => ({ product: item.id, quantity: item.qty || 1 })),
        paymentMethod: 'wallet',
        notes: this._buildNotes(notes || 'Wallet order'),
        couponCode: this._totals.couponCode || undefined,
      });
      // Lock coupon after successful purchase
      if (this._totals.couponCode) {
        DiscountSystem?.lockCoupon(this._totals.couponCode);
      }
      Store.cart.clear();
      this.close();
      Cart.close();
      Toast.show('Wallet payment completed.', 'success');
    } catch (err) {
      Toast.show(err?.message || 'Wallet payment failed.', 'error');
      if (button) {
        button.disabled = false;
        button.innerHTML = original || '<i class="fas fa-wallet"></i> Pay from Wallet';
      }
    }
  },

  _setupDiscord() {
    const user = AppState.get('user')?.username || 'guest';
    const itemLines = this._items
      .map((item) => `- ${item.name} x${item.qty || 1} = ${this.formatIQD(Number(item.price || 0) * Number(item.qty || 1))}`)
      .join('\n');

    this._discordMsg = [
      'VRS STORE Order Ticket',
      '----------------------',
      itemLines,
      '----------------------',
      `Subtotal: ${this.formatIQD(this._totals.subtotal)}`,
      this._totals.discount > 0 ? `Coupon: ${this._totals.couponCode} (${this._totals.couponDiscountPct}%) -${this.formatIQD(this._totals.discount)}` : 'Coupon: none',
      `Total: ${this.formatIQD(this._totals.total)}`,
      `User: ${user}`,
      `Time: ${new Date().toLocaleString('en-US')}`,
    ].filter(Boolean).join('\n');

    const preview = document.getElementById('discordTicketPreview');
    if (preview) preview.innerHTML = `<pre>${this.escape(this._discordMsg)}</pre>`;
  },

  _openDiscordTicket() {
    const server = window.VRS_CONFIG?.contact?.discordServer || 'https://discord.gg/XNVFmg54Vq';
    navigator.clipboard?.writeText(this._discordMsg).catch(() => {});
    window.open(server, '_blank', 'noopener');
    Toast.show('Order payload copied. Paste it in your Discord ticket.', 'success', 'fab fa-discord');

    endpoints.createOrder({
      items: this._items.map((item) => ({ product: item.id, quantity: item.qty || 1 })),
      paymentMethod: 'manual',
      notes: this._buildNotes(`Discord ticket:\n${this._discordMsg}`),
      couponCode: this._totals.couponCode || undefined,
    }).catch(() => {});

    Store.cart.clear();
    Cart.close();
    setTimeout(() => this.close(), 1200);
  },

  _setupTelegram() {
    const link = 'https://t.me/VrsStoree';
    const anchor = document.getElementById('telegramOrderLink');
    if (anchor) anchor.href = link;
  },

  _setupZaincash() {
    const summary = document.getElementById('zaincashSummary');
    if (summary) summary.innerHTML = this._summaryHtml();
  },

  _setupAsiacell() {
    const summary = document.getElementById('asiacellSummary');
    if (summary) summary.innerHTML = this._summaryHtml();
  },

  _setupWhatsapp() {
    const phone = (window.VRS_CONFIG?.contact?.whatsapp || '').replace(/\D/g, '');
    const msg = this._contactMessage('WhatsApp');
    const link = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    const anchor = document.getElementById('whatsappOrderLink');
    if (anchor) anchor.href = link;
  },

  _registerContactOrder(method) {
    endpoints.createOrder({
      items: this._items.map((item) => ({ product: item.id, quantity: item.qty || 1 })),
      paymentMethod: 'manual',
      notes: this._buildNotes(`${method} contact order`),
      couponCode: this._totals.couponCode || undefined,
    }).catch(() => {});
    Store.cart.clear();
    Cart.close();
    setTimeout(() => this.close(), 1000);
  },

  _contactMessage(method) {
    const user = AppState.get('user')?.username || 'guest';
    const itemLines = this._items.map((item) => `${item.name} x${item.qty || 1}`).join(', ');
    return [
      `VRS STORE ${method} Order`,
      `Items: ${itemLines}`,
      `Subtotal: ${this.formatIQD(this._totals.subtotal)}`,
      this._totals.discount > 0 ? `Coupon: ${this._totals.couponCode} (${this._totals.couponDiscountPct}%)` : 'Coupon: none',
      `Total: ${this.formatIQD(this._totals.total)}`,
      `User: ${user}`,
    ].join('\n');
  },

  _buildNotes(base) {
    const coupon = this._totals.couponCode
      ? `coupon:${this._totals.couponCode} discount:${this._totals.couponDiscountPct}%`
      : 'coupon:none';
    return `${base} | ${coupon}`;
  },

  _copyToClipboard(elementId, label) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const text = element.value;
    navigator.clipboard?.writeText(text).then(() => {
      Toast.show(`${label} copied to clipboard!`, 'success', 'fas fa-copy');
      
      // Visual feedback
      const button = element.nextElementSibling;
      if (button) {
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.background = 'rgba(34, 197, 94, 0.2)';
        setTimeout(() => {
          button.innerHTML = originalIcon;
          button.style.background = '';
        }, 2000);
      }
    }).catch(() => {
      // Fallback for older browsers
      element.select();
      document.execCommand('copy');
      Toast.show(`${label} copied!`, 'success', 'fas fa-copy');
    });
  },

  async _confirmZaincash() {
    const button = document.querySelector('#payStepZaincash .btn-primary');
    const original = button?.innerHTML;
    
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }

    try {
      await endpoints.createOrder({
        items: this._items.map((item) => ({ product: item.id, quantity: item.qty || 1 })),
        paymentMethod: 'zaincash',
        notes: this._buildNotes('Zain Cash payment - awaiting confirmation'),
        couponCode: this._totals.couponCode || undefined,
      });
      // Lock coupon after successful purchase
      if (this._totals.couponCode) {
        DiscountSystem?.lockCoupon(this._totals.couponCode);
      }
      Store.cart.clear();
      this.close();
      Cart.close();
      Toast.show('Payment received! We\'ll confirm your Zain Cash transfer shortly.', 'success');
    } catch (err) {
      Toast.show(err?.message || 'Payment confirmation failed.', 'error');
      if (button) {
        button.disabled = false;
        button.innerHTML = original || '<i class="fas fa-check-circle"></i> I\'ve Sent Payment';
      }
    }
  },

  async _confirmAsiacell() {
    const button = document.querySelector('#payStepAsiacell .btn-primary');
    const original = button?.innerHTML;
    
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }

    try {
      await endpoints.createOrder({
        items: this._items.map((item) => ({ product: item.id, quantity: item.qty || 1 })),
        paymentMethod: 'asiacell',
        notes: this._buildNotes('AsiaCell payment - awaiting receipt confirmation'),
        couponCode: this._totals.couponCode || undefined,
      });
      // Lock coupon after successful purchase
      if (this._totals.couponCode) {
        DiscountSystem?.lockCoupon(this._totals.couponCode);
      }
      Store.cart.clear();
      this.close();
      Cart.close();
      Toast.show('Payment received! We\'ll confirm your AsiaCell transfer shortly.', 'success');
    } catch (err) {
      Toast.show(err?.message || 'Payment confirmation failed.', 'error');
      if (button) {
        button.disabled = false;
        button.innerHTML = original || '<i class="fas fa-check-circle"></i> I\'ve Sent Payment';
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
