/* ================================================================
   PRODUCTCARD.JS - VRS STORE V8.0 PROFESSIONAL EDITION
   Minimal card design, image mapping, currency sync, product details navigation.
   Product data loaded from ./js/data/products.js
   ================================================================ */

// Image Mapping - Maps categories to image files
const VRS_IMAGE_MAP = {
  // Steam Vault
  steam_vault: './images/steam.png',
  steam_turkey: './images/steam.png',
  steam_argentina: './images/steam.png',
  steam_kazakhstan: './images/steam.png',
  steam_ukraine: './images/steam.png',
  steam_game_bundles: './images/steam.png',
  steam_hour_boosted: './images/steam.png',
  steam_high_tier: './images/steam.png',

  // Elite Gaming
  elite_gaming: './images/steam.png',
  fortnite_accounts: './images/fortnite.png',
  fortnite: './images/fortnite.png',
  cs2_accounts: './images/cs2.png',
  pubg_accounts: './images/pubg.png',
  valorant_accounts: './images/valorant.png',
  valorant: './images/valorant.png',
  valorant_points: './images/valorant.png',
  roblox: './images/roblox.png',
  gta_v: './images/gta_v.png',
  fivem_scripts: './images/fivem.png',
  game_mods: './images/code.png',

  // Premium Subs
  premium_subs: './images/netflix.png',
  netflix: './images/netflix.png',
  spotify: './images/spotify.png',
  spotify_premium: './images/spotify.png',
  disney_plus: './images/disney.png',
  disney_plus_bundle: './images/disney.png',
  youtube_premium: './images/youtube.png',
  crunchyroll: './images/crunchyroll.png',
  crunchyroll_mega_fan: './images/crunchyroll.png',
  hulu: './images/netflix.png',
  vpns: './images/browser.png',

  // AI & Dev
  ai_dev: './images/microchip.png',
  ai_productivity: './images/microchip.png',
  chatgpt_plus: './images/chatgpt.png',
  claude_35_pro: './images/claude.png',
  claude: './images/claude.png',
  midjourney: './images/midjourney.png',
  midjourney_basic: './images/midjourney.png',
  canva_pro: './images/canva.png',
  canva: './images/canva.png',
  windows_office_keys: './images/windows.png',
  custom_ai_agents: './images/AI.png',
  web_services: './images/code.png',

  // Cyber Hub
  cyber_hub: './images/hacker.png',
  cyber_security: './images/hacker.png',
  pentesting_tools: './images/hacker.png',
  pentest_tools: './images/hacker.png',
  pentest_tools_enterprise: './images/hacker.png',
  burp_suite: './images/burp-suite.png',
  zero_day_exploits: './images/hacker.png',
  red_team_packs: './images/hacker.png',
  cyber_courses: './images/certification.png',

  // Private Accounts
  private_accounts: './images/steam.png',
  rare_usernames: './images/instagram.png',
  high_level_gaming_accounts: './images/steam.png',

  // Default fallback
  default: './images/highlight_VrsStore.png'
};

const VRS_CATEGORY_ALIASES = {
  // Steam Vault aliases
  steam: 'steam_turkey',
  turkish: 'steam_turkey',
  argentina: 'steam_argentina',
  kazakhstan: 'steam_kazakhstan',
  ukraine: 'steam_ukraine',
  bundles: 'steam_game_bundles',
  games: 'steam_game_bundles',
  hours: 'steam_hour_boosted',
  collector: 'steam_high_tier',

  // Elite Gaming aliases
  fortnite: 'fortnite_accounts',
  fn: 'fortnite_accounts',
  cs2: 'cs2_accounts',
  csgo: 'cs2_accounts',
  pubg: 'pubg_accounts',
  valorant: 'valorant_accounts',
  val: 'valorant_accounts',

  // Premium Subs aliases
  netflix: 'netflix',
  spotify: 'spotify',
  disney: 'disney_plus',
  hulu: 'disney_plus',
  youtube: 'youtube_premium',
  crunchyroll: 'crunchyroll',
  anime: 'crunchyroll',
  vpn: 'vpns',

  // AI & Dev aliases
  chatgpt: 'chatgpt_plus',
  gpt: 'chatgpt_plus',
  midjourney: 'midjourney',
  mj: 'midjourney',
  canva: 'canva_pro',
  windows: 'windows_office_keys',
  office: 'windows_office_keys',
  ai: 'custom_ai_agents',
  agent: 'custom_ai_agents',
  web: 'web_services',

  // Cyber Hub aliases (preserved)
  cyber: 'pentesting_tools',
  hacking: 'pentesting_tools',
  pentest: 'pentesting_tools',
  exploit: 'zero_day_exploits',
  redteam: 'red_team_packs',
  courses: 'cyber_courses',

  // Private Accounts aliases
  og: 'rare_usernames',
  username: 'rare_usernames',
  rare: 'rare_usernames',
  accounts: 'high_level_gaming_accounts',

  // Legacy aliases (for backwards compatibility)
  fivem: 'fivem_scripts',
  maps: 'game_mods',
  mods: 'game_mods',
  subs: 'netflix',
  subscriptions: 'netflix',
};

