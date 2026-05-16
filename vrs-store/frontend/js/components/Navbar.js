/* ================================================================
   NAVBAR.JS - VRS STORE V4.0 mega menu, right sidebar taxonomy,
   sticky navigation, hero slider, and flash countdown.
   ================================================================ */
(function defineVrsTaxonomy() {
  const taxonomy = [
    {
      id: 'steam_vault',
      name: 'Steam Vault',
      icon: 'fa-steam',
      children: [
        { id: 'steam_turkey', name: 'Steam Turkey TL', icon: 'fa-lira-sign' },
        { id: 'steam_argentina', name: 'Steam Argentina ARS', icon: 'fa-peso-sign' },
        { id: 'steam_kazakhstan', name: 'Steam Kazakhstan KZT', icon: 'fa-earth-asia' },
        { id: 'steam_ukraine', name: 'Steam Ukraine UAH', icon: 'fa-hryvnia-sign' },
        { id: 'steam_game_bundles', name: 'Game Bundles', icon: 'fa-box-open' },
        { id: 'steam_hour_boosted', name: 'Hour-Boosted Accounts', icon: 'fa-clock' },
        { id: 'steam_high_tier', name: 'High-Tier Accounts', icon: 'fa-trophy' },
      ],
    },
    {
      id: 'elite_gaming',
      name: 'Elite Gaming',
      icon: 'fa-gamepad',
      children: [
        { id: 'fortnite_accounts', name: 'Fortnite Accounts', icon: 'fa-crosshairs' },
        { id: 'cs2_accounts', name: 'CS2 Accounts', icon: 'fa-gun' },
        { id: 'pubg_accounts', name: 'PUBG Accounts', icon: 'fa-bullseye' },
        { id: 'valorant_accounts', name: 'Valorant Accounts', icon: 'fa-shield-halved' },
        { id: 'fivem_scripts', name: 'FiveM Scripts', icon: 'fa-scroll' },
        { id: 'game_mods', name: 'Game Mods', icon: 'fa-puzzle-piece' },
      ],
    },
    {
      id: 'premium_subs',
      name: 'Premium Subs',
      icon: 'fa-crown',
      children: [
        { id: 'netflix', name: 'Netflix', icon: 'fa-tv' },
        { id: 'spotify', name: 'Spotify', icon: 'fa-music' },
        { id: 'disney_plus', name: 'Disney+ & Hulu', icon: 'fa-film' },
        { id: 'youtube_premium', name: 'YouTube Premium', icon: 'fa-play' },
        { id: 'crunchyroll', name: 'Crunchyroll', icon: 'fa-dragon' },
        { id: 'vpns', name: 'VPNs', icon: 'fa-lock' },
      ],
    },
    {
      id: 'ai_dev',
      name: 'AI & Dev Tools',
      icon: 'fa-robot',
      children: [
        { id: 'chatgpt_plus', name: 'ChatGPT Plus', icon: 'fa-brain' },
        { id: 'midjourney', name: 'Midjourney', icon: 'fa-palette' },
        { id: 'canva_pro', name: 'Canva Pro', icon: 'fa-pen-ruler' },
        { id: 'windows_office_keys', name: 'Windows/Office Keys', icon: 'fa-laptop-code' },
        { id: 'custom_ai_agents', name: 'Custom AI Agents', icon: 'fa-microchip' },
        { id: 'web_services', name: 'Web Services', icon: 'fa-globe' },
      ],
    },
    {
      id: 'cyber_hub',
      name: 'Cyber Hub',
      icon: 'fa-shield-halved',
      children: [
        { id: 'pentesting_tools', name: 'Pentesting Tools', icon: 'fa-bug' },
        { id: 'zero_day_exploits', name: '0-day Exploits', icon: 'fa-triangle-exclamation' },
        { id: 'red_team_packs', name: 'Red Team Packs', icon: 'fa-user-shield' },
        { id: 'cyber_courses', name: 'Courses', icon: 'fa-graduation-cap' },
      ],
    },
    {
      id: 'private_accounts',
      name: 'Private Accounts',
      icon: 'fa-user-secret',
      children: [
        { id: 'rare_usernames', name: 'Rare Usernames', icon: 'fa-at' },
        { id: 'high_level_gaming_accounts', name: 'High-Level Gaming', icon: 'fa-ranking-star' },
      ],
    },
  ];

  window.VRS_TAXONOMY = window.VRS_TAXONOMY || taxonomy;
})();

