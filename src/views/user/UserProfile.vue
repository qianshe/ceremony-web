<template>
  <admin-layout>
    <div class="user-profile-container">
      <div class="page-header">
        <h2 class="chinese-title">个人信息</h2>
      </div>
      
      <div class="profile-content">
        <!-- 个人信息卡片 -->
        <div class="profile-card traditional-card">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="avatar-container">
                <el-avatar :size="120" :src="userInfo.avatar || defaultAvatar">
                  <el-icon><el-icon-user /></el-icon>
                </el-avatar>
                <el-upload
                  class="avatar-uploader"
                  action="/api/user/avatar"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload"
                >
                  <el-button size="small" class="upload-btn">
                    <el-icon><el-icon-upload /></el-icon> 更换头像
                  </el-button>
                </el-upload>
              </div>
            </el-col>
            
            <el-col :span="18">
              <div class="info-container">
                <div class="info-header">
                  <h3>{{ userInfo.username }}</h3>
                  <el-tag :type="userInfo.role === 1 ? 'warning' : 'info'" size="small">
                    {{ userInfo.role === 1 ? '管理员' : '普通用户' }}
                  </el-tag>
                </div>
                
                <div class="info-item">
                  <span class="label">手机号码：</span>
                  <span class="value">{{ userInfo.phone || '未设置' }}</span>
                </div>
                
                <div class="info-item">
                  <span class="label">电子邮箱：</span>
                  <span class="value">{{ userInfo.email || '未设置' }}</span>
                </div>
                
                <div class="info-item">
                  <span class="label">最后登录：</span>
                  <span class="value">{{ userInfo.lastLogin || '未知' }}</span>
                </div>
                
                <div class="info-item">
                  <span class="label">账号创建：</span>
                  <span class="value">{{ userInfo.createTime || '未知' }}</span>
                </div>
                
                <div class="action-buttons">
                  <el-button type="primary" class="traditional-btn" @click="showEditForm">
                    <el-icon><el-icon-edit /></el-icon> 编辑信息
                  </el-button>
                  <el-button type="warning" class="traditional-btn" @click="showPasswordForm">
                    <el-icon><el-icon-key /></el-icon> 修改密码
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        
      </div>
    </div>
    
    <!-- 编辑信息对话框 -->
    <el-dialog
      title="编辑个人信息"
      v-model="editDialogVisible"
      width="500px"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入电子邮箱" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            class="traditional-btn" 
            @click="submitEditForm"
          >确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 修改密码对话框 -->
    <el-dialog
      title="修改密码"
      v-model="passwordDialogVisible"
      width="500px"
    >
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            type="password" 
            placeholder="请输入当前密码" 
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码" 
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码" 
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            class="traditional-btn" 
            @click="submitPasswordForm"
          >确定</el-button>
        </span>
      </template>
    </el-dialog>
  </admin-layout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/AdminLayout.vue'
import { getUserInfo, updateUserInfo, updatePassword } from '@/api/user'

// 默认头像
const defaultAvatar = '/src/assets/images/default-avatar.svg'

// 用户信息
const userInfo = reactive({
  id: 0,
  username: '',
  phone: '',
  email: '',
  role: 0,
  avatar: '',
  lastLogin: '',
  createTime: '',
  approvalNumber: '' // 添加审核批号字段
})

// 上传相关
const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
})

// 编辑对话框
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  username: '',
  phone: '',
  email: ''
})

// 编辑表单验证规则
const editRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 密码对话框
const passwordDialogVisible = ref(false)
const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
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
  fetchUserInfo()
})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const data = await getUserInfo()
    Object.assign(userInfo, data)
  } catch (error) {
    console.error('获取用户信息失败', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 头像上传前检查
const beforeAvatarUpload = (file) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('头像只能是JPG或PNG格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过2MB!')
    return false
  }
  return true
}

// 头像上传成功
const handleAvatarSuccess = (response) => {
  userInfo.avatar = response.data
  ElMessage.success('头像更新成功')
}

// 显示编辑表单
const showEditForm = () => {
  editForm.username = userInfo.username
  editForm.phone = userInfo.phone
  editForm.email = userInfo.email
  
  editDialogVisible.value = true
}

// 提交编辑表单
const submitEditForm = () => {
  editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updateUserInfo(editForm)
        
        // 更新本地数据
        userInfo.username = editForm.username
        userInfo.phone = editForm.phone
        userInfo.email = editForm.email
        
        editDialogVisible.value = false
        ElMessage.success('个人信息更新成功')
      } catch (error) {
        console.error('更新个人信息失败', error)
        ElMessage.error('更新个人信息失败: ' + (error.message || '未知错误'))
      }
    }
  })
}

// 显示密码表单
const showPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
  
  passwordDialogVisible.value = true
}

// 提交密码表单
const submitPasswordForm = () => {
  passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updatePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        
        passwordDialogVisible.value = false
        ElMessage.success('密码修改成功')
      } catch (error) {
        console.error('修改密码失败', error)
        ElMessage.error('修改密码失败: ' + (error.message || '未知错误'))
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.profile-content {
  max-width: 900px;
  margin: 0 auto;
}

.profile-card {
  padding: 30px;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .el-avatar {
    border: 2px solid var(--border-color);
    background-color: #f5f7fa;
  }
  
  .upload-btn {
    margin-top: 15px;
  }
}

.info-container {
  padding: 0 20px;
  
  .info-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      margin-right: 10px;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }
  
  .info-item {
    margin-bottom: 15px;
    font-size: 14px;
    
    .label {
      color: var(--text-secondary);
      display: inline-block;
      width: 100px;
    }
    
    .value {
      color: var(--text-primary);
      font-weight: 500;
    }
  }
  
  .action-buttons {
    margin-top: 30px;
    
    .el-button {
      margin-right: 15px;
    }
  }
}

.approval-card {
  margin-top: 20px;
  padding: 20px 30px;
  
  .approval-header {
    margin-bottom: 15px;
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }
  
  .approval-content {
    .approval-item {
      font-size: 14px;
      
      .label {
        color: var(--text-secondary);
        display: inline-block;
        width: 100px;
      }
      
      .value {
        color: var(--text-primary);
        font-weight: 500;
      }
    }
  }
}
</style>