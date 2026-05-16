/* ================================================================
   TOAST.JS — Notification system
   ================================================================ */
window.Toast = (() => {
  let wrap;
  const ICONS = {
    success: 'fas fa-check-circle',
    error:   'fas fa-times-circle',
    info:    'fas fa-info-circle',
    warn:    'fas fa-exclamation-triangle',
  };

  return {
    init() {
      wrap = document.getElementById('toastWrap');
    },

    show(msg, type = 'info', icon = '') {
      if (!wrap) wrap = document.getElementById('toastWrap');
      if (!wrap) return;

      const el = document.createElement('div');
      el.className = `toast ${type}`;
      el.innerHTML = `<i class="${icon || ICONS[type] || ICONS.info}" aria-hidden="true"></i><span>${msg}</span>`;
      wrap.appendChild(el);

      requestAnimationFrame(() => el.classList.add('show'));

      setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 350);
      }, 3500);
    },
  };
})();


/* ================================================================
   LOADER — Page loading progress bar
   FIX: 3-second fallback prevents loader from getting stuck
   ================================================================ */
window.Loader = {
  _done: false,

  init() {
    const bar    = document.getElementById('lp');
    const loader = document.getElementById('loader');
    if (!bar || !loader) return;

    document.body.style.overflow = 'hidden';

    let width = 0;
    const interval = setInterval(() => {
      width = Math.min(width + Math.random() * 18, 90);
      bar.style.width = `${width}%`;
    }, 100);

    const complete = () => {
      if (this._done) return;
      this._done = true;
      clearInterval(interval);
      bar.style.width = '100%';
      setTimeout(() => {
        loader.classList.add('done');
        document.body.style.overflow = '';
      }, 350);
    };

    /* Primary trigger: window load event */
    if (document.readyState === 'complete') {
      complete();
    } else {
      window.addEventListener('load', complete, { once: true });
    }

    /* Safety fallback: force-hide after 3 seconds no matter what */
    setTimeout(complete, 3000);
  },
};


/* ================================================================
   ANIMATIONS — IntersectionObserver for .fade-up elements
   ================================================================ */
window.Animations = (() => {
  let observer;

  return {
    init() {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });
      this.observe();
    },

    observe() {
      document.querySelectorAll('.fade-up:not(.visible)').forEach(el => observer?.observe(el));
    },
  };
})();


/* ================================================================
   PAGINATION — Page controls for products grid
   ================================================================ */
window.Pagination = {
  render(meta) {
    const wrap = document.getElementById('paginationWrap');
    if (!wrap) return;

    if (!meta || meta.pages <= 1) { wrap.innerHTML = ''; return; }

    const { page, pages } = meta;
    const btn = (p, label, disabled = false) =>
      `<button class="pg-btn${p === page ? ' active' : ''}${disabled ? ' disabled' : ''}"
        ${disabled ? 'disabled' : `onclick="Pagination.go(${p})"`}>${label}</button>`;

    let html = btn(page - 1, '<i class="fas fa-chevron-right"></i>', page <= 1);
    const start = Math.max(1, page - 2), end = Math.min(pages, page + 2);
    if (start > 1) html += btn(1, '1') + (start > 2 ? '<span class="page-dots">…</span>' : '');
    for (let i = start; i <= end; i++) html += btn(i, i);
    if (end < pages) html += (end < pages - 1 ? '<span class="page-dots">…</span>' : '') + btn(pages, pages);
    html += btn(page + 1, '<i class="fas fa-chevron-left"></i>', page >= pages);

    wrap.innerHTML = html;
  },

  go(page) {
    AppState.set('currentPage', page);
    ProductList.load();
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
};
