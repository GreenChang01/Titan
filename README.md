<div align="center">
  <h1>🚀 Titan</h1>
  <p><strong>专业级素材协作平台</strong></p>
  <p>无缝整合云存储与项目管理，为团队协作赋能</p>
  
  <p>
    <a href="https://github.com/yourusername/titan/stargazers">
      <img src="https://img.shields.io/github/stars/yourusername/titan?style=for-the-badge&logo=github" alt="GitHub Stars">
    </a>
    <a href="https://github.com/yourusername/titan/network/members">
      <img src="https://img.shields.io/github/forks/yourusername/titan?style=for-the-badge&logo=github" alt="GitHub Forks">
    </a>
    <a href="https://github.com/yourusername/titan/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/yourusername/titan?style=for-the-badge" alt="License">
    </a>
    <a href="https://github.com/yourusername/titan/issues">
      <img src="https://img.shields.io/github/issues/yourusername/titan?style=for-the-badge" alt="Issues">
    </a>
  </p>
  
  <p>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    </a>
    <a href="https://nextjs.org/">
      <img src="https://img.shields.io/badge/Next.js-15+-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
    </a>
    <a href="https://nestjs.com/">
      <img src="https://img.shields.io/badge/NestJS-10+-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
    </a>
  </p>
  
  <p>
    <a href="#快速开始">快速开始</a> •
    <a href="#核心功能">核心功能</a> •
    <a href="#系统架构">系统架构</a> •
    <a href="#api文档">API文档</a> •
    <a href="#参与贡献">参与贡献</a> •
    <a href="#开源协议">开源协议</a>
  </p>
</div>

---

## ✨ 核心功能

### 🔗 **云存储集成**

- **阿里云盘支持**：无缝连接和管理阿里云盘文件
- **安全令牌管理**：AES-256 加密存储凭证信息
- **实时同步**：自动与云存储保持同步

### 📂 **项目管理**

- **直观仪表板**：简洁现代的项目管理界面
- **素材组织**：智能分类和标签系统
- **团队协作**：多用户项目访问和权限管理

### 🔐 **企业级安全**

- **JWT 认证**：安全的基于令牌的身份验证
- **基于角色的访问控制**：细粒度权限系统
- **数据加密**：端到端敏感数据加密

### 🎨 **现代化 UI/UX**

- **响应式设计**：完美适配所有设备
- **Shadcn/ui 组件**：基于 Radix UI 的现代组件库
- **深色/浅色主题**：可自定义的主题系统
- **国际化支持**：中英文双语界面
- **无障碍访问**：符合 WCAG 标准的可访问性设计

### 🚀 **开发者体验**

- **Turborepo 单体仓库**：高效的工作空间管理
- **类型安全**：全栈 TypeScript 支持
- **热重载**：闪电般的开发体验
- **全面测试**：单元、集成和端到端测试

---

## 📋 目录导航

