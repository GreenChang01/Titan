# Titan | 素材协作平台 MVP 开发清单

基于项目经理提供的技术实现文档，保持现有技术栈（MikroORM + PrimeReact），专注于新功能开发。

## 📋 项目概览
- **项目代号**: Titan | 素材协作平台 MVP
- **技术栈**: Next.js + NestJS + MikroORM + PrimeReact（保持现有）
- **核心功能**: 阿里云盘集成 + 项目素材管理
- **开发模式**: 渐进式功能添加，最小化架构变更

---

## 🏗️ 后端开发清单

### Phase 1: 数据库架构扩展
- [ ] **数据库 Schema 设计**
  - [ ] 创建 `AliyunDriveConfig` 实体（MikroORM）
  - [ ] 创建 `Project` 实体（MikroORM）
  - [ ] 创建 `ProjectMaterial` 实体（MikroORM）
  - [ ] 设计实体间关系（User -> Projects -> Materials）
  - [ ] 创建数据库迁移脚本

- [ ] **环境配置更新**
  - [ ] 添加 `ENCRYPTION_KEY` 环境变量（32位字符串）
  - [ ] 添加阿里云盘 API 相关配置
  - [ ] 更新 `.env.example` 文件

### Phase 2: 阿里云盘集成模块
- [ ] **AliyunDriveModule 创建**
  - [ ] `aliyun-drive.controller.ts`
    - [ ] `POST /aliyun-drive/config` - 保存 refresh_token
    - [ ] `GET /aliyun-drive/config` - 检查配置状态
    - [ ] `GET /aliyun-drive/files` - 获取文件列表
  - [ ] `aliyun-drive.service.ts`
    - [ ] `saveConfig()` - 加密存储 refresh_token
    - [ ] `getFiles()` - 调用阿里云盘 API 获取文件
    - [ ] `refreshToken()` - 处理 token 刷新
  - [ ] DTOs 定义
    - [ ] `SaveConfigDto`
    - [ ] `ListFilesDto`
    - [ ] `DriveFileDto`

- [ ] **安全加密服务**
  - [ ] 实现 AES-256 加密/解密功能
  - [ ] 集成到现有 `CryptoService` 或创建新服务
  - [ ] 错误处理和异常管理

### Phase 3: 项目管理模块
- [ ] **ProjectModule 创建**
  - [ ] `project.controller.ts`
    - [ ] `POST /projects` - 创建项目
    - [ ] `GET /projects` - 获取用户项目列表
    - [ ] `GET /projects/:id` - 获取项目详情
    - [ ] `PATCH /projects/:id` - 更新项目
    - [ ] `DELETE /projects/:id` - 删除项目
    - [ ] `POST /projects/:id/materials` - 添加素材
    - [ ] `DELETE /projects/:id/materials/:materialId` - 移除素材
  - [ ] `project.service.ts`
    - [ ] 项目 CRUD 操作
    - [ ] 素材关联/解除关联业务逻辑
    - [ ] 权限验证（确保用户只能操作自己的项目）
  - [ ] DTOs 定义
    - [ ] `CreateProjectDto`
    - [ ] `UpdateProjectDto`
    - [ ] `AddMaterialDto`

### Phase 4: 认证系统扩展
- [ ] **用户模块更新**
  - [ ] 更新 `User` 实体以支持阿里云盘配置关联
  - [ ] 添加用户配置状态检查接口
  - [ ] 更新现有 JWT 策略以支持新的权限验证

---

## 📦 共享包更新

### Phase 1: 类型定义
- [ ] **新增类型定义**
  - [ ] `AliyunDriveConfig` 相关类型
  - [ ] `Project` 相关类型
  - [ ] `ProjectMaterial` 相关类型
  - [ ] API 响应类型定义

- [ ] **DTOs 同步**
  - [ ] 确保前后端 DTOs 一致
  - [ ] 添加验证装饰器
  - [ ] 更新导出索引

---

## 🔧 配置和部署

### Phase 1: 环境配置
- [ ] **环境变量**
  - [ ] 后端：`DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`
  - [ ] 前端：`NEXT_PUBLIC_API_URL`
  - [ ] 阿里云盘 API 相关配置

- [ ] **数据库迁移**
  - [ ] 创建新实体的迁移脚本
  - [ ] 测试迁移的回滚功能
  - [ ] 生产环境迁移计划

### Phase 2: 测试和文档
- [ ] **单元测试**
  - [ ] 后端服务测试
  - [ ] 前端组件测试
  - [ ] API 集成测试

- [ ] **文档更新**
  - [ ] 更新 API 文档
  - [ ] 更新开发指南
  - [ ] 用户使用手册

---

## 🎯 开发优先级

### 高优先级 (P0)
1. 数据库架构扩展
2. 阿里云盘集成模块
3. 基本的项目管理功能
4. 核心页面和组件

### 中优先级 (P1)
1. 用户体验优化
2. 错误处理和边界情况
3. 性能优化
4. 基础测试覆盖

### 低优先级 (P2)
1. 高级功能（搜索、过滤、排序）
2. 完整的测试覆盖
3. 文档完善
4. 部署优化

---

## 🚀 里程碑计划

### Milestone 1: 基础架构 (Week 1)
- [ ] 数据库架构设计和迁移
- [ ] 基本的后端模块框架
- [ ] 前端页面结构创建

### Milestone 2: 核心功能 (Week 2-3)
- [ ] 阿里云盘集成完成
- [ ] 项目管理基本功能
- [ ] 前端核心组件开发

### Milestone 3: 集成测试 (Week 4)
- [ ] 前后端集成
- [ ] 功能测试和 bug 修复
- [ ] 用户体验优化

### Milestone 4: 发布准备 (Week 5)
- [ ] 生产环境配置
- [ ] 文档完善
- [ ] 发布部署

---

## 📝 注意事项

### 技术约束
- 保持现有技术栈不变（MikroORM + PrimeReact）
- 最小化对现有代码的影响
- 优先考虑功能实现，后续优化性能

### 安全考虑
- 阿里云盘 refresh_token 必须加密存储
- 实施适当的权限验证
- 防止 SQL 注入和 XSS 攻击

### 性能考虑
- 阿里云盘 API 调用频率限制
- 前端组件的懒加载
- 数据库查询优化

---

*本清单基于项目经理提供的技术实现文档创建，并已根据保持现有技术栈的决策进行调整。*