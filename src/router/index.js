import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '管理控制台', requiresAuth: true }
  },
  {
    path: '/product-manage',
    name: 'ProductManage',
    component: () => import('../views/ProductManage.vue'),
    meta: { title: '商品管理', requiresAuth: true }
  },
  {
    path: '/product-category',
    name: 'ProductCategory',
    component: () => import('../views/ProductCategory.vue'),
    meta: { title: '商品分类', requiresAuth: true }
  },
  {
    path: '/product-supplier',
    name: 'ProductSupplier',
    component: () => import('../views/ProductSupplier.vue'),
    meta: { title: '供应商管理', requiresAuth: true }
  },
  {
    path: '/order-manage',
    name: 'OrderManage',
    component: () => import('../views/OrderManage.vue'),
    meta: { title: '订单管理', requiresAuth: true }
  },
  {
    path: '/process-manage',
    name: 'ProcessManage',
    component: () => import('../views/ProcessManage.vue'),
    meta: { title: '流程管理', requiresAuth: true }
  },
  {
    path: '/user-manage',
    name: 'UserManage',
    component: () => import('../views/UserManage.vue'),
    meta: { title: '用户管理', requiresAuth: true }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue'),
    meta: { title: '统计分析', requiresAuth: true }
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
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
    if (!token) {
      next({ name: 'Login' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router 