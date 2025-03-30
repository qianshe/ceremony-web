import { get, post, put, del } from './request'

// 用户登录
export function login(data) {
  return post('/user/login', data)
}

// 获取微信登录二维码
export function getWechatQrCode() {
  return get('/user/wechat/qrcode')
}

// 检查微信扫码登录状态
export function checkWechatLogin(sceneId) {
  return get('/user/wechat/check', { sceneId })
}

// 获取用户信息
export function getUserInfo() {
  return get('/user/info')
}

// 用户列表
export function getUserList(params) {
  return get('/user/list', params)
}

// 添加用户
export function addUser(data) {
  return post('/user/add', data)
}

// 编辑用户
export function updateUser(id, data) {
  return put(`/user/${id}`, data)
}

// 删除用户
export function deleteUser(id) {
  return del(`/user/${id}`)
}

// 重置密码
export function resetPassword(id, data) {
  return post(`/user/${id}/reset-password`, data)
}

// 修改用户状态
export function changeUserStatus(id, status) {
  return put(`/user/${id}/status`, { status })
} 

// 更新个人信息
export function updateUserInfo(data) {
  return put('/user/profile', data)
}

// 修改密码
export function updatePassword(data) {
  return post('/user/change-password', data)
}