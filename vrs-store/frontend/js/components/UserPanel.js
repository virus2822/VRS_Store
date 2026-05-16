/* ================================================================
   UserPanel.JS — User profile modal (profile / orders / wishlist)
   ================================================================ */
window.UserPanel = {
  _panel: null,

  _formatIQD(v) {
    return `${Number(v || 0).toLocaleString('en-US')} IQD`;
  },

  init() {
    /* Build DOM once */
    const el = document.createElement('div');
    el.id        = 'userPanel';
    el.className = 'panel-overlay';
    el.innerHTML = `
      <div class="panel-modal">
        <div class="panel-head">
          <h3 id="panelTitle"><i class="fas fa-user"></i> ملفي الشخصي</h3>
          <button class="panel-close" onclick="UserPanel.hide()"><i class="fas fa-times"></i></button>
        </div>
        <div class="panel-tabs">
          <button class="panel-tab active" data-tab="profile" onclick="UserPanel.show('profile')">
            <i class="fas fa-user"></i> الملف
          </button>
          <button class="panel-tab" data-tab="orders" onclick="UserPanel.show('orders')">
            <i class="fas fa-shopping-bag"></i> طلباتي
          </button>
          <button class="panel-tab" data-tab="wishlist" onclick="UserPanel.show('wishlist')">
            <i class="fas fa-heart"></i> المفضلة
          </button>
        </div>
        <div class="panel-body" id="panelBody"></div>
      </div>`;
    document.body.appendChild(el);
    this._panel = el;

    el.addEventListener('click', (e) => {
      if (e.target === el) this.hide();
    });
  },

  show(tab = 'profile') {
    this._panel?.classList.add('show');
    document.body.style.overflow = 'hidden';
    this._setActiveTab(tab);
    this._render(tab);
  },

  showOrders()   { this.show('orders');   },
  showWishlist() { this.show('wishlist'); },

  hide() {
    this._panel?.classList.remove('show');
    document.body.style.overflow = '';
  },

  _setActiveTab(tab) {
    document.querySelectorAll('#userPanel .panel-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
  },

  async _render(tab) {
    const body = document.getElementById('panelBody');
    if (!body) return;
    body.innerHTML = `<div class="panel-loading"><i class="fas fa-spinner fa-spin"></i></div>`;

    try {
      if (tab === 'profile')  await this._renderProfile(body);
      if (tab === 'orders')   await this._renderOrders(body);
      if (tab === 'wishlist') await this._renderWishlist(body);
    } catch (err) {
      body.innerHTML = `<div class="panel-error"><i class="fas fa-exclamation-circle"></i> ${err?.message || 'صار خطأ بسيط، جرّب مرة ثانية'}</div>`;
    }
  },

  async _renderProfile(body) {
    const res  = await endpoints.getMe();
    const user = res.data;
    body.innerHTML = `
      <div class="profile-card">
        <div class="profile-avatar">
          ${user.avatar
            ? `<img src="${user.avatar}" alt="${user.username}">`
            : `<i class="fas fa-user-circle"></i>`}
        </div>
        <div class="profile-info">
          <h4>${user.username}</h4>
          <p>${user.email}</p>
          <span class="role-badge role-${user.role}">${user.role === 'admin' ? 'مدير' : 'مستخدم'}</span>
        </div>
      </div>
      <div class="profile-stats">
        <div class="ps-item"><strong>${user.wishlist?.length || 0}</strong><span>في المفضلة</span></div>
        <div class="ps-item"><strong>${user.recentlyViewed?.length || 0}</strong><span>منتج مشاهد</span></div>
      </div>
      <div class="profile-actions">
        <button class="btn btn-glass" onclick="Auth.logout();UserPanel.hide()">
          <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
        </button>
      </div>`;
  },

  async _renderOrders(body) {
    const res    = await endpoints.getMyOrders({ limit: 20 });
    const orders = res.data || [];
    if (!orders.length) {
      body.innerHTML = `<div class="panel-empty"><i class="fas fa-shopping-bag"></i><p>لا توجد طلبات بعد</p></div>`;
      return;
    }
    const statusMap = {
      pending:    { label: 'انتظار',    cls: 'warn'    },
      processing: { label: 'قيد المعالجة', cls: 'info' },
      completed:  { label: 'مكتمل',    cls: 'success' },
      cancelled:  { label: 'ملغي',     cls: 'danger'  },
      refunded:   { label: 'مُسترد',   cls: 'muted'   },
    };
    body.innerHTML = orders.map(o => {
      const s = statusMap[o.status] || { label: o.status, cls: 'muted' };
      return `
        <div class="order-item">
          <div class="oi-head">
            <span class="oi-num">#${o.orderNumber}</span>
            <span class="status-badge status-${s.cls}">${s.label}</span>
          </div>
          <div class="oi-items">${(o.items || []).map(i => `<span>${i.title}</span>`).join(', ')}</div>
          <div class="oi-foot">
            <span class="oi-total">${this._formatIQD(o.totalAmount || 0)}</span>
            ${o.status === 'pending'
              ? `<button class="btn-cancel-order" onclick="UserPanel._cancelOrder('${o._id}', this)">
                   <i class="fas fa-times"></i> إلغاء
                 </button>` : ''}
          </div>
        </div>`;
    }).join('');
  },

  async _cancelOrder(orderId, btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    try {
      await endpoints.cancelOrder(orderId);
      Toast.show('تم إلغاء الطلب', 'info');
      this._render('orders');
    } catch (err) {
      Toast.show(err?.message || 'فشل الإلغاء', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-times"></i> إلغاء';
    }
  },

  async _renderWishlist(body) {
    const res  = await endpoints.getMe();
    const list = res.data.wishlist || [];
    if (!list.length) {
      body.innerHTML = `<div class="panel-empty"><i class="fas fa-heart"></i><p>قائمة المفضلة فارغة</p></div>`;
      return;
    }
    body.innerHTML = `<div class="wishlist-grid">${list.map(p => ProductCard.render(p)).join('')}</div>`;
    Animations.observe();
  },
};
