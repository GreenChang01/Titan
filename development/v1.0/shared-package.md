# Titan | 素材协作平台 MVP 共享包开发清单 v1.0

基于实际项目架构需求，专注于前后端类型安全和数据一致性的共享类型包开发。

## 📋 项目概览

- **项目代号**: Titan | 素材协作平台 MVP v1.0 - 共享类型包
- **技术栈**: TypeScript + class-validator + class-transformer
- **核心目标**: 前后端类型安全 + API数据一致性 + 运行时验证
- **开发状态**: 待创建 - P0阻塞前端开发

---

## 📦 共享包开发清单

### Phase 1: 工作空间创建 ❌

- [ ] **创建`packages/shared-types`工作空间**
  - **优先级**: P0 - 阻塞前端开发
  - **工时估计**: 4小时
  - **文件结构**:
    ```
    packages/shared-types/
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── entities/
    │   ├── dto/
    │   ├── enums/
    │   ├── types/
    │   └── index.ts
    └── dist/ (构建输出)
    ```
  - **实现内容**:
    - 设置TypeScript配置
    - 配置构建脚本 (tsc + watch模式)
    - 设置Turborepo依赖关系
    - 配置包发布和导入
  - **验收标准**: 可以从前后端项目成功导入共享类型
  - **依赖**: 无
  - **风险**: Turborepo配置复杂性

- [ ] **配置包管理和构建**
  - **优先级**: P0
  - **工时估计**: 2小时
  - **文件路径**: `packages/shared-types/package.json`
  - **实现内容**:
    ```json
    {
      "name": "@titan/shared",
      "version": "1.0.0",
      "main": "dist/index.js",
      "types": "dist/index.d.ts",
      "scripts": {
        "build": "tsc",
        "dev": "tsc --watch",
        "clean": "rm -rf dist"
      },
      "dependencies": {
        "class-validator": "^0.14.0",
        "class-transformer": "^0.5.1"
      }
    }
    ```
  - **验收标准**: 自动构建和类型生成
  - **依赖**: TypeScript配置
  - **风险**: 版本依赖冲突

### Phase 2: 核心实体类型定义 ❌

- [ ] **用户相关类型**
  - **优先级**: P0
  - **工时估计**: 6小时
  - **文件路径**: `packages/shared-types/src/entities/user.entity.ts`
  - **实现内容**:
    ```typescript
    export enum UserStatus {
      CONFIRMATION_PENDING = 'CONFIRMATION_PENDING',
      ACTIVE = 'ACTIVE',
      BLOCKED = 'BLOCKED',
    }

    export interface User {
      id: string;
      email: string;
      username: string;
      status: UserStatus;
      isEmailVerified: boolean;
      passwordResetToken?: string;
      passwordResetTokenCreatedAt?: Date;
      createdAt: Date;
      updatedAt: Date;
    }

    export interface UserProfile {
      id: string;
      email: string;
      username: string;
      status: UserStatus;
      isEmailVerified: boolean;
      createdAt: Date;
    }
    ```
  - **验收标准**: 覆盖所有用户相关字段，不包含敏感信息
  - **依赖**: 无
  - **风险**: 敏感字段泄露

- [ ] **项目相关类型**
  - **优先级**: P0
  - **工时估计**: 4小时
  - **文件路径**: `packages/shared-types/src/entities/project.entity.ts`
  - **实现内容**:
    ```typescript
    export interface Project {
      id: string;
      name: string;
      description?: string;
      color?: string;
      isActive: boolean;
      lastAccessedAt?: Date;
      createdAt: Date;
      updatedAt: Date;
      materialsCount?: number; // 计算字段
    }

    export interface ProjectWithMaterials extends Project {
      materials: ProjectMaterial[];
    }
    ```
  - **验收标准**: 支持项目基本信息和扩展信息
  - **依赖**: 无
  - **风险**: 字段变更同步

