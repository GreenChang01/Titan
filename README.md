<div align="center">
  <h1>🚀 Titan</h1>
  <p><strong>智能ASMR内容生产与分发平台</strong></p>
  <p>AI驱动的专业ASMR音频制作工具，从素材管理到多平台分发的一站式解决方案</p>
  
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
      <img src="https://img.shields.io/badge/Node.js-24+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
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
    <a href="https://elevenlabs.io/">
      <img src="https://img.shields.io/badge/ElevenLabs-AI%20Voice-FF6B35?style=for-the-badge" alt="ElevenLabs">
    </a>
    <a href="https://soundverse.ai/">
      <img src="https://img.shields.io/badge/Soundverse-AI%20Audio-9D4EDD?style=for-the-badge" alt="Soundverse">
    </a>
  </p>
  
  <p>
    <a href="#快速开始">快速开始</a> •
    <a href="#核心功能">核心功能</a> •
    <a href="#asmr音频制作">ASMR音频制作</a> •
    <a href="#系统架构">系统架构</a> •
    <a href="#api文档">API文档</a> •
    <a href="#参与贡献">参与贡献</a> •
    <a href="#开源协议">开源协议</a>
  </p>
</div>

---

## ✨ 核心功能

### 🎵 **AI ASMR音频生产**

- **ElevenLabs语音合成**：高质量AI语音生成，支持多种音色和风格
- **Soundverse音景制作**：AI驱动的ASMR背景音效和音景生成
- **FFmpeg音频处理**：专业级音频混合、降噪和后期处理
- **批量内容生产**：支持大规模ASMR内容的自动化生产流程

### 📚 **智能内容管理**

- **ASMR素材库**：专门针对ASMR内容的素材分类和管理
- **模板系统**：预设ASMR内容模板，支持快速内容创建
- **标签体系**：丰富的ASMR标签系统（放松、睡眠、冥想等）
- **版本控制**：音频内容的版本管理和历史记录

### 🔗 **云存储集成**

- **阿里云盘支持**：无缝连接和管理阿里云盘文件
- **安全令牌管理**：AES-256 加密存储凭证信息
- **实时同步**：自动与云存储保持同步
- **大文件处理**：优化的音频文件上传和下载体验

### 📱 **多平台分发**

- **微信公众号**：一键发布到微信公众号平台
- **音频平台集成**：支持多个音频分发平台
- **定时发布**：支持内容的定时发布和调度
- **发布记录**：完整的发布历史和状态跟踪

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

- **Node.js 24+**
- **PostgreSQL 12+**
- **FFmpeg**（音频处理）
- **Docker**（可选，用于容器化数据库）
- **Redis**（可选，用于队列和缓存）

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/titan.git
cd titan
```

### 2. 安装依赖

```bash
# 安装根目录依赖
pnpm install

# 构建共享包
cd packages/titan-shared
pnpm run build
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
pnpm run start:dev:infra

# 运行数据库迁移
pnpm run migration:up
```

### 5. 启动开发服务器

```bash
# 从根目录启动
pnpm run start:dev
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

## 🎵 ASMR音频制作

### 工作流程

```
文本素材 → AI语音合成 → 音景生成 → 音频混合 → 后期处理 → 发布分发
   ↓           ↓           ↓          ↓         ↓         ↓
素材库     ElevenLabs  Soundverse   FFmpeg   质量检测   多平台
```

### 核心组件

#### 🎤 AI语音合成 (ElevenLabs)

- 支持多种音色和语言
- 自然流畅的语音生成
- 可调节语速、音调和情感
- 支持SSML标记语言

#### 🌊 AI音景生成 (Soundverse)

- 自然环境音效（雨声、海浪、森林等）
- 可定制音景参数
- 支持多层音效混合
- 实时音效生成

#### 🔧 专业音频处理 (FFmpeg)

- 多轨音频混合
- 音频格式转换
- 降噪和音质优化
- 动态范围控制

### 使用示例

```typescript
// 创建ASMR内容任务
const job = await fetch('/api/content-jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    type: 'ASMR_AUDIO_GENERATION',
    content: {
      text: '欢迎来到放松时光，让我们一起进入宁静的世界...',
      voiceId: 'soothing-female',
      backgroundSound: 'rain-forest',
      duration: 600, // 10分钟
    },
  }),
});
```

---

## 🔧 环境配置

### 后端配置

