import { get, post, put, del } from './request'

// 分页获取商品列表
export function getProductList(params) {
  return get('/api/admin/products', params)
}

// 获取商品详情
export function getProductDetail(id, params = {}) {
  return get(`/api/admin/products/${id}`, params)
}

// 添加商品
export function addProduct(data) {
  return post('/api/admin/products', data)
}

// 更新商品
export function updateProduct(id, data) {
  return put(`/api/admin/products/${id}`, data)
}

// 删除商品
export function deleteProduct(id) {
  return del(`/api/admin/products/${id}`)
}

// 修改商品状态
export function changeProductStatus(id, status) {
  return put(`/api/admin/products/${id}`, { status })
}

// 更新商品库存
export function updateProductStock(data) {
  return post('/api/admin/products/updateStock', data)
}

// 获取所有商品分类
export function getCategoryList() {
  return get('/api/admin/products/categories')
}

// 获取分类详情
export function getCategoryDetail(id) {
  return get(`/api/admin/products/categories/${id}`)
}

// 添加商品分类
export function addCategory(data) {
  return post('/api/admin/products/categories', data)
}

// 更新商品分类
export function updateCategory(id, data) {
  return put(`/api/admin/products/categories/${id}`, data)
}

// 删除商品分类
export function deleteCategory(id) {
  return del(`/api/admin/products/categories/${id}`)
}

// 获取供应商列表
export function getSupplierList() {
  return get('/api/admin/suppliers')
}

// 添加供应商
export function addSupplier(data) {
  return post('/api/admin/suppliers', data)
}

// 更新供应商
export function updateSupplier(id, data) {
  return put(`/api/admin/suppliers/${id}`, data)
}

// 删除供应商
export function deleteSupplier(id) {
  return del(`/api/admin/suppliers/${id}`)
} 