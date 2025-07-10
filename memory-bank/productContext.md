# Product Context

## 项目概述

**项目代号**: Titan | 素材协作平台 MVP  
**当前状态**: 基础认证系统已完成，需要迁移到新的素材协作平台架构

## 项目目标

构建一个最小可用的素材协作平台。用户可以：

- 登录系统
- 关联自己的阿里云盘
- 创建项目
- 将网盘中的文件/文件夹作为素材链接到项目中
- 实现统一管理和查阅

## 关键功能

- **用户认证系统**: 基于 Supabase Auth + NestJS JWT
- **阿里云盘集成**: 通过 WebDAV 或直接 API 调用
- **项目管理**: 创建、编辑、删除项目
- **素材管理**: 从云盘链接文件/文件夹到项目
- **统一查阅**: 项目维度的素材浏览和管理

## 整体架构

- **Monorepo管理**: Turborepo
- **前端框架**: Next.js (App Router)
- **后端框架**: NestJS
- **数据库**: 迁移到 Supabase (Postgres)
- **用户认证**: Supabase Auth
- **UI组件库**: 迁移到 Shadcn UI (基于 Tailwind CSS)
- **ORM**: 迁移到 Prisma
- **核心集成**: 阿里云盘开放平台 API

## 技术栈架构

### 保持现有技术栈 (减少修改规模)

- Backend: NestJS + MikroORM + PostgreSQL (保持不变)
- Frontend: Next.js + PrimeReact + Tailwind CSS (保持不变)
- Shared: TypeScript types + class-validator (保持不变)
- 新增: 阿里云盘 API 集成模块

### 迁移方案 (已决定暂不实施)

- ~~数据库迁移: MikroORM -> Prisma~~ (暂不迁移)
- ~~UI库迁移: PrimeReact -> Shadcn UI~~ (暂不迁移)
- ~~认证迁移: 当前JWT -> Supabase Auth~~ (暂不迁移)

## 核心模块设计

### 后端模块

1. **AuthModule**: 用户认证 (基于 Supabase Auth)
2. **UserModule**: 用户信息管理
3. **AliyunDriveModule**: 阿里云盘集成
4. **ProjectModule**: 项目管理
5. **ProjectMaterialModule**: 项目素材关联

### 前端页面

1. **认证页面**: 登录/注册
2. **Dashboard**: 项目列表
3. **项目详情**: 素材管理
4. **设置页面**: 阿里云盘配置