- [快速开始](#快速开始)
- [核心功能](#核心功能)
- [系统架构](#系统架构)
- [安装部署](#安装部署)
- [环境配置](#环境配置)
- [使用指南](#使用指南)
- [API文档](#api文档)
- [开发指南](#开发指南)
- [测试](#测试)
- [部署](#部署)
- [参与贡献](#参与贡献)
- [开源协议](#开源协议)

---

## 🚀 快速开始

### 环境要求

- **Node.js 18+**
- **PostgreSQL 12+**
- **Docker**（可选，用于容器化数据库）

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/titan.git
cd titan
```

### 2. 安装依赖

```bash
# 安装根目录依赖
npm install

# 构建共享包
cd packages/titan-shared
npm run build
cd ../..
```

### 3. 环境配置

```bash
# 后端环境配置
cp apps/nestjs-backend/.env.example apps/nestjs-backend/.env

# 前端环境配置
cp apps/nextjs-frontend/.env.example apps/nextjs-frontend/.env
```

### 4. 数据库设置

```bash
cd apps/nestjs-backend

# 启动 PostgreSQL（Docker）
npm run start:dev:infra

# 运行数据库迁移
npm run migration:up
```

### 5. 启动开发服务器

```bash
# 从根目录启动
npm run start:dev
```

🎉 **完成！** 你的应用现在已经运行在：

- **前端**：http://localhost:3000
- **后端**：http://localhost:3001

---

## 🏗️ 系统架构

### 架构总览

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     前端        │    │     后端        │    │     数据库      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│  (PostgreSQL)   │
│   端口: 3000    │    │   端口: 3001    │    │   端口: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│    共享类型     │    │    阿里云盘     │
│  (TypeScript)   │    │     集成        │
└─────────────────┘    └─────────────────┘
```

### 🖥️ 前端架构

- **框架**：Next.js 15 + App Router
- **状态管理**：Zustand + React Query (TanStack Query)
- **样式**：Tailwind CSS + Shadcn/ui 组件
- **表单**：React Hook Form + Zod 验证
- **国际化**：next-intl
- **路由**：国际化路由 (中英文支持)

### 🛠️ 后端架构

- **框架**：NestJS + TypeScript
- **数据库**：MikroORM + PostgreSQL
- **认证**：JWT + 刷新令牌
- **验证**：class-validator
- **邮件**：Handlebars 模板邮件服务

### 📦 共享包

- **类型安全**：前后端共享的 TypeScript 类型和 DTOs
- **数据验证**：通用验证模式
- **API 合约**：类型安全的 API 接口
- **包名**：titan-shared (独立版本管理)

---

## 🔧 环境配置

### 后端配置

```typescript
// apps/nestjs-backend/.env
DATABASE_URL = 'postgresql://username:password@localhost:5432/titan';
JWT_SECRET = 'your-super-secret-jwt-key';
JWT_REFRESH_SECRET = 'your-refresh-secret-key';
ENCRYPTION_KEY = 'your-32-character-encryption-key';
SMTP_HOST = 'smtp.gmail.com';
SMTP_PORT = 587;
SMTP_USER = 'your-email@gmail.com';
SMTP_PASS = 'your-app-password';
```

### 前端配置

```typescript
// apps/nextjs-frontend/.env
NEXT_PUBLIC_API_URL = 'http://localhost:3001';
NEXT_PUBLIC_APP_NAME = 'Titan';
```

---

## 💡 使用指南

### 1. 用户认证

```typescript
// 注册新用户
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123',
    firstName: '张',
    lastName: '三',
  }),
});
```

### 2. 阿里云盘集成

```typescript
// 配置阿里云盘连接
const configResponse = await fetch('/api/aliyun-drive/config', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    refreshToken: 'your-aliyun-refresh-token',
  }),
});
```

### 3. 项目管理

```typescript
// 创建新项目
const project = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    name: '我的项目',
    description: '项目描述',
  }),
});
```

---

## 📚 API文档

### 认证接口

| 方法 | 接口             | 描述         |
| ---- | ---------------- | ------------ |
| POST | `/auth/register` | 用户注册     |
| POST | `/auth/login`    | 用户登录     |
| POST | `/auth/refresh`  | 刷新访问令牌 |
| POST | `/auth/logout`   | 用户登出     |

### 项目管理接口

| 方法   | 接口            | 描述             |
| ------ | --------------- | ---------------- |
| GET    | `/projects`     | 获取用户项目列表 |
| POST   | `/projects`     | 创建新项目       |
| GET    | `/projects/:id` | 获取项目详情     |
| PATCH  | `/projects/:id` | 更新项目         |
| DELETE | `/projects/:id` | 删除项目         |

### 阿里云盘接口

| 方法 | 接口                   | 描述         |
| ---- | ---------------------- | ------------ |
| POST | `/aliyun-drive/config` | 配置阿里云盘 |
| GET  | `/aliyun-drive/config` | 获取配置状态 |
| GET  | `/aliyun-drive/files`  | 获取文件列表 |

---

## 🔨 开发指南

### 可用脚本

```bash
# 开发模式
npm run start:dev          # 启动前后端
npm run start:dev:frontend # 仅启动前端
npm run start:dev:backend  # 仅启动后端

# 构建
npm run build             # 构建所有包
npm run build:frontend    # 仅构建前端
npm run build:backend     # 仅构建后端

# 测试
npm run test:unit         # 运行单元测试
npm run test:e2e          # 运行端到端测试
npm run test:coverage     # 生成覆盖率报告

# 代码质量
npm run lint             # 检查代码规范
npm run lint:fix         # 修复代码规范问题
npm run format           # 格式化代码
```

### 项目结构

```
titan/
├── apps/
│   ├── nestjs-backend/          # NestJS 后端应用
│   │   ├── src/
│   │   │   ├── auth/            # 认证模块
│   │   │   ├── users/           # 用户管理
│   │   │   ├── aliyun-drive/    # 阿里云盘集成
│   │   │   ├── project/         # 项目管理
│   │   │   └── project-material/ # 项目素材管理
│   │   └── migrations/          # 数据库迁移
│   └── nextjs-frontend/         # Next.js 前端应用
│       ├── src/
│       │   ├── app/[locale]/    # 国际化路由页面
│       │   ├── components/      # 可复用组件
│       │   │   ├── ui/          # Shadcn/ui 基础组件
│       │   │   ├── aliyun-drive/ # 阿里云盘组件
│       │   │   ├── project/     # 项目管理组件
│       │   │   └── layout/      # 布局组件
│       │   ├── hooks/           # React Hooks
│       │   ├── store/           # Zustand 状态管理
│       │   └── lib/             # 工具函数
├── packages/
│   └── titan-shared/            # 共享 TypeScript 类型
│       ├── src/
│       │   ├── types/           # 通用类型
│       │   └── dto/             # 数据传输对象
└── docs/                        # 文档
```

---

## 🧪 测试

### 单元测试

```bash
# 运行所有单元测试
npm run test:unit

# 运行测试并生成覆盖率
npm run test:coverage

# 监视模式运行测试
npm run test:watch
```

### 端到端测试

```bash
# 运行 E2E 测试
npm run test:e2e

# 带 UI 界面运行 E2E 测试
npm run test:e2e:ui
```

### 测试覆盖率

我们在所有关键组件中保持高测试覆盖率：

- **后端**：90%+ 覆盖率
- **前端**：85%+ 覆盖率
- **共享包**：95%+ 覆盖率

---

## 🚀 部署

### Docker 部署

```bash
# 使用 Docker Compose 构建并运行
docker-compose up --build

# 生产环境部署
docker-compose -f docker-compose.prod.yml up -d
```

### 环境变量

确保在生产环境中设置以下环境变量：

```bash
# 后端
DATABASE_URL=postgresql://...
JWT_SECRET=your-production-secret
ENCRYPTION_KEY=your-production-key

# 前端
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 🤝 参与贡献

我们欢迎所有形式的贡献！请查看我们的 [贡献指南](CONTRIBUTING.md) 了解详情。

### 开发流程

1. **Fork** 项目仓库
2. **创建** 功能分支 (`git checkout -b feature/amazing-feature`)
3. **提交** 你的更改 (`git commit -m 'Add amazing feature'`)
4. **推送** 到分支 (`git push origin feature/amazing-feature`)
5. **创建** Pull Request

### 代码规范

- **ESLint**：使用 XO 进行代码检查
- **Prettier**：代码格式化
- **TypeScript**：启用严格模式
- **约定式提交**：请使用约定式提交信息

---

## 📄 开源协议

本项目采用 MIT 协议 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## ❤️ 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [NestJS](https://nestjs.com/) - Node.js 框架
- [Shadcn/ui](https://ui.shadcn.com/) - 现代化 UI 组件库
- [Radix UI](https://www.radix-ui.com/) - 无障碍 UI 原语
- [MikroORM](https://mikro-orm.io/) - TypeScript ORM
- [Turborepo](https://turbo.build/) - 单体仓库管理
- [TanStack Query](https://tanstack.com/query) - 数据获取和状态管理

---

<div align="center">
  <p>用 ❤️ 由 Titan 团队制作</p>
  <p>
    <a href="https://github.com/yourusername/titan/stargazers">⭐ 在 GitHub 上给我们点星</a> •
    <a href="https://github.com/yourusername/titan/issues">🐛 报告问题</a> •
    <a href="https://github.com/yourusername/titan/issues">💡 功能建议</a>
  </p>
</div>
