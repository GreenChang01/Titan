# 系统模式

## 架构模式

### 1. Monorepo架构

- **工具**: Turborepo
- **结构**: apps/ + packages/
- **管理**: pnpm workspace
- **优势**: 代码共享、统一构建、依赖管理

### 2. 模块化后端架构

- **框架**: NestJS
- **模式**: 模块化架构 (Module-based)
- **特性**:
  - 每个功能独立模块
  - 全局守卫和过滤器
  - 依赖注入

### 3. 全栈类型安全

- **共享包**: packages/shared
- **类型定义**: TypeScript interfaces + DTOs
- **验证**: class-validator + class-transformer

## 配置模式

### 1. 环境配置

- **验证**: Joi schema validation
- **加载**: ConfigModule.forRoot()
- **访问**: 全局ConfigService
- **安全**: 环境变量隔离

### 2. 数据库配置

- **ORM**: MikroORM
- **迁移**: 基于迁移的数据库管理
- **连接**: 连接池管理

## 认证模式

### 1. JWT认证

- **策略**: Access + Refresh Token
- **存储**: Zustand (前端) + HTTP-only Cookie
- **验证**: 全局JWT守卫
- **刷新**: 自动token刷新机制

### 2. 权限控制

- **守卫**: 基于角色的访问控制
- **装饰器**: 自定义权限装饰器
- **中间件**: 全局认证中间件

## 开发模式

### 1. 热重载开发

- **后端**: Nodemon + TypeScript编译
- **前端**: Next.js Fast Refresh
- **共享**: TSC watch模式

### 2. 数据库开发

- **迁移**: 版本控制的数据库结构
- **种子**: 开发数据填充
- **测试**: 内存数据库测试

[2025-01-11 15:55:19] - 初始化系统模式文档
