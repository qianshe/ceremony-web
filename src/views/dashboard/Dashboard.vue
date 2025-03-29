<template>
  <admin-layout>
    <div class="dashboard-container">
      <div class="page-header">
        <h2 class="chinese-title">管理控制台</h2>
      </div>
      
      <!-- 欢迎卡片 -->
      <div class="welcome-card traditional-card">
        <div class="welcome-content">
          <h3>欢迎使用乡镇红白事一站式服务平台</h3>
          <p>今天是 {{ todayFormatted }}，祝您工作顺利！</p>
        </div>
        <div class="welcome-actions">
          <el-button type="primary" class="traditional-btn" @click="$router.push('/statistics')">
            查看数据统计
          </el-button>
        </div>
      </div>
      
      <!-- 快捷导航 -->
      <div class="quick-nav">
        <el-row :gutter="20">
          <el-col :xs="12" :sm="6" :md="4" v-for="(item, index) in quickLinks" :key="index">
            <router-link :to="item.path" class="quick-link-item">
              <div class="quick-link-icon" :class="item.class">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <div class="quick-link-text">{{ item.text }}</div>
            </router-link>
          </el-col>
        </el-row>
      </div>
      
      <!-- 待办事项和通知 -->
      <el-row :gutter="20" class="dashboard-main">
        <el-col :md="16">
          <div class="traditional-card todo-card">
            <div class="card-header">
              <h3>待办事项</h3>
              <el-button link @click="refreshTodos">刷新</el-button>
            </div>
            <div class="card-content" v-loading="todoLoading">
              <div v-if="todoList.length === 0" class="empty-data">
                <el-icon><el-icon-document-checked /></el-icon>
                <p>暂无待办事项</p>
              </div>
              <ul class="todo-list" v-else>
                <li v-for="(todo, index) in todoList" :key="index" class="todo-item">
                  <div class="todo-content">
                    <div class="todo-tag" :class="getTodoTagClass(todo.type)">
                      {{ getTodoTypeText(todo.type) }}
                    </div>
                    <div class="todo-title">{{ todo.title }}</div>
                    <div class="todo-time">{{ todo.createdTime }}</div>
                  </div>
                  <div class="todo-actions">
                    <el-button 
                      @click="handleTodoAction(todo)" 
                      :type="getTodoActionType(todo.type)"
                      size="small"
                    >
                      {{ getTodoActionText(todo.type) }}
                    </el-button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </el-col>
        
        <el-col :md="8">
          <div class="traditional-card notice-card">
            <div class="card-header">
              <h3>系统通知</h3>
            </div>
            <div class="card-content" v-loading="noticeLoading">
              <div v-if="noticeList.length === 0" class="empty-data">
                <el-icon><el-icon-chat-dot-square /></el-icon>
                <p>暂无系统通知</p>
              </div>
              <ul class="notice-list" v-else>
                <li v-for="(notice, index) in noticeList" :key="index" class="notice-item">
                  <div class="notice-title">{{ notice.title }}</div>
                  <div class="notice-content">{{ notice.content }}</div>
                  <div class="notice-time">{{ notice.time }}</div>
                </li>
              </ul>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/AdminLayout.vue'
import api from '@/api'

// 待办列表
const todoList = ref([])
const todoLoading = ref(false)

// 通知列表
const noticeList = ref([])
const noticeLoading = ref(false)

// 获取今天日期
const todayFormatted = computed(() => {
  const today = new Date()
  return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
})

// 快捷导航
const quickLinks = [
  { 
    text: '商品管理', 
    path: '/product-manage', 
    icon: 'el-icon-goods',
    class: 'bg-primary'
  },
  { 
    text: '订单管理', 
    path: '/order-manage', 
    icon: 'el-icon-document',
    class: 'bg-success'
  },
  { 
    text: '流程管理', 
    path: '/process-manage', 
    icon: 'el-icon-sort',
    class: 'bg-info'
  },
  { 
    text: '用户管理', 
    path: '/user-manage', 
    icon: 'el-icon-user',
    class: 'bg-warning'
  },
  { 
    text: '统计分析', 
    path: '/statistics', 
    icon: 'el-icon-data-analysis',
    class: 'bg-danger'
  }
]

// 初始化
onMounted(() => {
  refreshTodos()
  loadNotices()
})

// 刷新待办事项
const refreshTodos = async () => {
  todoLoading.value = true
  try {
    const res = await api.dashboard.getTodoList()
    if (res && res.data) {
      todoList.value = res.data || []
    }
  } catch (error) {
    console.error('获取待办事项失败：', error)
  } finally {
    todoLoading.value = false
  }
}

