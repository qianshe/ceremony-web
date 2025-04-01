# Docker部署指南

本文档详细说明如何使用Docker部署乡镇红白事一站式服务平台的前端应用。

## 环境要求

- Docker Engine 20.10.0 或更高版本
- Docker Compose 2.0.0 或更高版本
- Node.js 18.x（仅用于前端本地开发）
- JDK 17（仅用于后端本地开发）

## 项目结构

```
├── Dockerfile          # 前端应用Docker构建文件
├── nginx.conf         # Nginx配置文件
├── docker-compose.yml # 容器编排配置文件
├── src/               # 前端源代码目录
└── ../ceremony-server/ # 后端源代码目录
```

## 部署步骤

### 1. 构建镜像并启动服务

```bash
# 在项目根目录下执行
docker-compose up --build -d
```

这个命令会：
- 构建前端应用的Docker镜像
- 启动前端服务和API服务
- 设置网络连接

### 2. 验证部署

- 访问 http://localhost 查看前端应用
- 访问 http://localhost/api 测试Java后端API服务

### 3. 查看日志

```bash
# 查看前端服务日志
docker-compose logs web

# 查看API服务日志
docker-compose logs api-server
```

## 配置说明

### Dockerfile

- 使用多阶段构建优化镜像大小
- 基于Node.js 18 Alpine版本构建
- 使用Nginx服务静态文件

### Nginx配置

- 配置了单页应用路由重写
- 设置了API反向代理
- 优化了静态资源缓存

### Docker Compose

- web服务：前端应用容器（基于Nginx）
- api-server：Java SpringBoot后端服务容器
- 使用bridge网络实现容器间通信
- 配置数据卷持久化存储

## 环境变量

在生产环境中，需要设置以下环境变量：

```bash
# 前端环境变量
NODE_ENV=production    # 运行环境
API_URL=xxx           # API服务地址

# 后端环境变量
SPRING_PROFILES_ACTIVE=prod  # Spring Boot运行环境
JAVA_OPTS=-Xmx512m -Xms256m # JVM配置
```

## 常见问题

### 1. 端口冲突

如果80端口被占用，可以修改docker-compose.yml中的端口映射：

```yaml
ports:
  - "8080:80"  # 将宿主机8080端口映射到容器80端口
```

### 2. API连接失败

- 检查api-server服务是否正常运行
- 验证nginx.conf中的反向代理配置
- 确认网络连接是否正常

## 维护指南

### 1. 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动服务
docker-compose up --build -d
```

### 2. 清理资源

```bash
# 停止并删除容器
docker-compose down

# 清理未使用的镜像
docker image prune -f
```

### 3. 查看容器状态

```bash
docker-compose ps
```

## 安全建议

1. 使用环境变量管理敏感信息
2. 定期更新依赖包和Docker镜像
3. 限制容器资源使用
4. 配置适当的日志轮转
5. 使用非root用户运行容器

## 性能优化

1. 启用Nginx Gzip压缩
2. 配置合理的缓存策略
3. 优化Docker镜像大小
4. 使用多阶段构建
5. 合理配置容器资源限制

## 备份策略

1. 定期备份数据卷
2. 保存Docker镜像到私有仓库
3. 记录配置文件变更

## 监控方案

1. 使用Docker stats监控容器资源使用
2. 配置健康检查
3. 设置告警机制

## 参考资源

- [Docker官方文档](https://docs.docker.com/)
- [Nginx配置指南](https://nginx.org/en/docs/)
- [Docker Compose文档](https://docs.docker.com/compose/)