// VRS_SEED_PRODUCTS is now loaded from ./js/data/products.js

window.ProductCard = {
  formatIQD(value) {
    return `${Number(value || 0).toLocaleString('en-US')} IQD`;
  },

  toNumber(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    return Number(String(value || '').replace(/[^0-9.]/g, '')) || 0;
  },

  escape(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  jsString(value) {
    return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  },

  categoryMeta(id) {
    return window.Navbar?.getCategoryMeta(id) || { id, name: String(id || '').replace(/_/g, ' ') };
  },

  iconHtml(product) {
    if (product.iconClass) return `<i class="fas ${product.iconClass}"></i>`;
    if (product.icon && String(product.icon).startsWith('fa-')) return `<i class="fas ${product.icon}"></i>`;
    const meta = this.categoryMeta(product.childCategory || product.parentCategory || product.category);
    return `<i class="fas ${meta.icon || 'fa-box'}"></i>`;
  },

  needsSecureTicket(product) {
    return Boolean(
      product.requiresTicket ||
      product.parentCategory === 'cyber_hub' ||
      product.childCategory === 'custom_ai_agents'
    );
  },

  // Advanced Auto-Mapping Engine for image rendering (2026 Product Catalog)
  // Uses centralized getAssetPath function from assets.js
  getProductImage(product) {
    try {
      // Check if product has explicit image
      if (product.image) return product.image;

      // Check if product has asset property
      if (product.asset) {
        // Ensure asset has correct path format
        if (product.asset.startsWith('./images/')) {
          return product.asset;
        }
        return `./images/${product.asset}`;
      }

      // Use centralized getAssetPath function if available
      if (typeof getAssetPath === 'function') {
        return getAssetPath(product.name || product.title, product.description);
      }

      // Fallback to VRS_IMAGE_MAP
      const cat = product.childCategory || product.parentCategory || product.category;
      if (cat && VRS_IMAGE_MAP[cat]) {
        return VRS_IMAGE_MAP[cat];
      }

      return './images/browser.png';
    } catch (error) {
      console.error('Error in getProductImage:', error);
      return './images/browser.png';
    }
  },

  // Get current currency from CurrencyConverter or localStorage
  getCurrentCurrency() {
    try {
      if (typeof CurrencyConverter !== 'undefined' && CurrencyConverter.currentCurrency) {
        return CurrencyConverter.currentCurrency;
      }
      return localStorage.getItem('vrs_currency') || 'IQD';
    } catch (error) {
      console.error('Error getting current currency:', error);
      return 'IQD';
    }
  },

  // Format price with currency (NO IQD text when USD active)
  formatPrice(amount, currency) {
    const num = Number(amount) || 0;
    if (currency === 'USD') {
      return '$' + num.toFixed(2);
    }
    return num.toLocaleString('en-US') + ' IQD';
  },

  // Minimal card render - VRS STORE V8.0
  render(product) {
    const p = ProductList.normalizeProduct(product);
    const id = String(p.id || p._id || '');
    const safeId = this.jsString(id);
    
    // Get image from ./images/ directory
    const imageUrl = this.getProductImage(p);
    
    // Currency handling
    const currentCurrency = this.getCurrentCurrency();
    const rate = (typeof CurrencyConverter !== 'undefined' && CurrencyConverter.currentRate)
      ? CurrencyConverter.currentRate
      : 1500;

    // Use currentPriceIQD and oldPriceIQD, with fallback to price/originalPrice
    const priceIQD = this.toNumber(p.currentPriceIQD || p.price);
    const originalIQD = this.toNumber(p.oldPriceIQD || p.originalPrice);

    // Ensure prices are valid numbers (fallback to 0 if invalid)
    const validPriceIQD = isNaN(priceIQD) || priceIQD === 0 ? 50000 : priceIQD;
    const validOriginalIQD = isNaN(originalIQD) || originalIQD === 0 ? 75000 : originalIQD;

    // Convert to USD if needed
    const priceDisplay = currentCurrency === 'USD' ? validPriceIQD / rate : validPriceIQD;
    const originalDisplay = currentCurrency === 'USD' ? validOriginalIQD / rate : validOriginalIQD;

    const hasDiscount = validOriginalIQD > validPriceIQD;

    // Calculate price drop percentage for SAVE % badge (discount > 10%)
    const priceDropPercent = validOriginalIQD > validPriceIQD ? ((validOriginalIQD - validPriceIQD) / validOriginalIQD * 100) : 0;
    const hasSaveBadge = priceDropPercent > 10;
    const isHotDeal = priceDropPercent > 20;

    // Truncate title with ellipsis (max 35 chars)
    const title = p.title || 'Product';
    const truncatedTitle = title.length > 35 ? title.substring(0, 32) + '...' : title;

    // Warranty in Days format
    const warrantyDays = p.warrantyDays || Math.floor((p.warrantyHours || 720) / 24);

    return `
      <article class="prod-card fade-up" role="listitem" data-id="${this.escape(id)}" data-parent="${this.escape(p.parentCategory)}" data-child="${this.escape(p.childCategory)}">
        <div class="prod-thumb">
          <img src="${this.escape(imageUrl)}" alt="${this.escape(title)}" loading="lazy"
               onerror="this.src='./images/highlight_VrsStore.png'">
          ${isHotDeal ? `<div class="prod-badge hot">HOT DEAL</div>` : ''}
          ${hasSaveBadge && !isHotDeal ? `<div class="prod-badge discount">SAVE ${Math.round(priceDropPercent)}%</div>` : ''}
          ${p.badge && !isHotDeal && !hasSaveBadge ? `<div class="prod-badge ${this.escape(p.badge)}">${this.escape(p.badge)}</div>` : ''}
        </div>
        <div class="prod-body">
          <!-- Truncated Title -->
          <h3 class="prod-name" title="${this.escape(title)}">${this.escape(truncatedTitle)}</h3>
          
          <!-- Warranty Badge -->
          <div class="vendor-meta">
            <span class="warranty-badge">
              <i class="fas fa-shield-check"></i> Full Warranty: ${warrantyDays} Days
            </span>
          </div>
          
          <!-- Price Section -->
          <div class="prod-price-wrap">
            ${hasDiscount ? `
              <span class="original-price" data-iqd="${originalIQD}" data-usd="${(originalIQD / rate).toFixed(2)}">
                ${this.formatPrice(originalDisplay, currentCurrency)}
              </span>
            ` : ''}
            <span class="price-tag ${hasDiscount ? 'discounted' : ''}" 
                  data-iqd="${priceIQD}" data-usd="${(priceIQD / rate).toFixed(2)}">
              ${this.formatPrice(priceDisplay, currentCurrency)}
            </span>
          </div>
          
          <!-- Actions: Buy + View Details -->
          <div class="prod-actions">
            <button class="btn-buy" onclick="ProductCard.buyNow(this, '${safeId}')">
              <i class="fas fa-shopping-cart"></i> Buy
            </button>
            <a href="./product-details.html?id=${encodeURIComponent(id)}" 
               class="btn-details" 
               onclick="localStorage.setItem('selectedProduct', JSON.stringify(${JSON.stringify(p).replace(/"/g, '&quot;')}))">
              <i class="fas fa-eye"></i> View
            </a>
          </div>
        </div>
      </article>
    `;
  },

  // Helper methods for vendor metadata
  truncateAccess(text) {
    if (!text) return '';
    return text.length > 25 ? text.substring(0, 22) + '...' : text;
  },

  truncateSource(text) {
    if (!text) return '';
    return text.length > 20 ? text.substring(0, 17) + '...' : text;
  },

  getSafetyClass(banProb) {
    const val = parseFloat(String(banProb).replace('%', ''));
    if (isNaN(val)) return 'neutral';
    if (val <= 0.5) return 'safe';
    if (val <= 2.0) return 'moderate';
    return 'risk';
  },

  showProtocol(productId) {
    const product = ProductList.getProduct(productId);
    if (!product || !product.loginProtocol) return;

    const modal = document.getElementById('protocolModal') || this.createProtocolModal();
    const content = modal.querySelector('.protocol-content');
    content.innerHTML = `
      <div class="protocol-header">
        <h3><i class="fas fa-fingerprint"></i> Login Protocol</h3>
        <p class="protocol-subtitle">${this.escape(product.title)}</p>
      </div>
      <div class="protocol-body">
        <div class="protocol-steps">
          <h4>Access Instructions</h4>
          <p class="protocol-text">${this.escape(product.loginProtocol)}</p>
        </div>
        ${product.accessLevel ? `
        <div class="protocol-access">
          <h4>Access Level</h4>
          <span class="access-pill"><i class="fas fa-key"></i> ${this.escape(product.accessLevel)}</span>
        </div>
        ` : ''}
        ${product.warrantyHours ? `
        <div class="protocol-warranty">
          <h4>Replacement Guarantee</h4>
          <p><i class="fas fa-shield-check"></i> ${product.warrantyHours}-hour replacement guarantee. Full support coverage during warranty period.</p>
        </div>
        ` : ''}
      </div>
      <div class="protocol-footer">
        <button class="btn btn-glass" onclick="ProductCard.closeProtocolModal()">Close</button>
      </div>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  createProtocolModal() {
    const modal = document.createElement('div');
    modal.id = 'protocolModal';
    modal.className = 'modal protocol-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="ProductCard.closeProtocolModal()"></div>
      <div class="modal-content protocol-content"></div>
    `;
    document.body.appendChild(modal);
    return modal;
  },

  closeProtocolModal() {
    const modal = document.getElementById('protocolModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  skeleton() {
    return `
      <div class="prod-card skeleton">
        <div class="sk-thumb"></div>
        <div class="sk-body">
          <div class="sk-line" style="width:52%"></div>
          <div class="sk-line" style="width:88%;height:22px"></div>
          <div class="sk-line" style="width:100%;height:54px"></div>
          <div class="sk-line" style="width:70%;height:26px"></div>
        </div>
      </div>
    `;
  },

  stars(rating) {
    const rounded = Math.round((Number(rating) || 0) * 2) / 2;
    let html = '';
    for (let i = 1; i <= 5; i += 1) {
      html += `<i class="${i <= Math.ceil(rounded) ? 'fas' : 'far'} fa-star"></i>`;
    }
    return `<div class="stars">${html}</div>`;
  },

  buyNow(btn, productId) {
    const product = ProductList.getProduct(productId);
    if (!product) {
      Toast.show('Product could not be found.', 'error');
      return;
    }

    ProductList.setBreadcrumbProduct(productId);

    if (this.needsSecureTicket(product)) {
      this.openSecureTicket(product);
      return;
    }

    const cartProduct = {
      id: product.id || product._id,
      name: product.title,
      price: product.unitPrice,
      icon: this.iconHtml(product),
    };

    const added = Store.cart.add(cartProduct);
    if (!added) {
      Payment.open();
      return;
    }

    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-check"></i> Added';
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = original;
      Payment.open();
    }, 450);
  },

  openSecureTicket(product) {
    const existing = document.getElementById('secureTicketPrompt');
    existing?.remove();

    const payload = this.ticketPayload(product);
    const overlay = document.createElement('div');
    overlay.className = 'ticket-modal-overlay';
    overlay.id = 'secureTicketPrompt';
    overlay.innerHTML = `
      <div class="ticket-modal" role="dialog" aria-modal="true" aria-label="Open Secure Discord Ticket">
        <span class="eyebrow"><i class="fas fa-shield"></i> n8n Secure Ticket Hook</span>
        <h3>Open Secure Discord Ticket</h3>
        <p>This item requires private verification before fulfillment. The ticket payload will be copied and, when configured, sent to the n8n webhook.</p>
        <div class="ticket-preview" style="margin-top:.8rem;"><pre>${this.escape(payload.message)}</pre></div>
        <div class="ticket-modal-actions">
          <button class="btn btn-glass" onclick="ProductCard.closeSecureTicket()">Cancel</button>
          <button class="btn btn-primary" onclick="ProductCard.confirmSecureTicket('${this.jsString(product.id || product._id)}')">
            <i class="fab fa-discord"></i> Open Secure Discord Ticket
          </button>
        </div>
      </div>
    `;
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) this.closeSecureTicket();
    });
    document.body.appendChild(overlay);
  },

  closeSecureTicket() {
    document.getElementById('secureTicketPrompt')?.remove();
  },

  async confirmSecureTicket(productId) {
    const product = ProductList.getProduct(productId);
    if (!product) return;

    const payload = this.ticketPayload(product);
    const webhook = window.VRS_N8N_TICKET_WEBHOOK || window.VRS_CONFIG?.automation?.n8nTicketWebhook || '';

    // Copy payload to clipboard
    navigator.clipboard?.writeText(payload.message).catch(() => {});

    // Send to n8n webhook if configured
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.warn('Failed to send ticket to webhook:', error);
      }
    }

    // Open Discord with enhanced deep link
    if (payload.discordDeepLink) {
      window.open(payload.discordDeepLink, '_blank', 'noopener');
    } else {
      // Fallback to regular Discord server
      const discord = window.VRS_CONFIG?.contact?.discordServer || 'https://discord.gg/XNVFmg54Vq';
      window.open(discord, '_blank', 'noopener');
    }

    // Show enhanced success message with priority and fulfillment info
    const successMessage = [
      `🎫 Secure ticket created!`,
      `Priority: ${payload.priority}`,
      `Est. fulfillment: ${payload.estimatedFulfillment}`,
      'Discord is opening now...'
    ].join(' ');
    
    Toast.show(successMessage, 'success', 'fab fa-discord');
    this.closeSecureTicket();
  },

  ticketPayload(product) {
    const user = AppState.get('user')?.username || 'guest';
    const parent = this.categoryMeta(product.parentCategory);
    const child = this.categoryMeta(product.childCategory);
    const price = this.formatIQD(product.unitPrice);
    const timestamp = new Date().toISOString();
    
    // Enhanced Discord Deep Link with context-aware metadata
    const discordMessage = encodeURIComponent([
      '🎫 **SECURE TICKET REQUEST**',
      '',
      '**Store:** VRS STORE',
      `**Product:** ${product.title}`,
      `**Category:** ${parent.name} > ${child.name}`,
      `**Price:** ${price}`,
      `**Product ID:** ${product.id || product._id}`,
      `**User:** ${user}`,
      `**Request Time:** ${new Date().toLocaleString('en-US')}`,
      '',
      '**Automation:** n8n secure-ticket intake',
      `**Metadata:** ${timestamp}`,
      '',
      '*Please review this request for manual verification and fulfillment.*'
    ].join('\n'));

    // Create Discord deep link with metadata
    const discordDeepLink = `https://discord.com/channels/@me?content=${discordMessage}`;

    const message = [
      '🎫 SECURE TICKET REQUEST',
      '',
      `Store: VRS STORE`,
      `Product: ${product.title}`,
      `Path: ${parent.name} > ${child.name}`,
      `Price: ${price}`,
      `Product ID: ${product.id || product._id}`,
      `User: ${user}`,
      `Time: ${new Date().toLocaleString('en-US')}`,
      '',
      'Automation: n8n secure-ticket intake',
      `Metadata: ${timestamp}`,
      '',
      'Please review this request for manual verification and fulfillment.'
    ].join('\n');

    return {
      type: 'secure_ticket',
      source: 'vrs-store-v7-midnight-cobalt',
      productId: product.id || product._id,
      productTitle: product.title,
      parentCategory: product.parentCategory,
      childCategory: product.childCategory,
      categoryName: parent.name,
      subcategoryName: child.name,
      price: product.unitPrice,
      formattedPrice: price,
      currency: 'IQD',
      user,
      userId: AppState.get('user')?.id || null,
      timestamp,
      message,
      discordDeepLink,
      priority: this.getTicketPriority(product),
      estimatedFulfillment: this.getEstimatedFulfillment(product),
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        sessionId: this.getSessionId(),
        cartContents: Store.cart?.items() || [],
        appliedCoupon: DiscountSystem?.getCurrentCoupon() || null
      }
    };
  },

  /**
   * Determine ticket priority based on product type and price
   */
  getTicketPriority(product) {
    const price = Number(product.unitPrice) || 0;
    
    // High priority for expensive items or sensitive categories
    if (product.parentCategory === 'cyber_hub' || price > 100000) {
      return 'HIGH';
    }
    
    // Medium priority for AI development or custom services
    if (product.parentCategory === 'ai_dev' || product.childCategory === 'custom_ai_agents') {
      return 'MEDIUM';
    }
    
    return 'NORMAL';
  },

  /**
   * Get estimated fulfillment time based on product category
   */
  getEstimatedFulfillment(product) {
    const fulfillmentTimes = {
      'cyber_hub': '2-4 hours',
      'ai_dev': '4-8 hours',
      'web_services': '1-3 days',
      'private_accounts': '30 minutes - 2 hours',
      'gaming_zone': '15-30 minutes',
      'premium_subs': '5-15 minutes'
    };
    
    return fulfillmentTimes[product.parentCategory] || '1-2 hours';
  },

  /**
   * Generate or retrieve session ID for tracking
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('vrs_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('vrs_session_id', sessionId);
    }
    return sessionId;
  },

  async toggleWishlist(event, id) {
    event.stopPropagation();
    if (!Store.auth.isLoggedIn()) {
      Toast.show('Login is required to use the wishlist.', 'warn');
      Auth.openModal();
      return;
    }

    try {
      const res = await endpoints.toggleWishlist(id);
      const wishlist = res.data || [];
      const inList = wishlist.some((w) => String(w) === id || String(w?._id) === id);
      AppState.set('wishlist', wishlist);
      const btn = event.currentTarget;
      btn.classList.toggle('active', inList);
      const icon = btn.querySelector('i');
      if (icon) icon.className = `fa${inList ? 's' : 'r'} fa-heart`;
      Toast.show(inList ? 'Added to wishlist.' : 'Removed from wishlist.', 'info');
    } catch (err) {
      Toast.show(err?.message || 'Wishlist update failed.', 'error');
    }
  },
};

window.HomepageModules = {
  init() {
    this.renderFlashDeals();
  },

  renderFlashDeals() {
    const track = document.getElementById('flashTrack');
    if (!track) return;

    const products = ProductList.seedProducts()
      .filter((product) => product.discount || product.isFeatured)
      .slice(0, 8);

    track.innerHTML = products.map((product) => {
      const parent = Navbar.getCategoryMeta(product.parentCategory);
      const child = Navbar.getCategoryMeta(product.childCategory);
      const price = ProductCard.formatIQD(product.unitPrice);
      const safeId = ProductCard.jsString(product.id);
      const basePrice = (product.unitPrice / (CurrencyConverter?.currentRate || 1310)).toFixed(2);
      return `
        <article class="flash-card">
          <div class="flash-card-top">
            <span class="flash-icon">${ProductCard.iconHtml(product)}</span>
            <span class="flash-badge">${product.discount ? `${Number(product.discount).toLocaleString('en-US')}% OFF` : 'Featured'}</span>
          </div>
          <div>
            <span class="eyebrow">${ProductCard.escape(parent.name)} / ${ProductCard.escape(child.name)}</span>
            <h3>${ProductCard.escape(product.title)}</h3>
            <p>${ProductCard.escape(product.description)}</p>
          </div>
          <div class="flash-price-row">
            <strong class="price-tag" data-iqd="${priceIQD}" data-usd="${(priceIQD / rate).toFixed(2)}">${price}</strong>
          </div>
          <button class="btn btn-glass" onclick="Navbar.selectCategory('${ProductCard.jsString(product.childCategory)}');ProductList.setBreadcrumbProduct('${safeId}')">
            <i class="fas fa-arrow-right"></i> View Deal
          </button>
        </article>
      `;
    }).join('');
  },
};

window.ProductList = {
  el: null,
  productsById: new Map(),
  _loading: false,
  _allProducts: [],
  _breadcrumbProductId: null,
  filterState: {
    category: 'all',
    sort: 'newest',
    search: '',
  },

  init() {
    this.el = document.getElementById('prodsGrid');
    this.filterState = {
      category: AppState.get('currentFilter') || 'all',
      sort: AppState.get('currentSort') || document.getElementById('sortSelect')?.value || 'newest',
      search: AppState.get('currentSearch') || '',
    };

    this.bindSort();
    HomepageModules.init();

    AppState.on('wishlist', () => this.refreshWishlistButtons());
    AppState.on('currentFilter', (value) => {
      this.filterState.category = value || 'all';
      this._breadcrumbProductId = null;
      if (this.el) this.el.innerHTML = '';
      this.applyAndRender();
    });
    AppState.on('currentSort', (value) => {
      this.filterState.sort = value || 'newest';
      this.applyAndRender();
    });
    AppState.on('currentSearch', (value) => {
      this.filterState.search = value || '';
      this._breadcrumbProductId = null;
      if (this.el) this.el.innerHTML = '';
      this.applyAndRender();
    });
    AppState.on('currentBreadcrumbProduct', (id) => {
      this._breadcrumbProductId = id;
      this.renderBreadcrumb(this.getProduct(id));
    });
  },

  seedProducts() {
    return VRS_SEED_PRODUCTS.map((product) => this.normalizeProduct(product));
  },

  bindSort() {
    const select = document.getElementById('sortSelect');
    if (!select) return;
    select.value = this.filterState.sort;
    select.addEventListener('change', () => {
      const selectedSort = select.value;
      AppState.set('currentSort', selectedSort);
      AppState.set('currentPage', 1);
      this.applyAndRender();
    });
  },

  showSkeletons(count = 8) {
    if (!this.el) return;
    this.el.innerHTML = Array.from({ length: count }, () => ProductCard.skeleton()).join('');
  },

  normalizeCategory(raw) {
    const key = String(raw || '').trim().toLowerCase();
    return VRS_CATEGORY_ALIASES[key] || key;
  },

  parentForChild(childId) {
    for (const parent of Navbar.taxonomy()) {
      if (parent.children.some((child) => child.id === childId)) return parent.id;
    }
    return null;
  },

  firstChildForParent(parentId) {
    const parent = Navbar.taxonomy().find((item) => item.id === parentId);
    return parent?.children?.[0]?.id || '';
  },

  normalizeProduct(product = {}) {
    const id = String(product.id || product._id || '');
    const rawCategory = product.childCategory || product.subcategory || product.category || product.cat || '';
    let childCategory = this.normalizeCategory(rawCategory);
    let parentCategory = product.parentCategory || this.parentForChild(childCategory);

    if (!parentCategory && Navbar.taxonomy().some((parent) => parent.id === childCategory)) {
      parentCategory = childCategory;
      childCategory = product.childCategory || product.subcategory || this.firstChildForParent(parentCategory);
    }

    if (!parentCategory) {
      parentCategory = this.parentForChild(childCategory) || 'gaming_zone';
    }

    if (!childCategory || childCategory === parentCategory) {
      childCategory = this.firstChildForParent(parentCategory);
    }

    // Use currentPriceIQD as the primary price field for sorting
    const currentPriceIQD = ProductCard.toNumber(product.currentPriceIQD);
    const oldPriceIQD = ProductCard.toNumber(product.oldPriceIQD);
    
    // Fallback to legacy price fields if new fields don't exist
    const basePrice = ProductCard.toNumber(product.originalPrice ?? product.price);
    const discount = Math.max(0, Math.min(100, Number(product.discountPercentage ?? product.discount ?? 0) || 0));
    const explicitFinal = product.discountedPrice ?? product.finalPrice ?? product.unitPrice;
    
    // Use currentPriceIQD if available, otherwise calculate from legacy fields
    const unitPrice = currentPriceIQD || (explicitFinal !== undefined && explicitFinal !== null
      ? ProductCard.toNumber(explicitFinal)
      : +(basePrice * (1 - discount / 100)).toFixed(2));

    return {
      ...product,
      id,
      title: product.title || product.name || 'Untitled product',
      description: product.description || product.desc || '',
      parentCategory,
      childCategory,
      category: childCategory,
      originalPrice: oldPriceIQD || (product.originalPrice ? ProductCard.toNumber(product.originalPrice) : (discount ? basePrice : null)),
      discount,
      unitPrice,
      currentPriceIQD,
      oldPriceIQD,
      iconClass: product.iconClass || Navbar.getCategoryMeta(childCategory).icon || 'fa-box',
      createdAt: product.createdAt || product.updatedAt || new Date().toISOString(),
    };
  },

  categoryMatches(product, selectedCategory) {
    if (!selectedCategory || selectedCategory === 'all') return true;
    const selected = this.normalizeCategory(selectedCategory);
    const meta = Navbar.getCategoryMeta(selected);

    if (meta.isParent) {
      return (product.category || product.parentCategory) === selected;
    }

    return (product.subCategory || product.childCategory) === selected;
  },

  filterBySearch(products, query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return [...products];

    return products.filter((product) => {
      const fields = [
        product.name || product.title,
        product.description,
        product.category || product.parentCategory,
        product.subCategory || product.childCategory,
        Navbar.getCategoryMeta(product.category || product.parentCategory)?.name || '',
        Navbar.getCategoryMeta(product.subCategory || product.childCategory)?.name || '',
      ].join(' ').toLowerCase();
      return fields.includes(q);
    });
  },

  sortProducts(products, sortKey) {
    const list = [...products];
    const price = (p) => Number(p.currentPriceIQD || p.unitPrice || 0);
    const date = (p) => new Date(p.createdAt || p.updatedAt || 0).getTime();

    if (sortKey === 'price_asc') return list.sort((a, b) => price(a) - price(b));
    if (sortKey === 'price_desc') return list.sort((a, b) => price(b) - price(a));
    if (sortKey === 'oldest') return list.sort((a, b) => date(a) - date(b));
    if (sortKey === 'rating') return list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    if (sortKey === 'popular') return list.sort((a, b) => Number(b.salesCount || 0) - Number(a.salesCount || 0));
    return list.sort((a, b) => date(b) - date(a));
  },

  applyAndRender() {
    if (!this.el) return;
    const categoryFiltered = this._allProducts.filter((product) => this.categoryMatches(product, this.filterState.category));
    const searched = this.filterBySearch(categoryFiltered, this.filterState.search);
    const sorted = this.sortProducts(searched, this.filterState.sort);
    this.render(sorted);
  },

  render(products) {
    if (!this.el) return;

    const grid = this.el;
    grid.innerHTML = '';

    this.renderBreadcrumb(this.getProduct(this._breadcrumbProductId));
    this.renderActiveFilter(products.length);

    if (!products.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-box-open"></i>
          <h3>No products found</h3>
          <p>${this.filterState.search ? `No products found for "${ProductCard.escape(this.filterState.search)}"` : 'The selected category is isolated and currently has no matching items.'}</p>
          <div class="empty-state-actions">
            <button class="btn btn-glass" onclick="ProductList.clearFilters()">
              <i class="fas fa-xmark"></i> Clear Filters
            </button>
            ${this.filterState.search ? `<a href="#" class="btn btn-glass" onclick="alert('Product request feature coming soon! Request: ${ProductCard.escape(this.filterState.search)}')"><i class="fas fa-plus"></i> Request this product</a>` : ''}
          </div>
        </div>
      `;
      Pagination.render(null);
      return;
    }

    const gridHtml = products.map((product) => ProductCard.render(product)).join('');
    grid.innerHTML = gridHtml;
    // Trigger fade-in animation for new cards
    requestAnimationFrame(() => {
      grid.querySelectorAll('.fade-up').forEach((el, index) => {
        setTimeout(() => el.classList.add('visible'), index * 50);
      });
    });
    Animations.observe?.();
    Pagination.render(null);
  },

  renderActiveFilter(count) {
    const strip = document.getElementById('activeFilterStrip');
    if (!strip) return;

    const category = this.filterState.category || 'all';
    const meta = Navbar.getCategoryMeta(category);
    const search = this.filterState.search ? ` / Search: "${ProductCard.escape(this.filterState.search)}"` : '';
    strip.innerHTML = `
      <span><strong>${ProductCard.escape(meta.name)}</strong>${search} / ${Number(count || 0).toLocaleString('en-US')} items</span>
      <button class="btn btn-glass" onclick="ProductList.clearFilters()"><i class="fas fa-rotate-left"></i> Reset</button>
    `;
  },

  renderBreadcrumb(product = null) {
    const trail = document.getElementById('breadcrumbTrail');
    if (!trail) return;

    const category = this.filterState.category || 'all';
    const meta = Navbar.getCategoryMeta(category);
    const parent = product ? Navbar.getCategoryMeta(product.parentCategory) : (meta.parent || (meta.isParent ? meta : null));
    const child = product ? Navbar.getCategoryMeta(product.childCategory) : (!meta.isParent && category !== 'all' ? meta : null);

    const parts = [
      '<button onclick="ProductList.clearFilters()">Home</button>',
      '<span><i class="fas fa-chevron-right"></i></span>',
    ];

    if (parent) {
      parts.push(`<button onclick="Navbar.selectCategory('${ProductCard.jsString(parent.id)}')">${ProductCard.escape(parent.name)}</button>`);
      parts.push('<span><i class="fas fa-chevron-right"></i></span>');
    }

    if (product) {
      if (child) {
        parts.push(`<button onclick="Navbar.selectCategory('${ProductCard.jsString(child.id)}')">${ProductCard.escape(child.name)}</button>`);
        parts.push('<span><i class="fas fa-chevron-right"></i></span>');
      }
      parts.push(`<strong>${ProductCard.escape(product.title)}</strong>`);
    } else if (child) {
      parts.push(`<strong>${ProductCard.escape(child.name)}</strong>`);
    } else {
      parts.push(`<strong>${ProductCard.escape(meta.name || 'Marketplace')}</strong>`);
    }

    trail.innerHTML = parts.join('');
  },

  setBreadcrumbProduct(productId) {
    const product = this.getProduct(productId);
    if (!product) return;
    this._breadcrumbProductId = productId;
    AppState.set('currentBreadcrumbProduct', productId);
    this.renderBreadcrumb(product);
  },

  async load() {
    if (this._loading) return;
    this._loading = true;
    this.showSkeletons();

    try {
      const res = await endpoints.getProducts({ page: 1, limit: 200 });
      const remote = Array.isArray(res.data) ? res.data : [];
      this._allProducts = remote.length ? remote.map((item) => this.normalizeProduct(item)) : this.seedProducts();
    } catch {
      this._allProducts = this.seedProducts();
    } finally {
      this.productsById = new Map(this._allProducts.map((product) => [String(product.id || product._id), product]));
      AppState.set('products', this._allProducts);
      AppState.set('totalPages', 1);
      AppState.set('totalProducts', this._allProducts.length);
      this._loading = false;
      this.applyAndRender();
    }
  },

  getProduct(productId) {
    return this.productsById.get(String(productId));
  },

  clearFilters() {
    this._breadcrumbProductId = null;
    AppState.set('currentFilter', 'all');
    AppState.set('currentSearch', '');
    AppState.set('currentSort', 'newest');
    AppState.set('currentPage', 1);
    const search = document.getElementById('searchInput');
    if (search) search.value = '';
    const clear = document.getElementById('searchClear');
    if (clear) clear.style.display = 'none';
    const sort = document.getElementById('sortSelect');
    if (sort) sort.value = 'newest';
    this.applyAndRender();
  },

  refreshWishlistButtons() {
    const wishlist = AppState.get('wishlist') || [];
    document.querySelectorAll('.wishlist-btn').forEach((btn) => {
      const id = btn.closest('.prod-card')?.dataset.id;
      const inList = wishlist.some((w) => String(w) === id || String(w?._id) === id);
      btn.classList.toggle('active', inList);
      const icon = btn.querySelector('i');
      if (icon) icon.className = `fa${inList ? 's' : 'r'} fa-heart`;
    });
  },
};
