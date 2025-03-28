import { get, post, put } from './request'

// 订单列表
export function getOrderList(params) {
  return get('/order/list', params)
}

// 获取订单详情
export function getOrderDetail(id) {
  return get(`/order/${id}`)
}

// 确认订单
export function confirmOrder(id) {
  return put(`/order/${id}/confirm`)
}

// 完成订单
export function completeOrder(id) {
  return put(`/order/${id}/complete`)
}

// 取消订单
export function cancelOrder(id, reason) {
  return put(`/order/${id}/cancel`, { reason })
}

// 获取订单统计数据
export function getOrderStats(params) {
  return get('/order/stats', params)
}

// 导出订单
export function exportOrders(params) {
  return get('/order/export', params, {
    responseType: 'blob'
  })
}

// 打印订单
export function printOrder(id) {
  return get(`/order/${id}/print`, {}, {
    responseType: 'blob'
  })
} 