- [ ] **阿里云盘配置类型**
  - **优先级**: P0
  - **工时估计**: 3小时
  - **文件路径**: `packages/shared-types/src/entities/aliyun-drive.entity.ts`
  - **实现内容**:
    ```typescript
    export interface AliyunDriveConfig {
      id: string;
      webdavUrl: string;
      username: string;
      displayName?: string;
      timeout: number;
      basePath: string;
      lastSyncAt?: Date;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }

    export interface AliyunDriveFile {
      id: string;
      name: string;
      path: string;
      type: 'file' | 'directory';
      size?: number;
      mimeType?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }
    ```
  - **验收标准**: 安全的配置信息（不包含密码），完整的文件信息
  - **依赖**: 无
  - **风险**: 敏感配置信息暴露

- [ ] **项目素材类型**
  - **优先级**: P0
  - **工时估计**: 4小时
  - **文件路径**: `packages/shared-types/src/entities/project-material.entity.ts`
  - **实现内容**:
    ```typescript
    export interface ProjectMaterial {
      id: string;
      aliyunFileId: string;
      fileName: string;
      filePath: string;
      fileType?: string;
      fileSize?: number;
      thumbnailUrl?: string;
      fileCreatedAt?: Date;
      fileUpdatedAt?: Date;
      description?: string;
      metadata?: Record<string, any>;
      createdAt: Date;
      updatedAt: Date;
    }

    export interface MaterialWithProject extends ProjectMaterial {
      project: Pick<Project, 'id' | 'name'>;
    }
    ```
  - **验收标准**: 完整的素材信息，支持元数据扩展
  - **依赖**: Project类型
  - **风险**: 元数据类型安全性

### Phase 3: API请求/响应DTOs ❌

- [ ] **认证相关DTOs**
  - **优先级**: P0
  - **工时估计**: 6小时
  - **文件路径**: `packages/shared-types/src/dto/auth.dto.ts`
  - **实现内容**:
    ```typescript
    import { IsEmail, IsString, MinLength } from 'class-validator';

    export class LoginDto {
      @IsEmail()
      email: string;

      @IsString()
      @MinLength(6)
      password: string;
    }

    export class RegisterDto {
      @IsEmail()
      email: string;

      @IsString()
      @MinLength(3)
      username: string;

      @IsString()
      @MinLength(8)
      password: string;
    }

    export interface AuthResponse {
      user: UserProfile;
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }
    ```
  - **验收标准**: 包含验证装饰器，类型安全的响应
  - **依赖**: class-validator, UserProfile类型
  - **风险**: 验证规则不一致

- [ ] **项目管理DTOs**
  - **优先级**: P0
  - **工时估计**: 8小时
  - **文件路径**: `packages/shared-types/src/dto/project.dto.ts`
  - **实现内容**:
    ```typescript
    import { IsString, IsOptional, MaxLength, IsHexColor } from 'class-validator';

    export class CreateProjectDto {
      @IsString()
      @MaxLength(100)
      name: string;

      @IsOptional()
      @IsString()
      @MaxLength(500)
      description?: string;

      @IsOptional()
      @IsHexColor()
      color?: string;
    }

    export class UpdateProjectDto {
      @IsOptional()
      @IsString()
      @MaxLength(100)
      name?: string;

      @IsOptional()
      @IsString()
      @MaxLength(500)
      description?: string;

      @IsOptional()
      @IsHexColor()
      color?: string;
    }

    export class AddMaterialDto {
      @IsString()
      aliyunFileId: string;

      @IsString()
      fileName: string;

      @IsString()
      filePath: string;

      @IsOptional()
      @IsString()
      fileType?: string;

      @IsOptional()
      description?: string;
    }

    export interface ProjectResponse {
      id: string;
      name: string;
      description?: string;
      color?: string;
      isActive: boolean;
      lastAccessedAt?: Date;
      createdAt: Date;
      updatedAt: Date;
    }
    ```
  - **验收标准**: 完整的CRUD DTOs，字段验证，响应类型
  - **依赖**: class-validator装饰器
  - **风险**: 验证规则复杂度

