/* ================================================================
   ENDPOINTS — All API calls in one module
   Every function returns a Promise<ApiResponse>
   ================================================================ */
window.endpoints = {
  /* Auth */
  register:       (d)         => api.post('/auth/register', d),
  login:          (d)         => api.post('/auth/login', d),
  logout:         ()          => api.post('/auth/logout'),
  refresh:        (d)         => api.post('/auth/refresh', d),
  getMe:          ()          => api.get('/auth/me'),
  updateProfile:  (d)         => api.patch('/auth/profile', d),
  changePassword: (d)         => api.patch('/auth/password', d),
  toggleWishlist: (id)        => api.post(`/auth/wishlist/${id}`),

  /* Products */
  getProducts:    (p)         => api.get('/products', p),
  getProduct:     (id)        => api.get(`/products/${id}`),
  getFeatured:    ()          => api.get('/products/featured'),
  getRelated:     (id)        => api.get(`/products/${id}/related`),
  getCategories:  ()          => api.get('/products/categories'),

  /* Reviews */
  createReview:   (id, d)     => api.post(`/products/${id}/reviews`, d),
  deleteReview:   (id, rid)   => api.del(`/products/${id}/reviews/${rid}`),

  /* Orders */
  createOrder:    (d)         => api.post('/orders', d),
  getMyOrders:    (p)         => api.get('/orders', p),
  getOrder:       (id)        => api.get(`/orders/${id}`),
  cancelOrder:    (id)        => api.patch(`/orders/${id}/cancel`),

  /* Admin */
  getDashboard:   ()          => api.get('/admin/dashboard'),
  getAllUsers:     (p)         => api.get('/admin/users', p),
  getAllOrders:    (p)         => api.get('/admin/orders', p),
  toggleUser:     (id)        => api.patch(`/admin/users/${id}/toggle`),
  updateOrderStatus:(id,d)    => api.patch(`/admin/orders/${id}/status`, d),
  createProduct:    (d)        => api.post('/products', d),
  updateProduct:    (id, d)   => api.put(`/products/${id}`, d),
  deleteProduct:    (id)      => api.del(`/products/${id}`),
  toggleUserActive: (id)      => api.patch(`/admin/users/${id}/toggle`),
};