```typescript
// apps/nestjs-backend/.env
DATABASE_URL = 'postgresql://username:password@localhost:5432/titan';
JWT_SECRET = 'your-super-secret-jwt-key';
JWT_REFRESH_SECRET = 'your-refresh-secret-key';
ENCRYPTION_KEY = 'your-32-character-encryption-key';

// 邮件配置
SMTP_HOST = 'smtp.gmail.com';
SMTP_PORT = 587;
SMTP_USER = 'your-email@gmail.com';
SMTP_PASS = 'your-app-password';

// AI服务配置
ELEVENLABS_API_KEY = 'your-elevenlabs-api-key';
SOUNDVERSE_API_KEY = 'your-soundverse-api-key';

// 文件存储配置
UPLOAD_PATH = './uploads';
MAX_FILE_SIZE = '100MB';

// 队列配置 (可选)
REDIS_URL = 'redis://localhost:6379';
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

### 素材管理接口

| 方法   | 接口          | 描述         |
| ------ | ------------- | ------------ |
| GET    | `/assets`     | 获取素材列表 |
| POST   | `/assets`     | 上传新素材   |
| GET    | `/assets/:id` | 获取素材详情 |
| PATCH  | `/assets/:id` | 更新素材信息 |
| DELETE | `/assets/:id` | 删除素材     |

### ASMR内容生产接口

| 方法   | 接口                       | 描述               |
| ------ | -------------------------- | ------------------ |
| POST   | `/content-jobs`            | 创建内容生产任务   |
| GET    | `/content-jobs`            | 获取任务列表       |
| GET    | `/content-jobs/:id`        | 获取任务详情和状态 |
| DELETE | `/content-jobs/:id`        | 取消任务           |
| GET    | `/content-jobs/:id/result` | 获取生成的音频文件 |

### 模板管理接口

| 方法   | 接口             | 描述         |
| ------ | ---------------- | ------------ |
| GET    | `/templates`     | 获取模板列表 |
| POST   | `/templates`     | 创建新模板   |
| GET    | `/templates/:id` | 获取模板详情 |
| PATCH  | `/templates/:id` | 更新模板     |
| DELETE | `/templates/:id` | 删除模板     |

### 发布管理接口

| 方法 | 接口                      | 描述           |
| ---- | ------------------------- | -------------- |
| POST | `/publications`           | 创建发布任务   |
| GET  | `/publications`           | 获取发布历史   |
| GET  | `/publications/:id`       | 获取发布详情   |
| POST | `/publications/:id/retry` | 重试失败的发布 |

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
pnpm run start:dev          # 启动前后端
pnpm run start:dev:frontend # 仅启动前端
pnpm run start:dev:backend  # 仅启动后端

# 构建
pnpm run build             # 构建所有包
pnpm run build:frontend    # 仅构建前端
pnpm run build:backend     # 仅构建后端

# 测试
pnpm run test:unit         # 运行单元测试
pnpm run test:e2e          # 运行端到端测试
pnpm run test:unit:cov     # 生成覆盖率报告

# 代码质量
pnpm run lint             # 检查代码规范
pnpm run lint:fix         # 修复代码规范问题
pnpm run format           # 格式化代码
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
│   │   │   ├── asset/           # 素材管理
│   │   │   ├── ai-audio/        # AI音频生产模块
│   │   │   │   ├── providers/   # ElevenLabs & Soundverse
│   │   │   │   └── services/    # 音频处理服务
│   │   │   ├── content-job/     # 内容生产任务
│   │   │   ├── template/        # 模板管理
│   │   │   ├── publication/     # 发布管理
│   │   │   └── schedule/        # 定时调度
│   │   └── migrations/          # 数据库迁移
│   └── nextjs-frontend/         # Next.js 前端应用
│       ├── src/
│       │   ├── app/[locale]/    # 国际化路由页面
│       │   ├── components/      # 可复用组件
│       │   │   ├── ui/          # Shadcn/ui 基础组件
│       │   │   ├── aliyun-drive/ # 阿里云盘组件
│       │   │   ├── project/     # 项目管理组件
│       │   │   ├── asset/       # 素材管理组件
│       │   │   ├── audio/       # 音频相关组件
│       │   │   └── layout/      # 布局组件
│       │   ├── hooks/           # React Hooks
│       │   ├── store/           # Zustand 状态管理
│       │   └── lib/             # 工具函数
├── packages/
│   └── titan-shared/            # 共享 TypeScript 类型
│       ├── src/
│       │   ├── types/           # 通用类型
│       │   │   ├── asmr.ts      # ASMR相关类型
│       │   │   ├── audio.ts     # 音频相关类型
│       │   │   └── content.ts   # 内容相关类型
│       │   └── dto/             # 数据传输对象
├── development/                 # 开发文档
│   ├── v1.0/                   # V1.0 版本开发文档
│   └── v1.1/                   # V1.1 版本开发文档
│       └── poc-scripts/        # 概念验证脚本
├── requirements/               # 需求文档
│   ├── PRD-v1.0.md            # V1.0 产品需求文档
│   ├── PRD-v1.1.md            # V1.1 产品需求文档
│   └── change-requests/        # 变更请求
└── docs/                       # 项目文档
```

---

## 🧪 测试

### 单元测试

```bash
# 运行所有单元测试
pnpm run test:unit

# 运行测试并生成覆盖率
pnpm run test:unit:cov

# 监视模式运行测试
pnpm run test:watch
```

### 端到端测试

```bash
# 运行 E2E 测试
pnpm run test:e2e

# 带 UI 界面运行 E2E 测试
pnpm run test:e2e:ui
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
- [ElevenLabs](https://elevenlabs.io/) - AI语音合成服务
- [Soundverse](https://soundverse.ai/) - AI音效生成服务
- [FFmpeg](https://ffmpeg.org/) - 多媒体处理框架

---

<div align="center">
  <p>用 ❤️ 由 Titan 团队制作</p>
  <p>
    <a href="https://github.com/yourusername/titan/stargazers">⭐ 在 GitHub 上给我们点星</a> •
    <a href="https://github.com/yourusername/titan/issues">🐛 报告问题</a> •
    <a href="https://github.com/yourusername/titan/issues">💡 功能建议</a>
  </p>
</div>