- [ ] **阿里云盘操作DTOs**
  - **优先级**: P0
  - **工时估计**: 10小时
  - **文件路径**: `packages/shared-types/src/dto/aliyun-drive.dto.ts`
  - **实现内容**:
    ```typescript
    import { IsString, IsOptional, IsNumber, IsUrl, Min, Max } from 'class-validator';

    export class CreateAliyunDriveConfigDto {
      @IsUrl()
      webdavUrl: string;

      @IsString()
      username: string;

      @IsString()
      password: string; // 仅在创建时使用

      @IsOptional()
      @IsString()
      displayName?: string;

      @IsOptional()
      @IsNumber()
      @Min(5000)
      @Max(300000)
      timeout?: number;

      @IsOptional()
      @IsString()
      basePath?: string;
    }

    export class ListFilesDto {
      @IsOptional()
      @IsString()
      path?: string;

      @IsOptional()
      @IsNumber()
      @Min(1)
      @Max(1000)
      limit?: number;

      @IsOptional()
      @IsString()
      offset?: string;
    }

    export class UploadFileDto {
      @IsString()
      path: string;

      @IsOptional()
      @IsString()
      fileName?: string;
    }

    export interface FileListResponse {
      files: AliyunDriveFile[];
      hasMore: boolean;
      nextOffset?: string;
      totalCount?: number;
    }
    ```
  - **验收标准**: 完整的WebDAV操作DTOs，分页支持
  - **依赖**: class-validator, AliyunDriveFile类型
  - **风险**: WebDAV操作复杂性

### Phase 4: 工具类型和枚举 ❌

- [ ] **API响应包装类型**
  - **优先级**: P1
  - **工时估计**: 4小时
  - **文件路径**: `packages/shared-types/src/types/api.types.ts`
  - **实现内容**:
    ```typescript
    export interface ApiResponse<T = any> {
      success: boolean;
      data?: T;
      error?: ApiError;
      timestamp: string;
    }

    export interface ApiError {
      code: string;
      message: string;
      details?: Record<string, any>;
    }

    export interface PaginatedResponse<T> {
      items: T[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }
    ```
  - **验收标准**: 统一的API响应格式，分页支持
  - **依赖**: 无
  - **风险**: 响应格式变更影响

- [ ] **业务枚举定义**
  - **优先级**: P1
  - **工时估计**: 3小时
  - **文件路径**: `packages/shared-types/src/enums/index.ts`
  - **实现内容**:
    ```typescript
    export enum FileType {
      IMAGE = 'image',
      VIDEO = 'video',
      AUDIO = 'audio',
      DOCUMENT = 'document',
      OTHER = 'other',
    }

    export enum ProjectStatus {
      ACTIVE = 'active',
      ARCHIVED = 'archived',
      DELETED = 'deleted',
    }

    export enum MaterialStatus {
      ACTIVE = 'active',
      PROCESSING = 'processing',
      ERROR = 'error',
      DELETED = 'deleted',
    }

    export enum SortOrder {
      ASC = 'asc',
      DESC = 'desc',
    }
    ```
  - **验收标准**: 覆盖业务场景的枚举值
  - **依赖**: 无
  - **风险**: 枚举值变更兼容性

- [ ] **验证规则常量**
  - **优先级**: P1
  - **工时估计**: 2小时
  - **文件路径**: `packages/shared-types/src/constants/validation.ts`
  - **实现内容**:
    ```typescript
    export const VALIDATION_RULES = {
      PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 100,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBER: true,
        REQUIRE_SPECIAL_CHAR: false,
      },
      USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 30,
        PATTERN: /^[a-zA-Z0-9_-]+$/,
      },
      PROJECT: {
        NAME_MAX_LENGTH: 100,
        DESCRIPTION_MAX_LENGTH: 500,
      },
      FILE: {
        MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
        ALLOWED_MIME_TYPES: [
          'image/jpeg',
          'image/png',
          'video/mp4',
          'audio/mpeg',
        ],
      },
    } as const;
    ```
  - **验收标准**: 统一的验证规则，类型安全
  - **依赖**: 无
  - **风险**: 规则不一致导致验证失败

### Phase 5: 类型导出和集成 ❌

