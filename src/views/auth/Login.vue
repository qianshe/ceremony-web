<template>
  <div class="login-container">
    <div class="traditional-pattern"></div>
    
    <div class="login-box traditional-card">
      <div class="login-header">
        <h1 class="chinese-title">乡镇红白事一站式服务平台</h1>
        <p class="subtitle">管理后台登录</p>
      </div>
      
      <div class="login-tabs">
        <div 
          class="tab" 
          :class="{ active: loginType === 'account' }" 
          @click="switchLoginType('account')"
        >
          账号密码登录
        </div>
        <div 
          class="tab" 
          :class="{ active: loginType === 'wechat' }" 
          @click="switchLoginType('wechat')"
        >
          微信扫码登录
        </div>
      </div>
      
      <!-- 账号密码登录 -->
      <el-form 
        v-if="loginType === 'account'" 
        :model="loginForm" 
        :rules="loginRules" 
        ref="loginFormRef" 
        class="login-form"
      >
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
      
      <!-- 微信扫码登录 -->
      <div v-if="loginType === 'wechat'" class="wechat-login">
        <div class="qrcode-container">
          <div v-if="!wechatQrCode" class="loading-qrcode">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>正在加载二维码...</span>
          </div>
          <div v-else class="qrcode">
            <img :src="wechatQrCode" alt="微信扫码登录" />
          </div>
        </div>
        <div class="wechat-tips">
          <p>请使用微信扫一扫</p>
          <p>扫描上方二维码完成登录</p>
        </div>
        <div class="qrcode-refresh">
          <el-button 
            type="text" 
            :disabled="loading" 
            @click="refreshQrCode"
          >
            <el-icon><Refresh /></el-icon> 刷新二维码
          </el-button>
        </div>
      </div>
      
      <div class="login-footer">
        <p class="copyright">© {{ currentYear }} 乡镇红白事一站式服务平台</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login, getWechatQrCode, checkWechatLogin } from '@/api/user'
import { Loading, Refresh } from '@element-plus/icons-vue'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)
const loginType = ref('account') // account 账号密码登录 | wechat 微信扫码登录
const wechatQrCode = ref('') // 微信二维码图片地址
const wechatLoginTimer = ref(null) // 轮询微信登录状态的定时器

// 切换登录方式
const switchLoginType = (type) => {
  loginType.value = type
  // 如果切换到微信登录且二维码为空，则请求二维码
  if (type === 'wechat' && !wechatQrCode.value) {
    getQrCode()
  }
  // 如果切换到账号密码登录，清除微信登录的轮询
  if (type === 'account') {
    clearWechatLoginCheck()
  }
}

// 获取微信登录二维码
const getQrCode = async () => {
  loading.value = true
  try {
    const data = await getWechatQrCode()
    wechatQrCode.value = data.qrCodeUrl
    // 开始轮询检查微信登录状态
    startWechatLoginCheck(data.sceneId)
  } catch (error) {
    ElMessage.error('获取微信二维码失败，请重试')
  } finally {
    loading.value = false
  }
}

// 刷新微信二维码
const refreshQrCode = () => {
  wechatQrCode.value = ''
  clearWechatLoginCheck()
  getQrCode()
}

// 开始检查微信登录状态
const startWechatLoginCheck = (sceneId) => {
  // 先清除可能存在的定时器
  clearWechatLoginCheck()
  // 每3秒检查一次登录状态
  wechatLoginTimer.value = setInterval(async () => {
    try {
      const result = await checkWechatLogin(sceneId)
      if (result.success) {
        // 登录成功
        clearWechatLoginCheck()
        // 保存token
        localStorage.setItem('token', result.token)
        // 跳转到首页
        router.push('/dashboard')
        ElMessage.success('登录成功')
      }
    } catch (error) {
      console.error('检查微信登录状态失败:', error)
    }
  }, 3000)
}

// 清除微信登录检查定时器
const clearWechatLoginCheck = () => {
  if (wechatLoginTimer.value) {
    clearInterval(wechatLoginTimer.value)
    wechatLoginTimer.value = null
  }
}

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
      // 调用登录API
      const result = await login(loginForm)
      
      // 保存token
      localStorage.setItem('token', result.token)
      
      // 跳转到首页
      router.push('/dashboard')
      
      ElMessage.success('登录成功')
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error('登录失败，请检查用户名和密码')
    } finally {
      loading.value = false
    }
  }
}

// 在组件卸载时清除定时器
onMounted(() => {
  // 组件挂载时默认请求微信二维码
  // 如果默认是微信登录方式则加载二维码
  if (loginType.value === 'wechat') {
    getQrCode()
  }
})
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
  margin-bottom: 20px;
  
  .chinese-title {
    margin-bottom: 10px;
    font-size: 24px;
  }
  
  .subtitle {
    color: var(--text-secondary);
    font-size: 16px;
  }
}

.login-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  
  .tab {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    cursor: pointer;
    position: relative;
    color: #999;
    transition: all 0.3s;
    
    &.active {
      color: var(--el-color-primary);
      font-weight: 500;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 20%;
        width: 60%;
        height: 2px;
        background-color: var(--el-color-primary);
      }
    }
    
    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.login-button {
  width: 100%;
  font-size: 16px;
  height: 40px;
}

.wechat-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.qrcode-container {
  width: 180px;
  height: 180px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.loading-qrcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .loading-icon {
    font-size: 30px;
    margin-bottom: 10px;
    animation: rotate 1.5s linear infinite;
  }
}

.qrcode {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 100%;
  }
}

.wechat-tips {
  margin-bottom: 15px;
  text-align: center;
  color: #666;
  
  p {
    margin: 5px 0;
    font-size: 14px;
  }
}

.qrcode-refresh {
  font-size: 14px;
  cursor: pointer;
  color: var(--el-color-primary);
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  
  .copyright {
    font-size: 12px;
    color: var(--text-light);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 