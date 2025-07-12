# Titan | 素材协作平台 MVP 产品需求文档 v1.0

## 📋 产品概览

- **项目代号**: Titan | 素材协作平台 MVP v1.0
- **产品定位**: 轻量级素材管理与协作平台
- **技术栈**: Next.js + NestJS + MikroORM + shadcn/ui + WebDAV
- **核心价值**: 阿里云盘集成 + 项目素材管理 + 团队协作
- **目标用户**: 内容创作者、设计团队、小型工作室

## 🎯 产品愿景与目标

### 产品愿景

构建一个简单易用的素材协作平台，让团队能够高效管理云端素材，组织项目资源，促进创作协作。

### 核心目标

1. **素材管理**: 通过WebDAV连接阿里云盘，统一管理云端素材文件
2. **项目组织**: 创建项目空间，关联相关素材，便于分类管理
3. **团队协作**: 支持用户认证和权限管理，为团队协作打基础
4. **简单易用**: MVP版本专注核心功能，界面简洁直观

## 👥 用户画像与使用场景

### 主要用户群体

**内容创作者**

- 需要管理大量素材文件（图片、音频、视频）
- 希望能够快速找到和组织创作素材
- 需要在不同项目间灵活切换和管理资源

**设计团队**

- 团队成员需要共享设计素材和项目文件
- 需要按项目维度组织设计资源
- 希望能够追踪项目进展和素材使用情况

### 核心使用场景

**场景1: 素材导入与管理**
用户连接阿里云盘账户，浏览云端文件，将需要的素材导入到项目中进行统一管理。

**场景2: 项目创建与组织**
用户创建新项目，设置项目信息，将相关素材添加到项目中，形成有序的项目资源库。

**场景3: 素材查找与使用**
用户在项目中快速查找所需素材，查看文件详情，下载或在线预览。

## 🏗️ 功能架构

### v1.0 核心功能模块

#### 1. 用户认证模块 (已实现 ✅)

- **用户注册/登录**: 邮箱验证、JWT令牌认证
- **安全防护**: 限流保护、密码加密存储
- **会话管理**: Token刷新、安全登出

#### 2. 阿里云盘集成模块 (已实现 ✅)

- **WebDAV连接**: 配置阿里云盘WebDAV账户信息
- **文件浏览**: 浏览云盘目录结构，支持文件夹导航
- **文件操作**: 上传、下载、删除、移动、复制文件
- **安全存储**: 加密存储WebDAV凭据

#### 3. 项目管理模块 (已实现 ✅)

- **项目CRUD**: 创建、查看、编辑、删除项目
- **项目信息**: 项目名称、描述、颜色标识
- **权限控制**: 用户只能操作自己的项目
- **访问记录**: 跟踪项目最后访问时间

#### 4. 素材管理模块 (已实现 ✅)

- **素材关联**: 将阿里云盘文件添加到项目中
- **素材信息**: 文件名、路径、类型、大小、创建时间
- **素材操作**: 添加、移除项目素材
- **元数据存储**: 支持自定义描述和标签信息

#### 5. 基础界面模块 (部分实现 🔄)

- **仪表板**: 项目概览、统计信息、快速操作 (已实现UI框架)
- **项目详情**: 项目信息展示、素材列表管理 (已实现UI框架)
- **文件浏览器**: 阿里云盘文件浏览界面 (待实现API集成)
- **响应式设计**: 适配不同设备屏幕 (已实现)

## 🔧 技术规范

### 技术栈选型

**后端技术栈**

- **框架**: NestJS (TypeScript)
- **数据库**: PostgreSQL + MikroORM
- **认证**: JWT + bcrypt加密
- **安全**: 全局认证守卫 + 限流保护
- **文件集成**: WebDAV协议

**前端技术栈**

- **框架**: Next.js 15 + App Router
- **UI组件**: shadcn/ui + Tailwind CSS
- **状态管理**: Zustand (用户状态) + React Query (服务器状态)
- **表单验证**: React Hook Form + Zod
- **国际化**: next-intl

**开发工具**

- **Monorepo**: Turborepo
- **包管理**: pnpm
- **代码质量**: XO (ESLint) + Prettier
- **类型安全**: TypeScript严格模式

### 数据模型设计

```typescript
// 用户实体
User {
  id: string
  email: string
  hashedPassword: string
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

// 阿里云盘配置
AliyunDriveConfig {
  id: string
  user: User
  webdavUrl: string
  username: string
  encryptedPassword: string
  displayName?: string
  timeout: number
  basePath: string
  lastSyncAt?: Date
  isActive: boolean
}

// 项目实体
Project {
  id: string
  name: string
  description?: string
  color?: string
  user: User
  materials: ProjectMaterial[]
  isActive: boolean
  lastAccessedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// 项目素材关联
ProjectMaterial {
  id: string
  project: Project
  aliyunFileId: string
  fileName: string
  filePath: string
  fileType?: string
  fileSize?: number
  thumbnailUrl?: string
  fileCreatedAt?: Date
  fileUpdatedAt?: Date
  description?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}
```

### API接口设计

**认证模块**

- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/refresh` - 刷新Token
- `POST /auth/logout` - 用户登出

**阿里云盘模块**

- `POST /aliyun-drive/config` - 创建WebDAV配置
- `GET /aliyun-drive/config` - 获取配置信息
- `PUT /aliyun-drive/config/:id` - 更新配置
- `DELETE /aliyun-drive/config/:id` - 删除配置
- `GET /aliyun-drive/files` - 浏览文件列表
- `POST /aliyun-drive/files/upload` - 上传文件
- `GET /aliyun-drive/files/download` - 下载文件
- `POST /aliyun-drive/directories` - 创建目录
- `DELETE /aliyun-drive/items` - 删除文件/目录
- `POST /aliyun-drive/items/move` - 移动文件
- `POST /aliyun-drive/items/copy` - 复制文件

**项目模块**

- `POST /projects` - 创建项目
- `GET /projects` - 获取项目列表
- `GET /projects/:id` - 获取项目详情
- `PATCH /projects/:id` - 更新项目
- `DELETE /projects/:id` - 删除项目
- `GET /projects/:id/materials` - 获取项目素材
- `POST /projects/:id/materials` - 添加素材
- `DELETE /projects/:id/materials/:materialId` - 移除素材

## 📊 产品指标与验收标准

### 功能验收标准

**用户认证模块**

- ✅ 用户可以成功注册和登录
- ✅ JWT认证正确保护API端点
- ✅ 密码安全加密存储
- ✅ 限流机制有效防护

**阿里云盘集成模块**

- ✅ 用户可以配置WebDAV连接
- ✅ 能够浏览云盘文件和目录
- ✅ 支持文件上传、下载操作
- ✅ WebDAV凭据加密安全存储

**项目管理模块**

- ✅ 用户可以创建、编辑、删除项目
- ✅ 项目信息正确保存和显示
- ✅ 权限控制确保用户只能操作自己的项目
- ✅ 访问时间正确记录

**素材管理模块**

- ✅ 用户可以将云盘文件添加到项目
- ✅ 素材信息正确存储和显示
- ✅ 支持移除项目中的素材
- ✅ 元数据和描述信息正确保存

**前端界面模块**

- 🔄 仪表板正确显示项目统计信息
- 🔄 项目详情页面功能完整
- ❌ 阿里云盘浏览器组件完整可用
- ❌ 前端与后端API完整集成

### 性能指标

- API响应时间 < 500ms (90th percentile)
- 页面加载时间 < 2s
- 文件上传支持 < 100MB
- 并发用户支持 > 50

### 安全指标

- JWT Token有效期管理
- API限流: 60次/分钟
- 密码复杂度要求
- WebDAV凭据AES-256加密

## 🚀 开发里程碑

### Milestone 1: 基础架构完成 ✅

**时间**: Week 1
**状态**: 已完成

- ✅ 数据库设计和迁移
- ✅ 后端模块框架搭建
- ✅ 认证系统实现
- ✅ 基础API端点开发

### Milestone 2: 核心功能实现 ✅

**时间**: Week 2-3  
**状态**: 已完成

- ✅ 阿里云盘WebDAV集成
- ✅ 项目管理完整功能
- ✅ 素材管理业务逻辑
- ✅ 前端页面UI框架

### Milestone 3: 前端集成 🔄

**时间**: Week 4
**状态**: 进行中
**优先级**: P0 - 阻塞发布

- 🔄 API客户端服务层开发
- 🔄 React Query数据获取集成
- ❌ 阿里云盘浏览器组件实现
- ❌ 项目和素材管理页面功能完善

### Milestone 4: 测试发布 ⏰

**时间**: Week 5
**状态**: 待开始
**依赖**: Milestone 3完成

- ❌ 端到端功能测试
- ❌ 性能优化和bug修复
- ❌ 部署配置和上线准备
- ❌ 用户文档编写

## 🎯 v1.0版本范围边界

### 包含功能 ✅

1. 用户注册、登录、认证
2. 阿里云盘WebDAV配置和文件操作
3. 项目创建、管理、删除
4. 素材添加、移除、查看
5. 基础的Web界面和导航
6. 响应式设计支持

### 不包含功能 ❌

1. 多用户协作和权限分享
2. 素材预览和在线编辑
3. 批量操作和自动化
4. 高级搜索和筛选
5. 数据统计和分析
6. 移动端APP
7. 第三方集成 (微信、其他云盘)
8. 智能内容处理功能

### v1.1版本预留

- 智能内容生产和分发功能
- ASMR视频生成和处理
- 微信视频号自动发布
- 模板化内容生产引擎
- 高级协作和权限管理

## 🔍 风险评估与应对

### 技术风险

**风险**: 前端API集成复杂度被低估
**影响**: 可能延迟发布时间
**应对**: 优先完成核心API集成，次要功能可推迟

**风险**: WebDAV性能限制
**影响**: 大文件操作体验较差
**应对**: 实施文件大小限制，优化超时配置

### 产品风险

**风险**: 用户对素材管理需求理解偏差
**影响**: 功能设计不符合实际使用场景
**应对**: 快速迭代，收集早期用户反馈

### 运营风险

**风险**: 阿里云盘API政策变化
**影响**: WebDAV集成可能受影响
**应对**: 监控API稳定性，准备备选方案

## 📝 附录

### 变更记录

- v1.0.0 (2024-07-11): 初始版本，基于实际代码实现状态编写
- 修正了技术栈描述 (shadcn/ui 替代 PrimeReact)
- 明确了WebDAV集成方案
- 更新了功能完成状态和开发里程碑

### 参考文档

- [后端开发清单 v1.0](../development/v1.0/backend-development.md)
- [前端开发清单 v1.0](../development/v1.0/frontend-development.md)
- [技术架构文档](../development/v1.0/architecture.md)
- [API接口文档](../development/v1.0/api-specification.md)

---

_本文档定义了Titan素材协作平台MVP v1.0的完整产品需求，为开发团队提供明确的功能边界和验收标准。_