// 加载系统通知
const loadNotices = async () => {
  noticeLoading.value = true
  try {
    const res = await api.dashboard.getNotices()
    if (res && res.data) {
      noticeList.value = res.data || []
    }
  } catch (error) {
    console.error('获取系统通知失败：', error)
  } finally {
    noticeLoading.value = false
  }
}

// 获取待办事项标签类
const getTodoTagClass = (type) => {
  const classMap = {
    'order': 'tag-primary',
    'product': 'tag-success',
    'user': 'tag-warning',
    'system': 'tag-danger'
  }
  return classMap[type] || 'tag-info'
}

// 获取待办事项类型文本
const getTodoTypeText = (type) => {
  const textMap = {
    'order': '订单',
    'product': '商品',
    'user': '用户',
    'system': '系统'
  }
  return textMap[type] || '其他'
}

// 获取待办事项操作文本
const getTodoActionText = (type) => {
  const textMap = {
    'order': '查看订单',
    'product': '查看商品',
    'user': '查看用户',
    'system': '处理'
  }
  return textMap[type] || '查看'
}

// 获取待办事项操作按钮类型
const getTodoActionType = (type) => {
  const typeMap = {
    'order': 'primary',
    'product': 'success',
    'user': 'warning',
    'system': 'danger'
  }
  return typeMap[type] || 'info'
}

// 处理待办事项操作
const handleTodoAction = (todo) => {
  const routeMap = {
    'order': `/order-manage?id=${todo.id}`,
    'product': `/product-manage?id=${todo.id}`,
    'user': `/user-manage?id=${todo.id}`,
    'system': ''
  }
  
  const route = routeMap[todo.type]
  if (route) {
    location.href = route
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  min-height: 100%;
}

.welcome-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  margin-bottom: 20px;
  
  .welcome-content {
    h3 {
      font-size: 18px;
      color: var(--primary-color);
      margin: 0 0 8px 0;
      font-family: "STZhongsong", serif;
    }
    
    p {
      margin: 0;
      color: var(--text-secondary);
    }
  }
}

.quick-nav {
  margin-bottom: 20px;
  
  .quick-link-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    background-color: white;
    border-radius: 8px;
    transition: all 0.3s;
    text-decoration: none;
    margin-bottom: 20px;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
    }
    
    .quick-link-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 10px;
      
      .el-icon {
        font-size: 24px;
        color: white;
      }
      
      &.bg-primary {
        background-color: var(--primary-color);
      }
      
      &.bg-success {
        background-color: var(--happy-color);
      }
      
      &.bg-info {
        background-color: #909399;
      }
      
      &.bg-warning {
        background-color: #e6a23c;
      }
      
      &.bg-danger {
        background-color: var(--memorial-color);
      }
    }
    
    .quick-link-text {
      font-size: 14px;
      color: var(--text-primary);
    }
  }
}

.dashboard-main {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    h3 {
      font-size: 16px;
      margin: 0;
    }
  }
  
  .empty-data {
    text-align: center;
    padding: 30px 0;
    color: var(--text-secondary);
    
    .el-icon {
      font-size: 40px;
      color: #dcdfe6;
      margin-bottom: 10px;
    }
    
    p {
      margin: 0;
    }
  }
}

.todo-card, .notice-card {
  height: 400px;
  margin-bottom: 20px;
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  .card-content {
    flex: 1;
    overflow-y: auto;
  }
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
  
  .todo-item {
    padding: 12px 0;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &:last-child {
      border-bottom: none;
    }
    
    .todo-content {
      flex: 1;
      
      .todo-tag {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        color: white;
        margin-right: 10px;
        
        &.tag-primary {
          background-color: var(--primary-color);
        }
        
        &.tag-success {
          background-color: var(--happy-color);
        }
        
        &.tag-warning {
          background-color: #e6a23c;
        }
        
        &.tag-danger {
          background-color: var(--memorial-color);
        }
        
        &.tag-info {
          background-color: #909399;
        }
      }
      
      .todo-title {
        display: inline-block;
        font-weight: bold;
        margin-bottom: 5px;
        color: var(--text-primary);
      }
      
      .todo-time {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }
}

.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
  
  .notice-item {
    padding: 15px;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .notice-title {
      font-weight: bold;
      margin-bottom: 5px;
      color: var(--text-primary);
    }
    
    .notice-content {
      margin-bottom: 5px;
      color: var(--text-secondary);
      font-size: 14px;
    }
    
    .notice-time {
      font-size: 12px;
      color: var(--text-tertiary);
    }
  }
}

@media (max-width: 768px) {
  .welcome-card {
    flex-direction: column;
    align-items: flex-start;
    
    .welcome-actions {
      margin-top: 15px;
    }
  }
}
</style>