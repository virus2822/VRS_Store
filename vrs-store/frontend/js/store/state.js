/* ================================================================
   STATE.JS — Lightweight reactive state manager
   Usage:
     AppState.set('key', value)      → triggers listeners
     AppState.get('key')             → current value
     AppState.on('key', fn)          → subscribe (returns unsubscribe fn)
   ================================================================ */
class StateManager {
  #state     = {};
  #listeners = {};

  constructor(init) { this.#state = { ...init }; }

  get(key)             { return this.#state[key]; }

  set(key, value) {
    const prev = this.#state[key];
    this.#state[key] = value;
    this.#emit(key, value, prev);
  }

  update(key, fn)      { this.set(key, fn(this.#state[key])); }

  on(key, fn) {
    (this.#listeners[key] ??= []).push(fn);
    return () => this.off(key, fn);
  }

  off(key, fn) {
    this.#listeners[key] = (this.#listeners[key] || []).filter(l => l !== fn);
  }

  #emit(key, val, prev) {
    this.#listeners[key]?.forEach(fn => fn(val, prev));
    this.#listeners['*']?.forEach(fn => fn(key, val, prev));
  }
}

window.AppState = new StateManager({
  products:         [],
  currentFilter:    'all',
  currentSearch:    '',
  currentSort:      'newest',
  currentPage:      1,
  totalPages:       1,
  totalProducts:    0,
  isLoading:        false,
  user:             null,
  cart:             [],
  wishlist:         [],
});
