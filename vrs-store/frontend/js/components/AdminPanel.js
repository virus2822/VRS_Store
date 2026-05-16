/* ================================================================
   ADMINPANEL.JS — Full admin dashboard
   Tabs: Dashboard / Products / Orders / Users
   Only accessible when user.role === 'admin'
   ================================================================ */
window.AdminPanel = {
  _el:      null,
  _tab:     'dashboard',
  _prodPage: 1,
  _ordPage:  1,

  init() {
    if (!Store.auth.isAdmin()) return;

    const el = document.createElement('div');
    el.id        = 'adminPanel';
    el.className = 'panel-overlay admin-overlay';
    el.innerHTML = `
      <div class="panel-modal admin-modal">
        <div class="panel-head admin-head">
          <h3><i class="fas fa-shield-alt"></i> لوحة الإدارة — VRS STORE</h3>
          <button class="panel-close" onclick="AdminPanel.hide()"><i class="fas fa-times"></i></button>
        </div>
        <div class="admin-sidebar">
          ${[
            ['dashboard', 'fas fa-chart-bar',    'لوحة التحكم'],
            ['products',  'fas fa-boxes',         'المنتجات'],
            ['orders',    'fas fa-shopping-bag',  'الطلبات'],
            ['users',     'fas fa-users',         'المستخدمين'],
            ['currency',  'fas fa-exchange-alt',  'إدارة العملة'],
            ['coupons',   'fas fa-tags',          'كوبونات الخصم'],
          ].map(([tab, icon, label]) => `
            <button class="sidebar-btn${tab === 'dashboard' ? ' active' : ''}"
              data-tab="${tab}" onclick="AdminPanel.switchTab('${tab}')">
              <i class="${icon}"></i> ${label}
            </button>`).join('')}
        </div>
        <div class="admin-content" id="adminContent"></div>
      </div>`;
    document.body.appendChild(el);
    this._el = el;

    el.addEventListener('click', (e) => {
      if (e.target === el) this.hide();
    });
  },

  show() {
    if (!Store.auth.isAdmin()) {
      Toast.show('غير مصرح لك', 'error', 'fas fa-ban');
      return;
    }
    this._el?.classList.add('show');
    document.body.style.overflow = 'hidden';
    this.switchTab('dashboard');
  },

  hide() {
    this._el?.classList.remove('show');
    document.body.style.overflow = '';
  },

  switchTab(tab) {
    this._tab = tab;
    document.querySelectorAll('.sidebar-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    this._loadTab(tab);
  },

  /* ──────────────── CONTENT ROUTER ──────────────── */
  async _loadTab(tab) {
    const content = document.getElementById('adminContent');
    if (!content) return;
    content.innerHTML = `<div class="admin-loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>`;
    try {
      if (tab === 'dashboard') await this._renderDashboard(content);
      if (tab === 'products')  await this._renderProducts(content);
      if (tab === 'orders')    await this._renderOrders(content);
      if (tab === 'users')     await this._renderUsers(content);
      if (tab === 'currency')  await this._renderCurrency(content);
      if (tab === 'coupons')   await this._renderCoupons(content);
    } catch (err) {
      content.innerHTML = `<div class="admin-error"><i class="fas fa-exclamation-triangle"></i> ${err?.message || 'حدث خطأ'}</div>`;
    }
  },

  /* ──────────────── DASHBOARD ──────────────── */
  async _renderDashboard(el) {
    const res  = await endpoints.getDashboard();
    const d    = res.data;
    const st   = d.stats || {};
    el.innerHTML = `
      <div class="dash-stats">
        ${[
          ['fas fa-box',           'إجمالي المنتجات',  st.totalProducts || 0,  ''],
          ['fas fa-users',         'المستخدمين',       st.totalUsers    || 0,  ''],
          ['fas fa-shopping-bag',  'الطلبات',          st.totalOrders   || 0,  ''],
          ['fas fa-dollar-sign',   'الإيرادات',        `${Number(st.revenue || 0).toLocaleString('en-US')} IQD`, 'accent'],
        ].map(([icon, label, val, cls]) => `
          <div class="ds-card ${cls}">
            <i class="${icon}"></i>
            <div>
              <strong>${val}</strong>
              <span>${label}</span>
            </div>
          </div>`).join('')}
      </div>

      <div class="dash-row">
        <div class="dash-block">
          <h4><i class="fas fa-clock"></i> آخر الطلبات</h4>
          <table class="admin-table">
            <thead><tr><th>#</th><th>المستخدم</th><th>المبلغ</th><th>الحالة</th></tr></thead>
            <tbody>
              ${(d.recentOrders || []).map(o => `
                <tr>
                  <td class="mono">${o.orderNumber}</td>
                  <td>${o.user?.username || '—'}</td>
                  <td>${Number(o.totalAmount || 0).toLocaleString('en-US')} IQD</td>
                  <td><span class="status-badge status-${o.status === 'completed' ? 'success' : o.status === 'cancelled' ? 'danger' : 'warn'}">${o.status}</span></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="dash-block">
          <h4><i class="fas fa-fire"></i> أعلى المنتجات مبيعاً</h4>
          <table class="admin-table">
            <thead><tr><th>المنتج</th><th>المبيعات</th><th>السعر</th></tr></thead>
            <tbody>
              ${(d.topProducts || []).map(p => `
                <tr>
                  <td>${p.title}</td>
                  <td>${p.salesCount || 0}</td>
                  <td>${Number(p.price || 0).toLocaleString('en-US')} IQD</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  },

  /* ──────────────── PRODUCTS ──────────────── */
  async _renderProducts(el) {
    const res      = await endpoints.getProducts({ page: this._prodPage, limit: 15 });
    const products = res.data || [];
    const meta     = res.meta || {};

    el.innerHTML = `
      <div class="admin-toolbar">
        <h4><i class="fas fa-boxes"></i> المنتجات (${meta.total || 0})</h4>
        <button class="btn btn-primary btn-sm" onclick="AdminPanel._openProductForm()">
          <i class="fas fa-plus"></i> إضافة منتج
        </button>
      </div>
      <div id="productFormWrap"></div>
      <table class="admin-table full">
        <thead>
          <tr><th>#</th><th>المنتج</th><th>الفئة</th><th>السعر</th><th>المبيعات</th><th>الحالة</th><th>إجراءات</th></tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr id="prod-row-${p._id}">
              <td class="mono">${p._id.slice(-6)}</td>
              <td><strong>${p.title}</strong></td>
              <td>${p.category}</td>
              <td>${Number(p.price || 0).toLocaleString('en-US')} IQD</td>
              <td>${p.salesCount || 0}</td>
              <td>
                <span class="status-badge ${p.isActive ? 'status-success' : 'status-danger'}">
                  ${p.isActive ? 'نشط' : 'مخفي'}
                </span>
              </td>
              <td class="actions-cell">
                <button class="btn-icon" onclick="AdminPanel._openProductForm(${JSON.stringify(p).replace(/"/g,'&quot;')})" title="تعديل">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon danger" onclick="AdminPanel._deleteProduct('${p._id}', this)" title="حذف">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
      ${meta.pages > 1 ? `
        <div class="admin-pagination">
          ${Array.from({ length: meta.pages }, (_, i) => `
            <button class="pg-btn${i + 1 === this._prodPage ? ' active' : ''}"
              onclick="AdminPanel._prodPage=${i+1};AdminPanel.switchTab('products')">
              ${i + 1}
            </button>`).join('')}
        </div>` : ''}`;
  },

  _openProductForm(product = null) {
    const wrap = document.getElementById('productFormWrap');
    if (!wrap) return;
    const isEdit = !!product;
    const cats = [
      'pentesting_tools',
      'zero_day_exploits',
      'red_team_packs',
      'cyber_courses',
      'steam_xbox_psn_keys',
      'fivem_scripts',
      'game_mods',
      'netflix',
      'spotify',
      'vpns',
      'windows_office_keys',
      'custom_ai_agents',
      'python_js_scripts',
      'web_services',
      'rare_usernames',
      'high_level_gaming_accounts',
    ];
    wrap.innerHTML = `
      <div class="prod-form">
        <h4>${isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>العنوان *</label>
            <input id="pf-title" value="${isEdit ? product.title : ''}" placeholder="اسم المنتج">
          </div>
          <div class="form-group">
            <label>الفئة *</label>
            <select id="pf-cat">
              ${cats.map(c => `<option value="${c}" ${isEdit && product.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Price * (IQD)</label>
            <input id="pf-price" type="number" step="1" value="${isEdit ? product.price : ''}" placeholder="50000">
          </div>
          <div class="form-group">
            <label>Original Price (IQD)</label>
            <input id="pf-oprice" type="number" step="1" value="${isEdit ? (product.originalPrice || '') : ''}" placeholder="65000">
          </div>
          <div class="form-group full">
            <label>الوصف *</label>
            <textarea id="pf-desc" rows="3" placeholder="وصف المنتج">${isEdit ? product.description : ''}</textarea>
          </div>
          <div class="form-group">
            <label>رابط الشراء</label>
            <input id="pf-link" value="${isEdit ? (product.buyLink || '') : ''}" placeholder="https://...">
          </div>
          <div class="form-group">
            <label>Icon class</label>
            <input id="pf-icon" value="${isEdit ? (product.icon || '') : ''}" placeholder="fa-box">
          </div>
          <div class="form-group">
            <label>Badge</label>
            <select id="pf-badge">
              ${['','hot','new','sale','ticket'].map(b => `<option value="${b}" ${isEdit && product.badge === b ? 'selected' : ''}>${b || 'none'}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>المخزون (-1 = لا محدود)</label>
            <input id="pf-stock" type="number" value="${isEdit ? (product.stock ?? -1) : -1}">
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary btn-sm" onclick="AdminPanel._submitProduct(${isEdit ? `'${product._id}'` : 'null'})">
            <i class="fas fa-save"></i> ${isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}
          </button>
          <button class="btn btn-glass btn-sm" onclick="document.getElementById('productFormWrap').innerHTML=''">
            <i class="fas fa-times"></i> إلغاء
          </button>
        </div>
      </div>`;
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  async _submitProduct(id) {
    const data = {
      title:         document.getElementById('pf-title')?.value.trim(),
      category:      document.getElementById('pf-cat')?.value,
      price:         parseFloat(document.getElementById('pf-price')?.value) || 0,
      originalPrice: parseFloat(document.getElementById('pf-oprice')?.value) || undefined,
      description:   document.getElementById('pf-desc')?.value.trim(),
      buyLink:       document.getElementById('pf-link')?.value.trim() || '#',
      icon:          document.getElementById('pf-icon')?.value.trim() || 'fa-box',
      badge:         document.getElementById('pf-badge')?.value,
      stock:         parseInt(document.getElementById('pf-stock')?.value, 10) ?? -1,
    };

    if (!data.title || !data.description || !data.price) {
      return Toast.show('يرجى تعبئة الحقول المطلوبة', 'warn');
    }

    try {
      if (id) {
        await endpoints.updateProduct(id, data);
        Toast.show('تم تحديث المنتج ✅', 'success');
      } else {
        await endpoints.createProduct(data);
        Toast.show('تمت إضافة المنتج ✅', 'success');
      }
      document.getElementById('productFormWrap').innerHTML = '';
      this.switchTab('products');
    } catch (err) {
      Toast.show(err?.message || 'فشل الحفظ', 'error');
    }
  },

  async _deleteProduct(id, btn) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    btn.disabled = true;
    try {
      await endpoints.deleteProduct(id);
      document.getElementById(`prod-row-${id}`)?.remove();
      Toast.show('تم حذف المنتج', 'success');
    } catch (err) {
      Toast.show(err?.message || 'فشل الحذف', 'error');
      btn.disabled = false;
    }
  },

  /* ──────────────── ORDERS ──────────────── */
  async _renderOrders(el) {
    const res    = await endpoints.getAllOrders({ page: this._ordPage, limit: 20 });
    const orders = res.data || [];
    const meta   = res.meta || {};

    const statusOptions = ['pending','processing','completed','cancelled','refunded'];

    el.innerHTML = `
      <div class="admin-toolbar">
        <h4><i class="fas fa-shopping-bag"></i> الطلبات (${meta.total || 0})</h4>
      </div>
      <table class="admin-table full">
        <thead>
          <tr><th>#طلب</th><th>المستخدم</th><th>المبلغ</th><th>الدفع</th><th>الحالة</th><th>تغيير</th></tr>
        </thead>
        <tbody>
          ${orders.map(o => `
            <tr>
              <td class="mono">${o.orderNumber}</td>
              <td>${o.user?.username || '—'}</td>
              <td>${Number(o.totalAmount || 0).toLocaleString('en-US')} IQD</td>
              <td>
                <span class="status-badge ${o.paymentStatus === 'paid' ? 'status-success' : 'status-warn'}">
                  ${o.paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                </span>
              </td>
              <td>
                <span class="status-badge status-${o.status === 'completed' ? 'success' : o.status === 'cancelled' ? 'danger' : 'warn'}">
                  ${o.status}
                </span>
              </td>
              <td>
                <select class="status-select" onchange="AdminPanel._updateOrderStatus('${o._id}', this.value)">
                  ${statusOptions.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
      ${meta.pages > 1 ? `
        <div class="admin-pagination">
          ${Array.from({ length: meta.pages }, (_, i) => `
            <button class="pg-btn${i+1 === this._ordPage ? ' active' : ''}"
              onclick="AdminPanel._ordPage=${i+1};AdminPanel.switchTab('orders')">
              ${i+1}
            </button>`).join('')}
        </div>` : ''}`;
  },

  async _updateOrderStatus(orderId, status) {
    try {
      await endpoints.updateOrderStatus(orderId, { status });
      Toast.show('تم تحديث حالة الطلب', 'success');
    } catch (err) {
      Toast.show(err?.message || 'فشل التحديث', 'error');
    }
  },

  /* ──────────────── USERS ──────────────── */
  async _renderUsers(el) {
    const res   = await endpoints.getAllUsers({ limit: 50 });
    const users = res.data || [];

    el.innerHTML = `
      <div class="admin-toolbar">
        <h4><i class="fas fa-users"></i> المستخدمون (${users.length})</h4>
      </div>
      <table class="admin-table full">
        <thead>
          <tr><th>الاسم</th><th>البريد</th><th>الدور</th><th>الحالة</th><th>إجراءات</th></tr>
        </thead>
        <tbody>
          ${users.map(u => `
            <tr id="user-row-${u._id}">
              <td><strong>${u.username}</strong></td>
              <td class="mono">${u.email}</td>
              <td><span class="role-badge role-${u.role}">${u.role === 'admin' ? 'مدير' : 'مستخدم'}</span></td>
              <td>
                <span class="status-badge ${u.isActive ? 'status-success' : 'status-danger'}">
                  ${u.isActive ? 'نشط' : 'محظور'}
                </span>
              </td>
              <td>
                ${u.role !== 'admin' ? `
                  <button class="btn-icon ${u.isActive ? 'danger' : ''}"
                    onclick="AdminPanel._toggleUser('${u._id}', this, ${u.isActive})"
                    title="${u.isActive ? 'حظر' : 'تفعيل'}">
                    <i class="fas fa-${u.isActive ? 'ban' : 'check'}"></i>
                  </button>` : '<span class="text-muted">—</span>'}
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  },

  async _toggleUser(userId, btn, isActive) {
    btn.disabled = true;
    try {
      await endpoints.toggleUserActive(userId);
      const row = document.getElementById(`user-row-${userId}`);
      const badge = row?.querySelector('.status-badge');
      const newActive = !isActive;
      if (badge) {
        badge.className   = `status-badge ${newActive ? 'status-success' : 'status-danger'}`;
        badge.textContent = newActive ? 'نشط' : 'محظور';
      }
      btn.className = `btn-icon${newActive ? ' danger' : ''}`;
      btn.title     = newActive ? 'حظر' : 'تفعيل';
      btn.innerHTML = `<i class="fas fa-${newActive ? 'ban' : 'check'}"></i>`;
      btn.onclick   = () => AdminPanel._toggleUser(userId, btn, newActive);
      btn.disabled  = false;
      Toast.show(`تم ${newActive ? 'تفعيل' : 'حظر'} المستخدم`, 'success');
    } catch (err) {
      Toast.show(err?.message || 'فشل التغيير', 'error');
      btn.disabled = false;
    }
  },

  /* ──────────────── CURRENCY MANAGEMENT ──────────────── */
  async _renderCurrency(el) {
    const currentRate = CurrencyConverter.getExchangeRate();
    el.innerHTML = `
      <div class="admin-toolbar">
        <h4><i class="fas fa-exchange-alt"></i> إدارة العملة</h4>
      </div>
      <div class="currency-management">
        <div class="currency-card">
          <h5>سعر صرف الدولار الأمريكي</h5>
          <div class="rate-display">
            <span class="rate-value">1 USD = ${currentRate.toLocaleString()} IQD</span>
            <span class="rate-time">آخر تحديث: ${new Date().toLocaleString('ar-IQ')}</span>
          </div>
          <div class="rate-form">
            <div class="form-group">
              <label>سعر الصرف الجديد:</label>
              <input type="number" id="newExchangeRate" value="${currentRate}" min="1" step="1" placeholder="1310">
            </div>
            <button class="btn btn-primary" onclick="AdminPanel._updateExchangeRate()">
              <i class="fas fa-save"></i> تحديث سعر الصرف
            </button>
          </div>
        </div>
        <div class="currency-info">
          <h6>معلومات مهمة:</h6>
          <ul>
            <li>سيتم تحديث جميع الأسعار تلقائياً عند تغيير سعر الصرف</li>
            <li>العملة الأساسية للمنتجات هي الدولار الأمريكي (USD)</li>
            <li>يتم عرض الأسعار للعملاء بالدينار العراقي (IQD)</li>
            <li>يمكن للعملاء التبديل بين العملات من شريط التنقل</li>
          </ul>
        </div>
      </div>
    `;
  },

  async _updateExchangeRate() {
    const input = document.getElementById('newExchangeRate');
    if (!input) return;

    const newRate = Number(input.value);
    if (isNaN(newRate) || newRate <= 0) {
      Toast.show('يرجى إدخال سعر صرف صحيح', 'error');
      return;
    }

    try {
      const result = CurrencyConverter.setExchangeRate(newRate);
      Toast.show(`تم تحديث سعر الصرف: 1 USD = ${newRate.toLocaleString()} IQD`, 'success');
      this.switchTab('currency'); // Refresh the tab
    } catch (error) {
      Toast.show(error.message, 'error');
    }
  },

  /* ──────────────── COUPONS MANAGEMENT ──────────────── */
  async _renderCoupons(el) {
    const coupons = DiscountSystem.coupons;
    el.innerHTML = `
      <div class="admin-toolbar">
        <h4><i class="fas fa-tags"></i> كوبونات الخصم (${Object.keys(coupons).length})</h4>
        <button class="btn btn-primary btn-sm" onclick="AdminPanel._openCouponForm()">
          <i class="fas fa-plus"></i> إضافة كوبون
        </button>
      </div>
      <div id="couponFormWrap"></div>
      <div class="coupons-grid">
        ${Object.entries(coupons).map(([code, coupon]) => `
          <div class="coupon-card ${coupon.active ? 'active' : 'inactive'}">
            <div class="coupon-header">
              <h5>${code.toUpperCase()}</h5>
              <span class="coupon-status ${coupon.active ? 'active' : 'inactive'}">
                ${coupon.active ? 'نشط' : 'غير نشط'}
              </span>
            </div>
            <div class="coupon-body">
              <p class="coupon-desc">${coupon.description}</p>
              <div class="coupon-details">
                <div class="detail-row">
                  <span>النوع:</span>
                  <span>${coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value.toLocaleString()} IQD`}</span>
                </div>
                <div class="detail-row">
                  <span>الاستخدام:</span>
                  <span>${coupon.currentUses}/${coupon.maxUses || '∞'}</span>
                </div>
                <div class="detail-row">
                  <span>الانتهاء:</span>
                  <span>${coupon.expires || 'لا يوجد'}</span>
                </div>
                <div class="detail-row">
                  <span>الحد الأدنى:</span>
                  <span>${coupon.minAmount ? `${coupon.minAmount.toLocaleString()} IQD` : 'لا يوجد'}</span>
                </div>
              </div>
            </div>
            <div class="coupon-actions">
              <button class="btn btn-glass btn-sm" onclick="AdminPanel._toggleCoupon('${code}', ${!coupon.active})">
                <i class="fas fa-${coupon.active ? 'pause' : 'play'}"></i>
                ${coupon.active ? 'إيقاف' : 'تفعيل'}
              </button>
              <button class="btn btn-danger btn-sm" onclick="AdminPanel._deleteCoupon('${code}')">
                <i class="fas fa-trash"></i> حذف
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  _openCouponForm() {
    const wrap = document.getElementById('couponFormWrap');
    if (!wrap) return;

    wrap.innerHTML = `
      <div class="coupon-form">
        <h4>إضافة كوبون جديد</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>كود الكوبون *</label>
            <input type="text" id="cf-code" placeholder="NEW2026" maxlength="20" style="text-transform: uppercase;">
          </div>
          <div class="form-group">
            <label>النوع *</label>
            <select id="cf-type">
              <option value="percentage">نسبة مئوية (%)</option>
              <option value="fixed">مبلغ ثابت (IQD)</option>
            </select>
          </div>
          <div class="form-group">
            <label>القيمة *</label>
            <input type="number" id="cf-value" placeholder="15" min="1">
          </div>
          <div class="form-group">
            <label>الحد الأقصى للاستخدام</label>
            <input type="number" id="cf-maxUses" placeholder="100" min="1">
          </div>
          <div class="form-group">
            <label>تاريخ الانتهاء</label>
            <input type="date" id="cf-expires">
          </div>
          <div class="form-group">
            <label>الحد الأدنى للطلب (IQD)</label>
            <input type="number" id="cf-minAmount" placeholder="5000" min="0">
          </div>
          <div class="form-group full">
            <label>الوصف *</label>
            <input type="text" id="cf-description" placeholder="خصم 15% على جميع المنتجات">
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" onclick="AdminPanel._createCoupon()">
            <i class="fas fa-plus"></i> إضافة الكوبون
          </button>
          <button class="btn btn-glass" onclick="document.getElementById('couponFormWrap').innerHTML=''">
            <i class="fas fa-times"></i> إلغاء
          </button>
        </div>
      </div>
    `;
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  async _createCoupon() {
    const data = {
      code: document.getElementById('cf-code')?.value.trim().toUpperCase(),
      type: document.getElementById('cf-type')?.value,
      value: Number(document.getElementById('cf-value')?.value) || 0,
      maxUses: Number(document.getElementById('cf-maxUses')?.value) || undefined,
      expires: document.getElementById('cf-expires')?.value || undefined,
      minAmount: Number(document.getElementById('cf-minAmount')?.value) || 0,
      description: document.getElementById('cf-description')?.value.trim(),
    };

    if (!data.code || !data.description || data.value <= 0) {
      return Toast.show('يرجى تعبئة الحقول المطلوبة', 'warn');
    }

    try {
      DiscountSystem.coupons[data.code] = {
        type: data.type,
        value: data.value,
        description: data.description,
        maxUses: data.maxUses,
        currentUses: 0,
        expires: data.expires,
        minAmount: data.minAmount,
        categories: ['all'],
        userLimit: 1,
        active: true
      };

      Toast.show('تم إضافة الكوبون بنجاح', 'success');
      document.getElementById('couponFormWrap').innerHTML = '';
      this.switchTab('coupons');
    } catch (err) {
      Toast.show('فشل إضافة الكوبون', 'error');
    }
  },

  _toggleCoupon(code, activate) {
    if (DiscountSystem.coupons[code]) {
      DiscountSystem.coupons[code].active = activate;
      Toast.show(`تم ${activate ? 'تفعيل' : 'إيقاف'} الكوبون ${code}`, 'success');
      this.switchTab('coupons');
    }
  },

  _deleteCoupon(code) {
    if (!confirm(`هل أنت متأكد من حذف الكوبون ${code}؟`)) return;
    
    if (DiscountSystem.coupons[code]) {
      delete DiscountSystem.coupons[code];
      Toast.show('تم حذف الكوبون', 'success');
      this.switchTab('coupons');
    }
  },
};