- [ ] **统一导出配置**
  - **优先级**: P0
  - **工时估计**: 2小时
  - **文件路径**: `packages/shared-types/src/index.ts`
  - **实现内容**:
    ```typescript
    // 实体类型
    export * from './entities/user.entity';
    export * from './entities/project.entity';
    export * from './entities/aliyun-drive.entity';
    export * from './entities/project-material.entity';

    // DTOs
    export * from './dto/auth.dto';
    export * from './dto/project.dto';
    export * from './dto/aliyun-drive.dto';

    // 工具类型
    export * from './types/api.types';
    export * from './enums';
    export * from './constants/validation';

    // 类型别名
    export type ID = string;
    export type Timestamp = Date;
    export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
    export interface JSONObject { [key: string]: JSONValue; }
    export interface JSONArray extends Array<JSONValue> {}
    ```
  - **验收标准**: 清晰的模块导出，无循环依赖
  - **依赖**: 所有类型模块
  - **风险**: 循环依赖导致构建失败

- [ ] **后端集成配置**
  - **优先级**: P0
  - **工时估计**: 3小时
  - **实现内容**:
    - 在后端`package.json`中添加依赖: `"@titan/shared": "workspace:*"`
    - 更新后端实体文件导入共享类型
    - 更新DTOs使用共享验证装饰器
    - 确保API响应使用共享类型
  - **验收标准**: 后端TypeScript编译无错误，API响应类型正确
  - **依赖**: 共享包构建完成
  - **风险**: 类型不匹配导致运行时错误

- [ ] **前端集成配置**
  - **优先级**: P0
  - **工时估计**: 4小时
  - **实现内容**:
    - 在前端`package.json`中添加依赖: `"@titan/shared": "workspace:*"`
    - 配置API客户端使用共享类型
    - 更新React Query hooks类型注解
    - 配置表单验证使用共享常量
  - **验收标准**: 前端TypeScript编译无错误，API调用类型安全
  - **依赖**: 共享包构建完成
  - **风险**: 运行时类型验证失败

### Phase 6: 开发工具和测试 ❌

- [ ] **类型测试**
  - **优先级**: P1
  - **工时估计**: 8小时
  - **文件路径**: `packages/shared-types/src/__tests__/`
  - **实现内容**:
    - 实体类型构造函数测试
    - DTO验证规则测试
    - 枚举值测试
    - 类型兼容性测试
  - **测试框架**: Jest + TypeScript
  - **验收标准**: 测试覆盖率 > 90%，所有类型测试通过
  - **依赖**: 测试环境配置
  - **风险**: 测试维护成本

- [ ] **类型生成脚本**
  - **优先级**: P2
  - **工时估计**: 6小时
  - **实现内容**:
    - 从后端实体自动生成前端类型
    - API接口类型自动生成
    - 验证规则一致性检查
    - 类型变更检测脚本
  - **验收标准**: 自动化类型同步，减少手动维护
  - **依赖**: 构建系统
  - **风险**: 自动生成逻辑复杂

- [ ] **文档生成**
  - **优先级**: P2
  - **工时估计**: 4小时
  - **实现内容**:
    - TypeDoc自动文档生成
    - API类型文档
    - 使用示例和最佳实践
    - 版本变更说明
  - **验收标准**: 完整的类型文档，易于维护
  - **依赖**: TypeDoc配置
  - **风险**: 文档维护成本

---

## 🎯 开发优先级

### 高优先级 (P0) - 阻塞前端开发

1. ❌ **工作空间创建** - 基础设施
2. ❌ **核心实体类型** - 数据模型
3. ❌ **API DTOs** - 接口定义
4. ❌ **统一导出配置** - 模块化
5. ❌ **前后端集成** - 类型安全

### 中优先级 (P1) - 开发体验

1. ❌ 工具类型和枚举
2. ❌ 验证规则常量
3. ❌ 类型测试
4. ❌ API响应包装

### 低优先级 (P2) - 维护优化

1. ❌ 类型生成脚本
2. ❌ 文档生成
3. ❌ 高级类型工具
4. ❌ 性能优化

---

## 🚀 里程碑计划

### Milestone 1: 基础类型包 ❌
**时间**: Week 4
**状态**: 待开始
**阻塞项**: P0优先级任务
- 🔄 工作空间和构建配置
- 🔄 核心实体类型定义
- 🔄 基础API DTOs
- 🔄 统一导出配置