window.Navbar = {
  sections: ['home', 'flash', 'categories', 'products', 'support'],
  _heroIndex: 0,
  _heroTimer: null,

  init() {
    this.renderTaxonomy();
    this.renderCategoryGlance();
    this.bindScroll();
    this.bindMobile();
    this.bindMegaMenu();
    this.bindCategorySidebar();
    this.bindHeroSlider();
    this.bindFlashCountdown();
    this.render();

    AppState.on('user', () => this.render());
    AppState.on('currentFilter', (id) => this.syncActiveCategory(id || 'all'));
    document.addEventListener('auth:login', () => this.render());
    document.addEventListener('auth:logout', () => this.render());
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#navUserMenu')) {
        document.getElementById('userDropdown')?.classList.remove('show');
      }
    });
  },

  taxonomy() {
    return window.VRS_TAXONOMY || [];
  },

  getCategoryMeta(id) {
    if (!id || id === 'all') return { id: 'all', name: 'Marketplace', parent: null };
    for (const parent of this.taxonomy()) {
      if (parent.id === id) return { ...parent, parent: null, isParent: true };
      const child = parent.children.find((item) => item.id === id);
      if (child) return { ...child, parent, isParent: false };
    }
    return { id, name: this.titleize(id), parent: null };
  },

  titleize(value) {
    return String(value || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  },

  render() {
    const user = AppState.get('user');
    const target = document.getElementById('authBtn');
    if (!target) return;

    if (user) {
      const isAdmin = user.role === 'admin';
      target.innerHTML = `
        <div class="nav-user-menu" id="navUserMenu">
          <button class="btn-user" onclick="Navbar.toggleMenu(event)">
            <i class="fas fa-user-circle"></i>
            <span>${this.escape(user.username || 'Account')}</span>
            <i class="fas fa-chevron-down caret"></i>
          </button>
          <div class="user-dropdown" id="userDropdown">
            ${isAdmin ? `<a class="dropdown-item admin-item" onclick="AdminPanel.show();Navbar.closeMenu()">
              <i class="fas fa-cog"></i> Admin Panel
            </a><div class="dropdown-sep"></div>` : ''}
            <a class="dropdown-item" onclick="UserPanel.show();Navbar.closeMenu()">
              <i class="fas fa-user"></i> Profile
            </a>
            <a class="dropdown-item" onclick="UserPanel.showOrders();Navbar.closeMenu()">
              <i class="fas fa-bag-shopping"></i> Orders
            </a>
            <a class="dropdown-item" onclick="UserPanel.showWishlist();Navbar.closeMenu()">
              <i class="fas fa-heart"></i> Wishlist
            </a>
            <div class="dropdown-sep"></div>
            <a class="dropdown-item danger" onclick="Auth.logout()">
              <i class="fas fa-sign-out-alt"></i> Logout
            </a>
          </div>
        </div>`;
    } else {
      target.innerHTML = `
        <button class="btn-login" onclick="Auth.openModal()">
          <i class="fas fa-sign-in-alt"></i> Login
        </button>`;
    }
  },

  renderTaxonomy() {
    const mega = document.getElementById('megaGrid');
    const side = document.getElementById('categorySidebarBody');
    const taxonomy = this.taxonomy();

    if (mega) {
      mega.innerHTML = taxonomy.map((parent) => `
        <div class="mega-column">
          <button class="mega-parent" data-category="${parent.id}" onclick="Navbar.selectCategory('${parent.id}')">
            <i class="fas ${parent.icon}"></i>
            <span>${this.escape(parent.name)}</span>
          </button>
          ${parent.children.map((child) => `
            <button class="mega-child" data-category="${child.id}" onclick="Navbar.selectCategory('${child.id}')">
              <i class="fas ${child.icon}"></i>
              <span>${this.escape(child.name)}</span>
            </button>
          `).join('')}
        </div>
      `).join('');
    }

    if (side) {
      side.innerHTML = `
        <button class="sidebar-parent-btn" data-category="all" onclick="Navbar.selectCategory('all')">
          <span><i class="fas fa-store"></i> All Marketplace</span>
          <i class="fas fa-chevron-right"></i>
        </button>
        ${taxonomy.map((parent) => `
          <div class="sidebar-group">
            <button class="sidebar-parent-btn" data-category="${parent.id}" onclick="Navbar.selectCategory('${parent.id}')">
              <span><i class="fas ${parent.icon}"></i> ${this.escape(parent.name)}</span>
              <i class="fas fa-chevron-right"></i>
            </button>
            <div class="sidebar-children">
              ${parent.children.map((child) => `
                <button class="sidebar-child" data-category="${child.id}" onclick="Navbar.selectCategory('${child.id}')">
                  <i class="fas ${child.icon}"></i>
                  <span>${this.escape(child.name)}</span>
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      `;
    }

    this.syncActiveCategory(AppState.get('currentFilter') || 'all');
  },

  renderCategoryGlance() {
    const row = document.getElementById('categoryGlanceRow');
    if (!row) return;

    row.innerHTML = this.taxonomy().map((parent) => {
      const childNames = parent.children.map((child) => child.name).join(', ');
      return `
        <button class="glance-card fade-up" onclick="Navbar.selectCategory('${parent.id}')">
          <span class="glance-icon"><i class="fas ${parent.icon}"></i></span>
          <strong>${this.escape(parent.name)}</strong>
          <span>${this.escape(childNames)}</span>
        </button>
      `;
    }).join('');
    Animations.observe?.();
  },

  selectCategory(categoryId = 'all') {
    AppState.set('currentFilter', categoryId || 'all');
    AppState.set('currentPage', 1);
    AppState.set('currentBreadcrumbProduct', null);
    this.syncActiveCategory(categoryId || 'all');
    this.closeMegaMenu();
    this.closeCategorySidebar();
    document.getElementById('mobileMenu')?.classList.remove('show');
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  syncActiveCategory(categoryId = 'all') {
    document.querySelectorAll('[data-category]').forEach((el) => {
      el.classList.toggle('active', el.dataset.category === categoryId);
    });
  },

  openCategorySidebar() {
    const toggle = document.getElementById('categorySidebarToggle');
    document.getElementById('categorySidebar')?.classList.add('open');
    document.getElementById('categorySidebarOverlay')?.classList.add('show');
    toggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  },

  closeCategorySidebar() {
    const toggle = document.getElementById('categorySidebarToggle');
    document.getElementById('categorySidebar')?.classList.remove('open');
    document.getElementById('categorySidebarOverlay')?.classList.remove('show');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  },

  toggleMenu(e) {
    e.stopPropagation();
    document.getElementById('userDropdown')?.classList.toggle('show');
  },

  closeMenu() {
    document.getElementById('userDropdown')?.classList.remove('show');
  },

  bindScroll() {
    const nav = document.getElementById('navbar');
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        nav?.classList.toggle('scrolled', window.scrollY > 28);
        let current = '';
        this.sections.forEach((id) => {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= 110) current = id;
        });
        document.querySelectorAll('.nav-link').forEach((a) => {
          a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
        });
        ticking = false;
      });
    }, { passive: true });
  },

  bindMobile() {
    const btn = document.getElementById('mobileBtn');
    const menu = document.getElementById('mobileMenu');
    btn?.addEventListener('click', () => {
      menu?.classList.toggle('show');
      btn.setAttribute('aria-expanded', menu?.classList.contains('show') ? 'true' : 'false');
    });
    document.querySelectorAll('.mobile-menu a').forEach((a) => {
      a.addEventListener('click', () => {
        menu?.classList.remove('show');
        btn?.setAttribute('aria-expanded', 'false');
      });
    });
  },

  bindMegaMenu() {
    const trigger = document.getElementById('megaTrigger');
    const menu = document.getElementById('megaMenu');
    if (!trigger || !menu) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const show = !menu.classList.contains('show');
      menu.classList.toggle('show', show);
      trigger.setAttribute('aria-expanded', show ? 'true' : 'false');
    });

    menu.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', () => this.closeMegaMenu());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMegaMenu();
        this.closeCategorySidebar();
      }
    });
  },

  closeMegaMenu() {
    document.getElementById('megaMenu')?.classList.remove('show');
    document.getElementById('megaTrigger')?.setAttribute('aria-expanded', 'false');
  },

  bindCategorySidebar() {
    document.getElementById('categorySidebarToggle')?.addEventListener('click', () => this.openCategorySidebar());
    document.getElementById('categorySidebarClose')?.addEventListener('click', () => this.closeCategorySidebar());
    document.getElementById('categorySidebarOverlay')?.addEventListener('click', () => this.closeCategorySidebar());
  },

  bindHeroSlider() {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = document.getElementById('heroDots');
    if (!slides.length || !dots) return;

    dots.innerHTML = slides.map((_, i) => `
      <button class="hero-dot${i === 0 ? ' active' : ''}" aria-label="Go to featured deal ${i + 1}" onclick="Navbar.goHero(${i})"></button>
    `).join('');

    document.getElementById('heroPrev')?.addEventListener('click', () => this.goHero(this._heroIndex - 1));
    document.getElementById('heroNext')?.addEventListener('click', () => this.goHero(this._heroIndex + 1));
    clearInterval(this._heroTimer);
    this._heroTimer = setInterval(() => this.goHero(this._heroIndex + 1), 7000);
  },

  goHero(index) {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    if (!slides.length) return;
    this._heroIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === this._heroIndex));
    document.querySelectorAll('.hero-dot').forEach((dot, i) => dot.classList.toggle('active', i === this._heroIndex));
  },

  bindFlashCountdown() {
    const el = document.getElementById('flashCountdown');
    if (!el) return;

    const render = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(now.getHours() + (6 - (now.getHours() % 6)), 0, 0, 0);
      const diff = Math.max(0, end - now);
      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const pad = (n) => String(n).padStart(2, '0');
      el.innerHTML = `<span>${pad(hours)}</span><small>H</small><span>${pad(minutes)}</span><small>M</small><span>${pad(seconds)}</span><small>S</small>`;
    };

    render();
    setInterval(render, 1000);
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
