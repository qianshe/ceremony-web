import { createRouter, createWebHistory } from 'vue-router'

// 导入各模块组件
import { Login, 
  NotFound,
  Dashboard, 
  Statistics, 
  OrderManage, 
  ProcessManage, 
  ProductManage, 
  ProductCategory, 
  ProductSupplier, 
  UserManage, 
  UserProfile } from '../views'

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: '管理控制台', requiresAuth: true }
  },
  {
    path: '/product-manage',
    name: 'ProductManage',
    component: ProductManage,
    meta: { title: '商品管理', requiresAuth: true }
  },
  {
    path: '/product-category',
    name: 'ProductCategory',
    component: ProductCategory,
    meta: { title: '商品分类', requiresAuth: true }
  },
  {
    path: '/product-supplier',
    name: 'ProductSupplier',
    component: ProductSupplier,
    meta: { title: '供应商管理', requiresAuth: true }
  },
  {
    path: '/order-manage',
    name: 'OrderManage',
    component: OrderManage,
    meta: { title: '订单管理', requiresAuth: true }
  },
  {
    path: '/process-manage',
    name: 'ProcessManage',
    component: ProcessManage,
    meta: { title: '流程管理', requiresAuth: true }
  },
  {
    path: '/user-manage',
    name: 'UserManage',
    component: UserManage,
    meta: { title: '用户管理', requiresAuth: true }
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { title: '个人信息', requiresAuth: true }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics,
    meta: { title: '统计分析', requiresAuth: true }
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '404 Not Found', requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 导航守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '乡镇红白事一站式服务平台'
  
  // 权限检查
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    // 检查token是否存在且不为空字符串
    if (!token || token.trim() === '') {
      // 清除可能存在的无效token
      localStorage.removeItem('token')
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router