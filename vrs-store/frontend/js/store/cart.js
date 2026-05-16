/* ================================================================
   CART STORE — Persistent cart with event system
   ================================================================ */
window.Store      = window.Store || {};
window.Store.cart = (() => {
  let _items = [];

  const sync = () => {
    localStorage.setItem('vrs_cart', JSON.stringify(_items));
    AppState.set('cart', [..._items]);
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: [..._items] }));
  };

  return {
    init() {
      _items = JSON.parse(localStorage.getItem('vrs_cart') || '[]');
      AppState.set('cart', [..._items]);
    },

    items()   { return [..._items]; },
    count()   { return _items.length; },
    total()   { return _items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0); },
    has(id)   { return _items.some(i => String(i.id) === String(id)); },

    add(product) {
      const id = String(product.id || product._id);
      if (this.has(id)) {
        Toast.show('Product is already in your cart.', 'info');
        return false;
      }
      const price = typeof product.price === 'number'
        ? product.price
        : parseFloat(String(product.price).replace(/[^0-9.]/g, ''));

      _items.push({ id, name: product.name || product.title, price, icon: product.icon || '<i class="fas fa-box"></i>', qty: 1 });
      sync();
      Toast.show(`Added "${product.name || product.title}" to cart.`, 'success', 'fas fa-check-circle');
      return true;
    },

    remove(id) {
      _items = _items.filter(i => String(i.id) !== String(id));
      sync();
    },

    updateQty(id, qty) {
      const item = _items.find(i => String(i.id) === String(id));
      if (item) { item.qty = Math.max(1, qty); sync(); }
    },

    clear() { _items = []; sync(); },
  };
})();
