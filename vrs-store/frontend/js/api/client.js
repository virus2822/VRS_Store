/* ================================================================
   API CLIENT — Centralized fetch wrapper
   Features: auth headers, auto token-refresh on 401, typed errors
   ================================================================ */
const API_BASE = window.VRS_API_BASE || 'http://localhost:5000/api';

class ApiClient {
  #base;
  constructor(base) { this.#base = base; }

  #headers() {
    const token = Store.auth.getToken();
    const h     = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  async #req(method, path, body, params = {}) {
    const url = new URL(`${this.#base}${path}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });

    const opts = { method, headers: this.#headers() };
    if (body) opts.body = JSON.stringify(body);

    let res;
    try { res = await fetch(url.toString(), opts); }
    catch { throw new Error('خطأ في الشبكة — تحقق من الاتصال'); }

    if (res.status === 401) {
      const refreshed = await this.#refresh();
      if (refreshed) return this.#req(method, path, body, params);
      Store.auth.logout();
      throw new Error('انتهت صلاحية الجلسة — يرجى تسجيل الدخول');
    }

    const json = await res.json().catch(() => ({ success: false, message: 'Invalid response' }));
    if (!res.ok) throw new Error(json.message || `Error ${res.status}`);
    return json;
  }

  async #refresh() {
    const rt = Store.auth.getRefreshToken();
    if (!rt) return false;
    try {
      const r = await fetch(`${this.#base}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      const j = await r.json();
      if (!r.ok) return false;
      Store.auth.setToken(j.data.token);
      return true;
    } catch { return false; }
  }

  get   = (path, params) => this.#req('GET',    path, null,  params);
  post  = (path, body)   => this.#req('POST',   path, body);
  put   = (path, body)   => this.#req('PUT',    path, body);
  patch = (path, body)   => this.#req('PATCH',  path, body);
  del   = (path)         => this.#req('DELETE', path);
}

window.api = new ApiClient(API_BASE);
