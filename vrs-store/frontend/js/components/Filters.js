/* ================================================================
   FILTERS.JS — Category filter bar + Sort selector
   Syncs with AppState and ProductList.applyAndRender()
   ================================================================ */
window.Filters = {
  el: null,
  sortEl: null,

  init() {
    this.el = document.getElementById('filterRow');
    this.sortEl = document.getElementById('sortSelect');
    if (!this.el) return;

    this._renderFilters();
    this._renderSort();
    this._bindSort();

    AppState.on('currentFilter', (val) => this._setVisualActive(val));
    AppState.on('currentSort', (val) => { if (this.sortEl) this.sortEl.value = val || 'newest'; });
  },

  _renderFilters() {
    const cats = [
      { id: 'all', icon: '🌐', name: 'الكل' },
      ...(window.VRS_CONFIG?.categories || []),
    ];

    this.el.innerHTML = cats.map(c => `
      <button
        class="filter-btn${(AppState.get('currentFilter') || 'all') === c.id ? ' active' : ''}"
        data-cat="${c.id}"
        onclick="Filters.setActive('${c.id}')"
      >
        <span>${c.icon}</span> ${c.name}
      </button>
    `).join('');
  },

  _renderSort() {
    if (!this.sortEl) return;
    const options = [
      { val: 'newest', label: 'الأحدث' },
      { val: 'oldest', label: 'الأقدم' },
      { val: 'price_asc', label: 'السعر: الأقل' },
      { val: 'price_desc', label: 'السعر: الأعلى' },
      { val: 'rating', label: 'التقييم' },
      { val: 'popular', label: 'الأكثر مبيعاً' },
    ];
    this.sortEl.innerHTML = options.map((o) => `<option value="${o.val}">${o.label}</option>`).join('');
    this.sortEl.value = AppState.get('currentSort') || 'newest';
  },

  _bindSort() {
    if (!this.sortEl) return;
    this.sortEl.addEventListener('change', () => {
      AppState.set('currentSort', this.sortEl.value);
      AppState.set('currentPage', 1);
      if (typeof ProductList !== 'undefined' && typeof ProductList.applyAndRender === 'function') {
        ProductList.applyAndRender();
      }
    });
  },

  _setVisualActive(catId) {
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.cat === catId);
    });
  },

  setActive(catId) {
    AppState.set('currentFilter', catId || 'all');
    AppState.set('currentPage', 1);
    this._setVisualActive(catId || 'all');
    if (typeof ProductList !== 'undefined' && typeof ProductList.applyAndRender === 'function') {
      ProductList.applyAndRender();
    }
  },

  refresh(categories) {
    if (!this.el) return;
    window.VRS_CONFIG = window.VRS_CONFIG || {};
    window.VRS_CONFIG.categories = categories;
    this._renderFilters();
  },
};
