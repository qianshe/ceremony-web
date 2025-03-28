# 乡镇红白事一站式服务平台

基于Vue 3和Element Plus构建的乡镇红白事一站式服务平台管理系统，提供红白喜事服务流程管理、商品管理、订单管理等功能。

## 项目特性

- 💯 基于Vue 3和Element Plus的现代化前端框架
- 🎨 简约传统中国风格设计，提升用户体验
- 📱 响应式设计，兼容PC和移动端访问
- 🔒 支持权限管理和登录验证
- 📦 模块化设计，易于扩展和维护

## 项目预览

### 登录页面
![登录页面](./docs/images/login.png)

### 控制台
![控制台](./docs/images/dashboard.png)

### 订单管理
![订单管理](./docs/images/order.png)

## 快速开始

### 环境要求

- Node.js 14.0+
- npm 6.0+

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
├── public              # 静态资源目录
├── src                 # 源代码目录
│   ├── api             # API接口
│   ├── assets          # 资源文件
│   │   └── images      # 图片资源
│   ├── components      # 公共组件
│   ├── router          # 路由配置
│   ├── styles          # 样式文件
│   ├── views           # 页面组件
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── .gitignore          # Git忽略文件
├── index.html          # HTML入口文件
├── package.json        # 项目依赖
└── README.md           # 项目说明
```

## 功能模块

1. **账户管理**：用户登录、权限控制
2. **商品管理**：红事/白事商品的添加、编辑、删除、库存管理
3. **流程管理**：红事/白事流程步骤的配置和商品关联
4. **订单管理**：订单处理、状态更新、订单详情查看
5. **用户管理**：平台用户的管理和权限分配
6. **统计分析**：数据可视化展示、销售趋势分析、商品销量排行统计

## 未来计划

- 支持多语言配置
- 数据导出功能
- 增加数据统计和分析图表 (已完成 ✅)
- 与小程序和移动端App联动

## 技术栈

- Vue 3：前端框架
- Vue Router：路由管理
- Pinia：状态管理
- Element Plus：UI组件库
- Axios：HTTP请求
- Vite：构建工具

## 贡献指南

欢迎贡献代码，请先Fork本仓库，然后提交Pull Request。

## 许可协议

[MIT](./LICENSE) 