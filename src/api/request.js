import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 创建axios实例
const service = axios.create({
  baseURL: '',  // 不设置 baseURL
  timeout: 15000,
  headers: {
    'Accept': '*/*',
    'Content-Type': 'application/json',
    'Authorization': ''  // 初始化为空字符串，匹配 curl 中的空 Authorization
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage中获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 确保每个请求都有这些头
    config.headers['Accept'] = '*/*'
    config.headers['Content-Type'] = 'application/json'
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 根据后端约定的状态码判断请求是否成功
    if (res.code !== 0 && res.code !== 200) {
      ElMessage({
        message: res.message || '系统错误',
        type: 'error',
        duration: 3000
      })
      
      // 401: 未登录或token过期
      if (res.code === 401) {
        // 清除token并跳转到登录页
        localStorage.removeItem('token')
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.message || '系统错误'))
    } else {
      // 直接返回 data 字段中的数据，这样外部就可以直接使用
      return res.data
    }
  },
  error => {
    console.error('响应错误:', error)
    
    // 根据HTTP状态码处理错误
    const { response } = error
    let message = '系统错误，请稍后重试'
    
    if (response) {
      switch (response.status) {
        case 401:
          message = '未登录或登录已过期，请重新登录'
          // 清除token并跳转到登录页
          localStorage.removeItem('token')
          router.push('/login')
          break
        case 403:
          message = '没有权限访问该资源'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = `请求错误(${response.status})`
          break
      }
    } else {
      // 请求超时或网络错误
      if (error.message.includes('timeout')) {
        message = '请求超时，请检查网络'
      } else {
        message = '网络连接失败，请检查网络'
      }
    }
    
    ElMessage({
      message,
      type: 'error',
      duration: 3000
    })
    
    return Promise.reject(error)
  }
)

// 封装GET请求
export function get(url, params = {}) {
  return service({
    url,
    method: 'get',
    params
  })
}

// 封装POST请求
export function post(url, data = {}) {
  return service({
    url,
    method: 'post',
    data
  })
}

// 封装PUT请求
export function put(url, data = {}) {
  return service({
    url,
    method: 'put',
    data
  })
}

// 封装DELETE请求
export function del(url, params = {}) {
  return service({
    url,
    method: 'delete',
    params
  })
}

// 导出请求方法
export default service 