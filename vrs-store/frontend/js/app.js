/* ================================================================
   APP.JS — Entry Point
   ================================================================
   Bootstraps the entire application:
   1. Theme (early — prevents FOUC)
   2. Stores (state, auth, cart)
   3. UI Components
   4. Static sections from VRS_CONFIG
   5. Dynamic sections (search, filters, products)
   6. Utility bindings (scroll, theme toggle)
   ================================================================ */

/* ── Theme: apply BEFORE render to prevent flash-of-unstyled-content ── */
(function applyThemeEarly() {
  const saved = localStorage.getItem('vrs_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  /* Update icon once DOM is ready */
  document.addEventListener('DOMContentLoaded', () => {
    const icon = document.querySelector('#themeBtn i');
    if (icon) icon.className = saved === 'light' ? 'fas fa-sun' : 'fas fa-moon';
  }, { once: true });
})();

/* ════════════════════════════════════════
   BOOTSTRAP — runs after DOM is ready
   ════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Initialize stores (no DOM dependency) ── */
  Store.auth.init();
  Store.cart.init();

  /* ── 2. Initialize loader (critical — runs first) ── */
  Loader.init();

  /* ── 3. Initialize UI components ── */
  Toast.init?.();
  Navbar.init();
  Animations.init();
  Cart.init();
  Auth.init();
  UserPanel.init();
  Payment.init();

  /* Admin panel — only for admin users */
  if (Store.auth.isAdmin()) AdminPanel.init();

  /* Lazy-init admin panel on login */
  document.addEventListener('auth:login', () => {
    if (Store.auth.isAdmin() && !AdminPanel._el) AdminPanel.init();
  });

  /* ── 4. Build static sections from VRS_CONFIG ── */
  buildHero();
  buildStats();
  buildCategories();
  buildDeals();
  buildWhyUs();
  buildJoin();
  buildFooter();

  /* ── 5. Initialize dynamic sections ── */
  Search.init();
  Filters.init();
  ProductList.init();
  ProductList.load();

  /* Try to load server categories; fallback to config silently */
  endpoints.getCategories()
    .then(res => Filters.refresh(res.data))
    .catch(() => { /* silently use config fallback */ });

  /* ── 6. Smooth scroll for all anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
        /* Close mobile menu if open */
        document.getElementById('mobileMenu')?.classList.remove('show');
      }
    });
  });

  /* ── 7. Theme toggle button ── */
  document.getElementById('themeBtn')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('vrs_theme', next);
    const icon = document.querySelector('#themeBtn i');
    if (icon) icon.className = next === 'light' ? 'fas fa-sun' : 'fas fa-moon';
  });

});


/* ════════════════════════════════════════
   SECTION BUILDERS
   Each function renders a section from VRS_CONFIG
   ════════════════════════════════════════ */

/** Hero section — title, subtitle, badge */
function buildHero() {
  const s   = VRS_CONFIG.store;
  const set = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };
  set('heroBadge', `<i class="fas fa-shield-alt"></i> ${s.badge}`);
  set('heroTitle', `${s.name} <span>${s.nameSpan}</span>`);
  set('heroSub',   s.heroSub);
  set('navLogo',   `<i class="fas fa-store"></i> ${s.name} ${s.nameSpan}`);
  set('footerLogo',`${s.name} <span>${s.nameSpan}</span>`);
  document.title = `${s.name} ${s.nameSpan} | Digital Marketplace`;
}

/** Stats bar */
function buildStats() {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;
  grid.innerHTML = VRS_CONFIG.stats.map(st => `
    <div class="stat-item fade-up">
      <div class="stat-num">${st.number}</div>
      <div class="stat-lbl">${st.label}</div>
    </div>
  `).join('');
}

/** Categories grid */
function buildCategories() {
  const grid = document.getElementById('catsGrid');
  if (!grid) return;
  grid.innerHTML = VRS_CONFIG.categories.map(c => `
    <div class="cat-card fade-up"
      onclick="Filters.setActive('${c.id}');document.getElementById('products').scrollIntoView({behavior:'smooth'})"
      role="button" tabindex="0"
      onkeypress="if(event.key==='Enter'){Filters.setActive('${c.id}')}"
    >
      <div class="cat-icon">${c.icon}</div>
      <div class="cat-name">${c.name}</div>
      <div class="cat-count">${c.count}</div>
      <div class="cat-arrow"><i class="fas fa-arrow-left"></i></div>
    </div>
  `).join('');
  Animations.observe();
}

/** Deals section */
function buildDeals() {
  const grid = document.getElementById('dealsGrid');
  if (!grid) return;
  grid.innerHTML = VRS_CONFIG.deals.map(d => `
    <div class="deal-card fade-up">
      <div class="deal-badge">${d.badge}</div>
      <div class="deal-icon">${d.icon}</div>
      <h3 class="deal-name">${d.name}</h3>
      <p class="deal-desc">${d.desc}</p>
      <div class="deal-pricing">
        <span class="deal-old">${d.oldPrice}</span>
        <span class="deal-price">${d.price}</span>
      </div>
      <button class="btn btn-primary" onclick="Toast.show('تواصل معنا لهذه الحزمة', 'info', 'fas fa-tag')" style="width:100%;justify-content:center;">
        <i class="fas fa-shopping-cart"></i> اشتري الآن
      </button>
    </div>
  `).join('');
  Animations.observe();
}

/** Why us section */
function buildWhyUs() {
  const grid = document.getElementById('whyGrid');
  if (!grid) return;
  grid.innerHTML = VRS_CONFIG.features.map(f => `
    <div class="why-card fade-up">
      <div class="why-icon">${f.icon}</div>
      <h4 class="why-title">${f.title}</h4>
      <p class="why-desc">${f.desc}</p>
    </div>
  `).join('');
  Animations.observe();
}

/** Join/contact section */
function buildJoin() {
  const c = VRS_CONFIG.contact;

  const discord  = document.getElementById('joinDiscord');
  const telegram = document.getElementById('joinTelegram');
  if (discord)  discord.href  = c.discordServer || '#';
  if (telegram) telegram.href = c.telegram      || '#';

  const info = document.getElementById('serverInfo');
  if (info && c.email) {
    info.innerHTML = `
      <i class="fas fa-envelope"></i>
      <a href="mailto:${c.email}">${c.email}</a>
    `;
  }
}

/** Footer */
function buildFooter() {
  const s   = VRS_CONFIG.store;
  const soc = VRS_CONFIG.social;

  const tag  = document.getElementById('footerTag');
  const socEl= document.getElementById('footerSocials');
  const copy = document.getElementById('footerCopy');

  if (tag)  tag.textContent = s.tagline;
  if (copy) copy.innerHTML  = `© ${s.year} ${s.name} ${s.nameSpan} — جميع الحقوق محفوظة`;

  if (socEl) {
    const links = [
      ['discord',   'fab fa-discord',   soc.discord  ],
      ['telegram',  'fab fa-telegram',  soc.telegram  ],
      ['instagram', 'fab fa-instagram', soc.instagram ],
      ['tiktok',    'fab fa-tiktok',    soc.tiktok    ],
    ].filter(([,, url]) => url);

    socEl.innerHTML = links.map(([, icon, url]) => `
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="${icon}">
        <i class="${icon}"></i>
      </a>
    `).join('');
  }
}