### Milestone 2: 集成验证 ❌
**时间**: Week 5  
**状态**: 待开始
**依赖**: Milestone 1完成
- ❌ 后端集成和验证
- ❌ 前端集成和测试
- ❌ 类型安全验证
- ❌ 构建流程优化

### Milestone 3: 完善工具 ❌
**时间**: Week 6
**状态**: 待开始
**依赖**: Milestone 2完成
- ❌ 工具类型和枚举
- ❌ 验证规则标准化
- ❌ 类型测试完善
- ❌ 开发文档编写

### Milestone 4: 自动化和文档 ❌
**时间**: Week 7
**状态**: 待开始
**依赖**: Milestone 3完成
- ❌ 自动化类型生成
- ❌ 文档系统建立
- ❌ CI/CD集成
- ❌ 版本管理策略

---

## 📝 技术债务和风险评估

### 技术债务

1. **类型同步维护** - 手动维护前后端类型一致性成本高
2. **验证规则重复** - 前后端验证逻辑可能不一致
3. **类型测试缺失** - 运行时类型错误风险
4. **版本管理复杂** - 共享包版本与应用版本同步
5. **构建依赖** - 应用构建依赖共享包构建

### 风险评估

**高风险**:
- 共享包构建失败导致整个项目无法构建
- 类型不匹配导致运行时错误
- 验证规则不一致导致数据不一致

**中风险**:
- Turborepo配置复杂度和学习成本
- 类型变更的向后兼容性问题
- 开发环境配置复杂度增加

**低风险**:
- 包大小对最终应用体积的影响
- TypeScript编译性能影响
- 文档维护成本

### 应对策略

1. **自动化测试**: 建立完善的类型测试，确保类型安全
2. **版本控制**: 使用语义化版本，明确breaking changes
3. **文档先行**: 确保使用指南和最佳实践文档完整
4. **渐进迁移**: 先完成基础类型，再逐步添加高级功能
5. **监控验证**: 建立类型一致性检查和报警机制

---

## 📊 质量标准

### 代码质量
- TypeScript严格模式，无类型错误
- 所有DTOs包含适当的验证装饰器
- 类型测试覆盖率 > 90%
- 无循环依赖

### 类型安全
- 编译时类型检查100%通过
- 运行时验证规则一致
- API响应类型匹配
- 前后端类型同步

### 开发体验
- 清晰的类型提示和自动补全
- 完整的错误提示和修复建议
- 简单的导入和使用方式
- 完善的文档和示例

---

## 🔗 依赖关系

### 外部依赖
- **TypeScript**: 类型系统基础
- **class-validator**: 运行时验证
- **class-transformer**: 数据转换
- **Turborepo**: 工作空间管理

### 内部依赖
- **后端实体设计** → 共享类型定义
- **API接口设计** → DTO类型定义
- **前端组件需求** → 响应类型设计
- **业务规则** → 验证规则定义

### 使用方依赖
- **前端开发** ← 共享类型包
- **后端开发** ← 共享类型包
- **API测试** ← 共享类型包
- **文档生成** ← 共享类型包

---

## 💡 最佳实践

### 类型设计原则
1. **接口隔离**: 不同场景使用不同的类型接口
2. **类型安全**: 优先使用严格类型，避免any
3. **向前兼容**: 新增字段使用可选属性
4. **命名规范**: 统一的命名约定和前缀
5. **文档注释**: 重要类型添加TSDoc注释

### 验证规则设计
1. **业务一致性**: 前后端使用相同的验证规则
2. **错误友好**: 提供清晰的验证错误信息
3. **性能考虑**: 避免过度复杂的验证逻辑
4. **扩展性**: 支持自定义验证规则
5. **国际化**: 支持多语言错误消息

### 维护策略
1. **版本管理**: 严格的语义化版本控制
2. **变更记录**: 详细的CHANGELOG记录
3. **测试优先**: 类型变更前先编写测试
4. **文档同步**: 代码变更同步更新文档
5. **定期审查**: 定期检查类型使用和优化

---

_本清单专注于为Titan v1.0创建完整的共享类型包，确保前后端类型安全和数据一致性。采用渐进式开发方式，优先完成核心功能。_