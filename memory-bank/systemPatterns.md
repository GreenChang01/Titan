# System Patterns

---
### 现有架构模式
[2025-01-10 16:46:30] - 保持现有项目的成熟架构模式

**Backend 架构模式:**
- **模块化结构**: 每个功能（auth, users, email等）都是独立的 NestJS 模块
- **全局守卫**: 通过 APP_GUARD 全局应用 JWT 认证和限流
- **数据库**: MikroORM + PostgreSQL，基于迁移的 schema 管理
- **邮件服务**: 使用 Handlebars 模板支持多语言邮件
- **数据验证**: DTOs 使用 class-validator，环境配置使用 Joi 验证

**Frontend 架构模式:**
- **App Router**: Next.js 15 + App Router + TypeScript
- **状态管理**: Zustand 管理全局状态，React Query 管理服务器状态
- **样式系统**: Tailwind CSS + PrimeReact 组件
- **国际化**: next-intl 多语言支持
- **认证**: 基于 JWT 的认证，refresh token 存储在 Zustand

**Shared Package 模式:**
- **类型安全**: 前后端共享 TypeScript 类型和 DTOs
- **验证一致性**: 使用 class-validator 和 class-transformer

---
### 新增模块架构模式
[2025-01-10 16:46:30] - 为素材协作平台新增的架构模式

**阿里云盘集成模式:**
- **安全存储**: refresh_token 必须使用 AES-256 加密存储
- **API 抽象**: 封装阿里云盘 API 调用为统一服务接口
- **文件浏览**: 支持目录层级导航和文件列表展示
- **错误处理**: 统一处理 API 调用失败和 token 过期场景

**项目素材管理模式:**
- **关联模型**: 项目与素材的多对多关系管理
- **元数据存储**: 保存阿里云盘文件的关键信息（ID、路径、名称、类型）
- **去重机制**: 同一项目下相同素材只能添加一次
- **级联删除**: 项目删除时自动清理相关素材关联

**前端交互模式:**
- **模态框浏览**: 阿里云盘文件浏览使用模态框实现
- **异步加载**: 使用 React Query 进行数据获取和缓存
- **选择机制**: 支持多选文件/文件夹添加到项目
- **实时同步**: 素材变更实时反映到项目列表