# 产品上下文

## 项目概述

Titan是一个基于Turborepo的全栈认证系统，采用NestJS后端和Next.js前端架构。

## 技术栈

- **后端**: NestJS, JWT认证, MikroORM + PostgreSQL, 邮件模板
- **前端**: Next.js 15 App Router, TypeScript, Tailwind CSS, PrimeReact
- **共享包**: TypeScript类型和DTO

## 项目结构

```
titan/
├── apps/
│   ├── nestjs-backend/     # NestJS后端应用
│   └── nextjs-frontend/    # Next.js前端应用
├── packages/
│   └── shared/            # 共享TypeScript类型和DTO
└── turbo.json             # Turborepo配置
```

## 核心特性

1. JWT认证系统
2. 用户管理和权限控制
3. 邮件模板系统
4. 多语言支持
5. 项目和素材管理
6. 阿里云盘集成

## 开发环境

- 基于pnpm workspace
- 使用Turborepo进行monorepo管理
- PostgreSQL数据库
- Docker容器化支持

## 架构目标

- 模块化设计
- 类型安全
- 可扩展性
- 开发效率
