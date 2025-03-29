<template>
  <div class="admin-layout" :class="{ 'collapsed': isCollapsed }">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="logo">
        <h2 class="text-center">{{ isCollapsed ? '红白' : '乡镇红白事' }}</h2>
        <div class="divider"></div>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :default-openeds="defaultOpeneds"
        class="sidebar-menu"
        background-color="var(--paper-color)"
        text-color="var(--text-primary)"
        active-text-color="var(--primary-color)"
        :collapse="isCollapsed"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><el-icon-house /></el-icon>
          <template #title>控制台</template>
        </el-menu-item>
        
        <el-sub-menu index="/product">
          <template #title>
            <el-icon><el-icon-goods /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/product-manage">
            <el-icon><el-icon-menu /></el-icon>
            全部商品
          </el-menu-item>
          <el-menu-item index="/product-category">
            <el-icon><el-icon-folder /></el-icon>
            商品分类
          </el-menu-item>
          <el-menu-item index="/product-supplier">
            <el-icon><el-icon-office-building /></el-icon>
            供应商管理
          </el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/order-manage">
          <el-icon><el-icon-document /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        
        <el-menu-item index="/process-manage">
          <el-icon><el-icon-sort /></el-icon>
          <template #title>流程管理</template>
        </el-menu-item>
        
        <el-menu-item index="/user-manage">
          <el-icon><el-icon-user /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        
        <el-menu-item index="/statistics">
          <el-icon><el-icon-data-analysis /></el-icon>
          <template #title>统计分析</template>
        </el-menu-item>
      </el-menu>
    </div>
    
    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <div class="top-navbar">
        <div class="left-section">
          <el-button 
            type="text" 
            class="collapse-btn"
            @click="toggleCollapse"
          >
            <el-icon :size="20">
              <el-icon-menu v-if="isCollapsed" />
              <el-icon-fold v-else />
            </el-icon>
          </el-button>
        
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
        
        <div class="user-info">
          <el-dropdown trigger="click">
            <span class="user-dropdown-link">
              {{ username }} <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/user/profile')">个人信息</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 内容展示区 -->
      <div class="content-wrapper">
        <slot></slot>
      </div>
      
      <!-- 底部备案信息 -->
      <div class="footer">
        <div class="footer-content">
          <p>© 2023 乡镇红白事一站式服务平台 版权所有</p>
          <p>备案号：浙ICP备XXXXXXXX号 | 公安备案号：33010xxxxxx</p>
          <p>技术支持：XXXX科技有限公司</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 侧边栏折叠状态
const isCollapsed = ref(false)

// 用户信息
const username = ref('管理员')

// 当前活动菜单项
const activeMenu = computed(() => {
  // 如果当前路径以/product开头，则返回/product作为活动菜单
  if (route.path.startsWith('/product-')) {
    return '/product'
  }
  return route.path
})

// 默认展开的子菜单
const defaultOpeneds = computed(() => {
  const openeds = []
  // 如果当前路径以/product开头，则默认展开商品管理菜单
  if (route.path.startsWith('/product-')) {
    openeds.push('/product')
  }
  return openeds
})

// 当前页面标题
const currentPageTitle = computed(() => {
  return route.meta.title || '页面'
})

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  height: 100%;
  width: 100%;
  transition: all 0.3s;
  
  &.collapsed {
    .sidebar {
      width: 64px;
    }
  }
}

.sidebar {
  width: 220px;
  height: 100%;
  background-color: var(--paper-color);
  border-right: 1px solid #eee;
  overflow-y: auto;
  transition: width 0.3s;
  
  .logo {
    padding: 20px 0;
    color: var(--primary-color);
    font-family: "STZhongsong", serif;
    overflow: hidden;
  }
  
  .sidebar-menu {
    border-right: none;
  }
  
  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    
    &.happy-dot {
      background-color: var(--happy-color);
    }
    
    &.memorial-dot {
      background-color: var(--memorial-color);
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-navbar {
  height: 60px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  background-color: white;
  
  .left-section {
    display: flex;
    align-items: center;
    
    .collapse-btn {
      margin-right: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.user-dropdown-link {
  cursor: pointer;
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: var(--light-bg);
}

.footer {
  padding: 15px 0;
  background-color: var(--paper-color);
  border-top: 1px solid #eee;
  text-align: center;
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    
    p {
      margin: 5px 0;
      font-size: 12px;
      color: var(--text-secondary);
    }
  }
}

@media (max-width: 768px) {
  .admin-layout {
    .sidebar {
      position: fixed;
      z-index: 999;
      height: 100%;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    }
    
    &.collapsed .sidebar {
      width: 0;
      overflow: hidden;
    }
  }
  
  .content-wrapper {
    padding: 15px;
  }
}
</style>