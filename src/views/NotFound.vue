<template>
  <div class="not-found-container">
    <div class="chinese-pattern"></div>
    <div class="not-found-content">
      <div class="error-code">404</div>
      <div class="divider"></div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-message">抱歉，您访问的页面不存在或已被移除</p>
      <router-link to="/dashboard" class="back-btn traditional-btn">
        返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup>
// 无特殊逻辑
</script>

<style lang="scss" scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: var(--light-bg);
  position: relative;
  overflow: hidden;
}

.not-found-content {
  text-align: center;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 8px;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, var(--primary-color), var(--gold));
    border-radius: 4px 4px 0 0;
  }
}

.error-code {
  font-size: 100px;
  font-weight: bold;
  color: var(--primary-color);
  font-family: "STZhongsong", serif;
  line-height: 1;
  margin-bottom: 10px;
  opacity: 0.8;
}

.error-title {
  font-size: 28px;
  margin: 20px 0;
  color: var(--text-primary);
  font-family: "STZhongsong", serif;
}

.error-message {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 30px;
}

.back-btn {
  display: inline-block;
  padding: 10px 30px;
  font-size: 16px;
  text-decoration: none;
  color: white;
  background-color: var(--primary-color);
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
}
</style> 