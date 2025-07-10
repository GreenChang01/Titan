# Decision Log

## 2025-01-10

### [19:10:00] - User实体与AliyunDriveConfig关系优化

**决策**: 将User实体与AliyunDriveConfig的关系从OneToMany修改为OneToOne
**理由**:

- 根据业务需求，每个用户应该只能有一个阿里云盘配置
- 简化数据模型和查询逻辑
- 提高数据一致性和完整性
  **影响**:
- 减少了数据库查询的复杂性
- 简化了配置状态检查逻辑
- 为后续功能扩展提供了更清晰的数据结构

### [19:10:00] - 配置状态检查API设计

**决策**: 创建GET /users/me/config-status端点返回配置状态和活跃状态
**理由**:

- 前端需要知道用户是否已配置阿里云盘服务
- 同时检查配置是否处于活跃状态
- 保护敏感配置信息不被意外暴露
  **影响**:
- 提高了安全性，避免敏感数据泄露
- 简化了前端状态管理逻辑
- 提供了灵活的配置状态查询机制

### [19:10:00] - 认证策略一致性验证

**决策**: 保持现有的JWT认证和@User()装饰器模式，确保所有新控制器正确应用认证
**理由**:

- 保持系统架构的一致性
- 复用已经验证的认证逻辑
- 确保所有API端点都受到适当保护
  **影响**:
- 新功能无缝集成到现有认证体系
- 维护了系统的安全性标准
- 减少了维护复杂度

## Previous Decisions

### [18:30:27] - User实体与AliyunDriveConfig关系设计

**决策**: 在User实体中添加与AliyunDriveConfig的一对一关系
**理由**:

- 每个用户只能有一个阿里云盘配置
- 通过实体关系可以方便地进行联表查询
- 支持配置的可选性（nullable: true）
  **影响**:
- 简化了用户配置状态的查询逻辑
- 为后续功能扩展提供了良好的数据结构基础

### [18:30:27] - 配置状态API设计

**决策**: 创建GET /users/me/config-status端点返回布尔值而非完整配置
**理由**:

- 保护敏感配置信息（如refresh_token）不被意外暴露
- 前端只需要知道是否已配置，无需完整配置详情
- 减少数据传输量
  **影响**:
- 提高了安全性
- 简化了前端状态管理

### [18:30:27] - 认证策略一致性保持

**决策**: 继续使用现有的JWT认证和@User()装饰器模式
**理由**:

- 保持系统架构的一致性
- 复用已经验证的认证逻辑
- 减少维护复杂度
  **影响**:
- 新功能无缝集成到现有认证体系
- 开发团队无需学习新的认证模式

### [10:00:00] - 项目管理功能数据库设计

**决策**: 使用MikroORM实体设计项目管理系统
**理由**:

- 与现有用户系统保持一致的ORM技术栈
- 支持TypeScript，提供良好的类型安全
- 内置迁移管理功能
  **影响**:
- 简化了数据库操作和维护
- 提供了良好的开发体验
- 保持了技术栈的统一性

### [09:30:00] - 阿里云盘配置加密策略

**决策**: 使用AES-256-GCM加密存储敏感配置信息
**理由**:

- refresh_token等敏感信息需要加密保护
- AES-256-GCM提供认证加密，防止篡改
- 平衡安全性和性能需求
  **影响**:
- 提高了数据安全性
- 需要密钥管理策略
- 增加了少量计算开销

### [09:00:00] - 模块化架构决策

**决策**: 为阿里云盘和项目管理创建独立的NestJS模块
**理由**:

- 遵循单一职责原则
- 便于团队协作开发
- 支持模块级别的测试和维护
  **影响**:
- 提高了代码的可维护性
- 清晰的模块边界
- 便于后续功能扩展

---

### 技术栈保持决策

[2025-01-10 16:45:36] - 保持现有技术栈，减少修改规模

**Rationale:**
为了减少项目的修改规模和复杂性，决定保持现有的技术栈：

- 数据库 ORM：继续使用 MikroORM，不迁移到 Prisma
- 前端 UI 库：继续使用 PrimeReact，不迁移到 Shadcn UI

**Implications/Details:**

- 减少了技术栈迁移的风险和工作量
- 开发团队可以更专注于新功能的开发（阿里云盘集成、项目素材管理）
- 保持现有项目的稳定性和一致性
- 新增功能将基于现有技术栈进行开发
- 未来如有必要，可以逐步进行技术栈升级

---

### 内存知识库创建决策

[2025-01-10 16:45:36] - 创建项目内存知识库系统

