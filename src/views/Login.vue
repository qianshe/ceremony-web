<template>
  <div class="login-container">
    <div class="traditional-pattern"></div>
    
    <div class="login-box traditional-card">
      <div class="login-header">
        <h1 class="chinese-title">乡镇红白事一站式服务平台</h1>
        <p class="subtitle">管理后台登录</p>
      </div>
      
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            prefix-icon="el-icon-user"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="el-icon-lock" 
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            class="login-button traditional-btn" 
            :loading="loading" 
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p class="copyright">© {{ currentYear }} 乡镇红白事一站式服务平台</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ]
}

// 当前年份
const currentYear = computed(() => {
  return new Date().getFullYear()
})

// 登录处理
const handleLogin = async () => {
  let valid = false
  try {
    valid = await loginFormRef.value.validate()
  } catch (error) {
    valid = false
  }
  
  if (valid) {
    loading.value = true
    
    try {
      // 模拟登录API调用
      setTimeout(() => {
        // 实际项目中应调用后端API验证用户
        // const res = await api.user.login(form)
        
        // 模拟登录成功，保存token
        localStorage.setItem('token', 'mock-token-12345')
        
        // 跳转到首页
        router.push('/dashboard')
        
        loading.value = false
      }, 1000)
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error('登录失败，请检查用户名和密码')
      loading.value = false
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f9f6f1;
  background-size: cover;
  position: relative;
}

.traditional-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/src/assets/images/pattern.svg') repeat;
  opacity: 0.05;
  z-index: 1;
}

.login-box {
  width: 400px;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  position: relative;
  z-index: 2;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  
  &::after {
    content: "";
    position: absolute;
    right: 20px;
    bottom: 20px;
    width: 80px;
    height: 80px;
    background: url('/src/assets/images/seal.svg') no-repeat center;
    background-size: contain;
    opacity: 0.1;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  
  .chinese-title {
    margin-bottom: 10px;
    font-size: 24px;
  }
  
  .subtitle {
    color: var(--text-secondary);
    font-size: 16px;
  }
}

.login-button {
  width: 100%;
  font-size: 16px;
  height: 40px;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  
  .copyright {
    font-size: 12px;
    color: var(--text-light);
  }
}
</style> 