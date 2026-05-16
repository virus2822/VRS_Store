/* ================================================================
   AUTH STORE — Token + Session Management
   ================================================================ */
window.Store      = window.Store || {};
window.Store.auth = {
  getToken:        ()  => localStorage.getItem('vrs_token'),
  setToken:        (t) => localStorage.setItem('vrs_token', t),
  getRefreshToken: ()  => localStorage.getItem('vrs_refresh'),
  setRefreshToken: (t) => localStorage.setItem('vrs_refresh', t),
  getUser:         ()  => { try { return JSON.parse(localStorage.getItem('vrs_user')); } catch { return null; } },
  setUser:         (u) => localStorage.setItem('vrs_user', JSON.stringify(u)),

  isLoggedIn: () => !!localStorage.getItem('vrs_token'),
  isAdmin:    () => Store.auth.getUser()?.role === 'admin',

  login(user, token, refreshToken) {
    this.setToken(token);
    this.setRefreshToken(refreshToken);
    this.setUser(user);
    AppState.set('user', user);
    AppState.set('wishlist', user.wishlist || []);
    document.dispatchEvent(new CustomEvent('auth:login', { detail: user }));
  },

  logout() {
    ['vrs_token','vrs_refresh','vrs_user'].forEach(k => localStorage.removeItem(k));
    AppState.set('user', null);
    AppState.set('wishlist', []);
    document.dispatchEvent(new CustomEvent('auth:logout'));
  },

  init() {
    const user = this.getUser();
    if (user) {
      AppState.set('user', user);
      AppState.set('wishlist', user.wishlist || []);
    }
  },
};
