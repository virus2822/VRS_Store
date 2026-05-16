/* ================================================================
   SEARCH.JS — Debounced search (state-only, no hard reload)
   ================================================================ */
window.Search = {
  _timer: null,
  DELAY: 250,

  init() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    input.addEventListener('input', (e) => {
      clearTimeout(this._timer);
      const val = (e.target.value || '').trim();
      this._showClear(val.length > 0);

      this._timer = setTimeout(() => {
        AppState.set('currentSearch', val);
        AppState.set('currentPage', 1);
      }, this.DELAY);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      clearTimeout(this._timer);
      const val = (e.target.value || '').trim();
      AppState.set('currentSearch', val);
      AppState.set('currentPage', 1);
    });

    document.getElementById('searchClear')?.addEventListener('click', () => {
      input.value = '';
      this._showClear(false);
      AppState.set('currentSearch', '');
      AppState.set('currentPage', 1);
    });

    AppState.on('currentSearch', (val) => {
      if (!val && input.value) {
        input.value = '';
        this._showClear(false);
      }
    });
  },

  _showClear(visible) {
    const btn = document.getElementById('searchClear');
    if (btn) btn.style.display = visible ? 'flex' : 'none';
  },
};
