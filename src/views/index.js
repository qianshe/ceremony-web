// 统一导出所有视图模块

// 认证模块
export { default as Login } from './auth/Login.vue'

// 通用页面模块
export { default as NotFound } from './common/NotFound.vue'

// 仪表盘模块
export { default as Dashboard } from './dashboard/Dashboard.vue'
export { default as Statistics } from './dashboard/Statistics.vue'

// 订单管理模块
export { default as OrderManage } from './order/OrderManage.vue'

// 流程管理模块
export { default as ProcessManage } from './process/ProcessManage.vue'

// 商品管理模块
export { default as ProductManage } from './product/ProductManage.vue'
export { default as ProductCategory } from './product/ProductCategory.vue'
export { default as ProductSupplier } from './product/ProductSupplier.vue'

// 用户管理模块
export { default as UserManage } from './user/UserManage.vue'
export { default as UserProfile } from './user/UserProfile.vue'