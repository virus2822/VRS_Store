/* ================================================================
   AUTH.JS — Login / Register modal + logout
   Calls backend via endpoints.js, updates Store.auth + AppState
   ================================================================ */
window.Auth = {
  _activeTab: 'login',

  init() {
    /* Close on overlay click */
    document.getElementById('loginModal')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('loginModal')) Auth.closeModal();
    });

    /* Enter key submits */
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const modal = document.getElementById('loginModal');
      if (!modal?.classList.contains('show')) return;
      this._activeTab === 'login' ? this.doLogin() : this.doRegister();
    });
  },

  /* ── modal control ── */
  openModal(tab = 'login') {
    const modal = document.getElementById('loginModal');
    if (!modal) return;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    this.switchTab(tab);
    this._clearErrors();
    setTimeout(() => {
      const inp = document.getElementById(tab === 'login' ? 'loginUser' : 'regUser');
      inp?.focus();
    }, 150);
  },

  closeModal() {
    document.getElementById('loginModal')?.classList.remove('show');
    document.body.style.overflow = '';
    this._clearErrors();
  },

  /* ── tab switching ── */
  switchTab(tab) {
    this._activeTab = tab;
    this._clearErrors();

    document.querySelectorAll('.modal-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const loginForm    = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm)    loginForm.style.display    = tab === 'login'    ? 'block' : 'none';
    if (registerForm) registerForm.style.display = tab === 'register' ? 'block' : 'none';
  },

  /* ── login ── */
  async doLogin() {
    const identifier = document.getElementById('loginUser')?.value.trim();
    const password   = document.getElementById('loginPass')?.value;
    const errEl      = document.getElementById('loginErr');

    this._clearError(errEl);

    if (!identifier || !password) {
      return this._setError(errEl, 'Please fill in all fields.');
    }

    const btn = document.querySelector('#loginForm .btn-primary');
    this._setBtnLoading(btn, true, 'Logging in...');

    try {
      const res = await endpoints.login({ identifier, password });
      Store.auth.login(res.data.user, res.data.token, res.data.refreshToken);
      this.closeModal();
      Toast.show(`Welcome ${res.data.user.username}!`, 'success', 'fas fa-check-circle');
    } catch (err) {
      const msg = err?.message || 'Invalid credentials.';
      this._setError(errEl, msg);
      /* Shake animation */
      const modal = document.querySelector('.modal');
      modal?.classList.add('shake');
      setTimeout(() => modal?.classList.remove('shake'), 500);
    } finally {
      this._setBtnLoading(btn, false, '<i class="fas fa-sign-in-alt"></i> Login');
    }
  },

  /* ── register ── */
  async doRegister() {
    const username = document.getElementById('regUser')?.value.trim();
    const email    = document.getElementById('regEmail')?.value.trim();
    const password = document.getElementById('regPass')?.value;
    const errEl    = document.getElementById('regErr');

    this._clearError(errEl);

    if (!username || !email || !password) {
      return this._setError(errEl, 'Please fill in all fields.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return this._setError(errEl, 'Invalid email address.');
    }
    if (password.length < 8) {
      return this._setError(errEl, 'Password must be at least 8 characters.');
    }

    const btn = document.querySelector('#registerForm .btn-primary');
    this._setBtnLoading(btn, true, 'Creating account...');

    try {
      const res = await endpoints.register({ username, email, password });
      Store.auth.login(res.data.user, res.data.token, res.data.refreshToken);
      this.closeModal();
      Toast.show('Your account has been created.', 'success', 'fas fa-user-check');
    } catch (err) {
      this._setError(errEl, err?.message || 'Account creation failed.');
    } finally {
      this._setBtnLoading(btn, false, '<i class="fas fa-user-plus"></i> Create Account');
    }
  },

  /* ── logout ── */
  async logout() {
    try { await endpoints.logout(); } catch (_) { /* ignore */ }
    Store.auth.logout();
    Toast.show('Logged out.', 'info', 'fas fa-sign-out-alt');
  },

  /* ── helpers ── */
  _setError(el, msg) {
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  },

  _clearError(el) {
    if (el) { el.textContent = ''; el.style.display = 'none'; }
  },

  _clearErrors() {
    ['loginErr','regErr'].forEach(id => this._clearError(document.getElementById(id)));
    ['loginUser','loginPass','regUser','regEmail','regPass']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  },

  _setBtnLoading(btn, loading, html) {
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${html}`;
    } else {
      btn.innerHTML = html;
    }
  },
};
