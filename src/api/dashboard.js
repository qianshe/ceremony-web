import { get } from './request'

// 获取总体统计数据
export function getDashboardStats() {
  return get('/dashboard/stats')
}

// 获取订单趋势
export function getOrderTrend(params) {
  return get('/dashboard/order-trend', params)
}

// 获取商品销量排行
export function getProductRank(params) {
  return get('/dashboard/product-rank', params)
}

// 获取红白事分布
export function getCategoryDistribution(params) {
  return get('/dashboard/category-distribution', params)
}

// 获取待办事项
export function getTodoList() {
  return get('/dashboard/todo-list')
}

// 获取系统通知
export function getNotices() {
  return get('/dashboard/notices')
} 