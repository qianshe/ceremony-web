import { get, post, put, del } from './request'

// 流程列表
export function getProcessList(params) {
  return get('/process/list', params)
}

// 获取流程详情
export function getProcessDetail(id) {
  return get(`/process/${id}`)
}

// 添加流程
export function addProcess(data) {
  return post('/process/add', data)
}

// 编辑流程
export function updateProcess(id, data) {
  return put(`/process/${id}`, data)
}

// 删除流程
export function deleteProcess(id) {
  return del(`/process/${id}`)
}

// 调整流程顺序
export function reorderProcess(data) {
  return put('/process/reorder', data)
}

// 获取流程关联的商品
export function getProcessProducts(id) {
  return get(`/process/${id}/products`)
}

// 设置流程关联的商品
export function setProcessProducts(id, productIds) {
  return post(`/process/${id}/products`, { productIds })
} 