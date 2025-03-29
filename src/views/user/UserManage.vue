<template>
  <admin-layout>
    <div class="user-manage-container">
      <div class="page-header">
        <h2 class="chinese-title">用户管理</h2>
        <div class="header-actions">
          <el-button type="primary" class="traditional-btn" @click="handleAddUser">
            <el-icon><el-icon-plus /></el-icon> 添加用户
          </el-button>
        </div>
      </div>
      
      <!-- 搜索过滤 -->
      <div class="filter-container traditional-card">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
          </el-form-item>
          
          <el-form-item label="用户角色">
            <el-select v-model="searchForm.role" placeholder="请选择" clearable>
              <el-option label="普通用户" :value="0" />
              <el-option label="管理员" :value="1" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" class="traditional-btn" @click="handleSearch">
              <el-icon><el-icon-search /></el-icon> 搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 用户表格 -->
      <div class="user-table traditional-card mt-20">
        <el-table
          :data="userList"
          style="width: 100%"
          border
          v-loading="loading"
        >
          <el-table-column prop="id" label="用户ID" width="80" />
          <el-table-column prop="username" label="用户名" width="150" />
          <el-table-column prop="role" label="角色" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.role === 0 ? 'info' : 'warning'" size="small">
                {{ scope.row.role === 0 ? '普通用户' : '管理员' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" width="150" />
          <el-table-column prop="create_time" label="创建时间" width="180" />
          <el-table-column prop="last_login" label="最后登录" width="180" />
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-switch
                v-model="scope.row.active"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="(val) => handleStatusChange(val, scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="280">
            <template #default="scope">
              <el-tooltip content="编辑用户" placement="top">
                <el-button 
                  link 
                  type="primary" 
                  size="small" 
                  @click="handleEdit(scope.row)"
                >
                  <el-icon><el-icon-edit /></el-icon> 编辑
                </el-button>
              </el-tooltip>
              
              <el-tooltip content="重置密码" placement="top">
                <el-button 
                  link 
                  type="warning" 
                  size="small" 
                  @click="handleResetPassword(scope.row)"
                >
                  <el-icon><el-icon-key /></el-icon> 重置密码
                </el-button>
              </el-tooltip>
              
              <el-tooltip content="删除用户" placement="top">
                <el-popconfirm
                  title="确定要删除该用户吗?"
                  @confirm="handleDelete(scope.row.id)"
                >
                  <template #reference>
                    <el-button 
                      link 
                      type="danger" 
                      size="small"
                    >
                      <el-icon><el-icon-delete /></el-icon> 删除
                    </el-button>
                  </template>
                </el-popconfirm>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password" v-if="dialogAction === 'add'">
          <el-input 
            v-model="userForm.password" 
            type="password" 
            placeholder="请输入密码" 
            show-password
          />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="普通用户" :value="0" />
            <el-option label="管理员" :value="1" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态" prop="active">
          <el-switch
            v-model="userForm.active"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            class="traditional-btn" 
            @click="submitUserForm"
          >确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 重置密码对话框 -->
    <el-dialog
      title="重置密码"
      v-model="resetDialogVisible"
      width="400px"
    >
      <el-form :model="resetForm" :rules="resetRules" ref="resetFormRef" label-width="100px">
        <el-form-item label="新密码" prop="password">
          <el-input 
            v-model="resetForm.password" 
            type="password" 
            placeholder="请输入新密码" 
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="resetForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码" 
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            class="traditional-btn" 
            @click="submitResetForm"
          >确定</el-button>
        </span>
      </template>
    </el-dialog>
  </admin-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from '@/components/AdminLayout.vue'

// 搜索表单
const searchForm = reactive({
  username: '',
  role: ''
})

// 用户列表
const loading = ref(false)
const userList = ref([
  {
    id: 1,
    username: 'admin',
    role: 1,
    phone: '137****8888',
    create_time: '2023-10-01 10:00:00',
    last_login: '2023-11-05 08:30:12',
    active: true
  },
  {
    id: 2,
    username: 'zhangsan',
    role: 0,
    phone: '159****2345',
    create_time: '2023-10-15 14:30:00',
    last_login: '2023-11-04 16:45:33',
    active: true
  },
  {
    id: 3,
    username: 'lisi',
    role: 0,
    phone: '186****7890',
    create_time: '2023-10-20 09:15:00',
    last_login: '2023-11-01 11:20:45',
    active: false
  }
])

// 分页
const total = ref(100)
const pageSize = ref(10)
const currentPage = ref(1)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')
const dialogAction = ref('add') // 'add' 或 'edit'
const userFormRef = ref(null)

// 用户表单
const userForm = reactive({
  id: 0,
  username: '',
  password: '',
  phone: '',
  role: 0,
  active: true
})

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 重置密码对话框
const resetDialogVisible = ref(false)
const resetFormRef = ref(null)
const resetForm = reactive({
  userId: 0,
  password: '',
  confirmPassword: ''
})

// 重置密码表单验证规则
const resetRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== resetForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 初始化
onMounted(() => {
  loadUserList()
})

// 加载用户列表
const loadUserList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadUserList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.username = ''
  searchForm.role = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  loadUserList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadUserList()
}

// 添加用户
const handleAddUser = () => {
  resetUserForm()
  dialogTitle.value = '添加用户'
  dialogAction.value = 'add'
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  resetUserForm()
  dialogTitle.value = '编辑用户'
  dialogAction.value = 'edit'
  
  userForm.id = row.id
  userForm.username = row.username
  userForm.phone = row.phone
  userForm.role = row.role
  userForm.active = row.active
  
  dialogVisible.value = true
}

// 重置用户表单
const resetUserForm = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
  
  userForm.id = 0
  userForm.username = ''
  userForm.password = ''
  userForm.phone = ''
  userForm.role = 0
  userForm.active = true
}

// 提交用户表单
const submitUserForm = () => {
  userFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟API请求
      setTimeout(() => {
        dialogVisible.value = false
        
        // 刷新列表
        loadUserList()
        
        // 提示
        ElMessage.success(dialogTitle.value === '添加用户' ? '添加成功' : '更新成功')
      }, 500)
    }
  })
}

// 修改用户状态
const handleStatusChange = (val, row) => {
  ElMessage.success(`用户 ${row.username} 已${val ? '启用' : '禁用'}`)
}

// 重置密码
const handleResetPassword = (row) => {
  resetForm.userId = row.id
  resetForm.password = ''
  resetForm.confirmPassword = ''
  
  if (resetFormRef.value) {
    resetFormRef.value.resetFields()
  }
  
  resetDialogVisible.value = true
}

// 提交重置密码
const submitResetForm = () => {
  resetFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟API请求
      setTimeout(() => {
        resetDialogVisible.value = false
        ElMessage.success('密码重置成功')
      }, 500)
    }
  })
}

// 删除用户
const handleDelete = (id) => {
  ElMessageBox.confirm('确定删除该用户吗？此操作不可恢复', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟API请求
    setTimeout(() => {
      // 刷新列表
      userList.value = userList.value.filter(user => user.id !== id)
      
      // 提示
      ElMessage.success('删除成功')
    }, 500)
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-container {
  padding: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>