**Rationale:**
为了更好地管理项目上下文、决策历史和开发进度，创建结构化的内存知识库系统。

**Implications/Details:**

- 提高项目的可维护性和知识传承
- 便于团队成员了解项目背景和决策过程
- 为后续的开发工作提供完整的上下文信息

---

### Database Schema Extension实施决策

[2025-07-10 17:52:00] - 完成数据库架构扩展Phase 1的具体实施方案

**Rationale:**
基于现有MikroORM架构，设计并实现了三个核心实体来支持素材协作平台功能：

- AliyunDriveConfig: 安全存储用户阿里云盘配置
- Project: 项目管理核心实体
- ProjectMaterial: 项目与素材的关联关系

**Details:**

- 使用AES-256加密存储refresh_token确保安全性
- 建立User -> Projects -> Materials的完整关系链
- 实现级联删除和唯一约束保证数据完整性
- 创建完整的NestJS模块架构（Service、Controller、DTO）
- 生成标准化的数据库迁移脚本(Migration20250710094900)
- 保持与现有技术栈的一致性和兼容性

---

### 阿里云盘集成方案重大变更决策

[2025-07-10 18:19:00] - 从直接API集成转向WebDAV挂载方案

**Rationale:**
经过技术调研和用户需求分析，决定放弃原计划的阿里云盘开放平台API直接集成方案，转而采用WebDAV协议挂载方案。主要原因：

1. **技术成熟度**: WebDAV是标准化协议，有现成的成熟解决方案（如alist、aliyundrive-webdav）
2. **开发效率**: 避免直接处理阿里云盘复杂的OAuth和API调用逻辑
3. **维护成本**: WebDAV方案更稳定，不依赖阿里云盘API变更
4. **用户体验**: 用户可以通过熟悉的WebDAV客户端管理文件

**Implementation Details:**

- **环境配置更新**: 从API配置（CLIENT_ID、CLIENT_SECRET、REDIRECT_URI）转为WebDAV配置（WEBDAV_BASE_URL、WEBDAV_USERNAME、WEBDAV_PASSWORD、WEBDAV_TIMEOUT）
- **加密服务增强**: 实现AES-256-GCM加密保护WebDAV凭据，确保安全性
- **数据模型重构**: AliyunDriveConfig实体从API字段（refreshToken、driveId、userName、nickName）转为WebDAV字段（webdavUrl、username、encryptedPassword、displayName、timeout、basePath）
- **服务层重写**: AliyunDriveService完全重写，实现WebDAV客户端功能（文件列表、上传下载、目录操作、文件移动复制等）
- **API端点更新**: AliyunDriveController提供完整的WebDAV文件操作REST API
- **数据库迁移**: 创建Migration20250710181900迁移脚本，将数据库表结构从API方案迁移到WebDAV方案

**Technical Benefits:**

- 更好的文件系统抽象，支持标准文件操作
- 减少对第三方API的依赖风险
- 提供统一的文件访问接口
- 支持流式文件上传下载，提高性能
- 更容易扩展支持其他云存储服务

---

### 项目管理模块完整实现决策

[2025-07-10 18:29:00] - Phase 3项目管理模块的具体实现方案

**Rationale:**
根据BACKEND-DEVELOPMENT-CHECKLIST.md的Phase 3要求，完整实现了项目管理模块的所有功能，包括项目CRUD操作和素材关联管理。

**Implementation Details:**

- **DTOs实现**: 创建了CreateProjectDto、UpdateProjectDto、AddMaterialDto，均包含完整的验证规则
- **Service层**: 实现了完整的业务逻辑，包括项目CRUD、素材关联/解除关联、权限验证
- **Controller层**: 实现了7个完整的API端点，覆盖所有要求的功能
- **权限控制**: 实现了validateProjectOwnership方法确保用户只能操作自己的项目
- **错误处理**: 使用统一的异常处理（NotFoundException, ConflictException）
- **API设计**: 遵循RESTful最佳实践，使用PATCH而非PUT进行部分更新

**API端点清单:**

- POST /projects - 创建项目
- GET /projects - 获取用户项目列表
- GET /projects/:id - 获取项目详情
- PATCH /projects/:id - 更新项目
- DELETE /projects/:id - 删除项目
- POST /projects/:id/materials - 添加素材到项目
- DELETE /projects/:id/materials/:materialId - 从项目中移除素材
- GET /projects/:id/materials - 获取项目素材列表

**Technical Benefits:**

- 完整的权限验证确保数据安全
- 素材去重机制防止重复添加
- 统一的错误处理提升API稳定性
- RESTful设计提供清晰的API结构
