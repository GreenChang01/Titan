# Titan V1.1 | 共享包更新清单

基于 [PRD V1.1](../../requirements/PRD-v1.1.md) 的共享类型定义和DTOs更新。

## 📋 更新概览

- **版本**: V1.1
- **包路径**: `packages/shared`
- **核心目标**: 为新的素材管理、内容生产和发布功能提供类型安全支持
- **关键更新**: 新增实体类型、枚举定义、DTOs和验证规则

---

## 🏗️ 新增实体类型定义

### 1. 素材相关类型

#### Asset 实体类型

```typescript
// packages/shared/src/types/asset.types.ts
export interface Asset {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  assetType: AssetType;
  tags: string[];
  description?: string;
  metadata: AssetMetadata;
  uploadSource: UploadSource;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetMetadata {
  // 图片元数据
  width?: number;
  height?: number;

  // 音视频元数据
  duration?: number; // 秒
  bitrate?: number;
  sampleRate?: number;
  channels?: number;

  // 视频特有
  fps?: number;
  codec?: string;

  // 文件哈希值(去重用)
  hash?: string;
}

export enum AssetType {
  BACKGROUND_IMAGE = 'background_image',
  BACKGROUND_VIDEO = 'background_video',
  NARRATION_AUDIO = 'narration_audio',
  BGM_AUDIO = 'bgm_audio',
  TEXT_CONTENT = 'text_content',
  SUBTITLE_FILE = 'subtitle_file',
  WATERMARK_IMAGE = 'watermark_image',
}

export enum UploadSource {
  LOCAL = 'local',
  ALIYUN_DRIVE = 'aliyun_drive',
  URL_IMPORT = 'url_import',
}
```

#### 素材搜索和筛选类型

```typescript
// packages/shared/src/types/asset-search.types.ts
export interface AssetSearchFilters {
  assetTypes?: AssetType[];
  tags?: string[];
  uploadSource?: UploadSource;
  dateRange?: {
    start: Date;
    end: Date;
  };
  fileSizeRange?: {
    min: number;
    max: number;
  };
  searchKeyword?: string;
}

export interface AssetSearchResult {
  assets: Asset[];
  total: number;
  page: number;
  pageSize: number;
  filters: AssetSearchFilters;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### 2. 项目相关类型

#### Project 实体类型

```typescript
// packages/shared/src/types/project.types.ts
export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  assetCount: number;
  contentCount: number;
  createdAt: Date;
  updatedAt: Date;

  // 关联数据(可选)
  assets?: Asset[];
  contents?: GeneratedContent[];
}

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export interface ProjectAssetRelation {
  id: string;
  projectId: string;
  assetId: string;
  addedAt: Date;
}
```

### 3. 内容模板类型

#### ContentTemplate 实体类型

```typescript
// packages/shared/src/types/template.types.ts
export interface ContentTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  templateConfig: TemplateConfig;
  slotDefinitions: SlotDefinition[];
  videoSettings: VideoSettings;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateConfig {
  version: string;
  templateType: TemplateType;
  requiredSlots: string[];
  optionalSlots: string[];
}

export interface SlotDefinition {
  id: string;
  name: string;
  displayName: string;
  assetType: AssetType;
  required: boolean;
  multiple: boolean; // 是否支持多个素材
  maxCount?: number; // 最大素材数量
  constraints?: SlotConstraints;
}

export interface SlotConstraints {
  // 文件大小限制
  maxFileSize?: number;
  minFileSize?: number;

  // 时长限制(音视频)
  maxDuration?: number;
  minDuration?: number;

  // 尺寸限制(图片/视频)
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;

  // 支持的文件格式
  allowedFormats?: string[];
}

export interface VideoSettings {
  resolution: VideoResolution;
  fps: number;
  bitrate?: number;
  codec?: string;
  duration?: number; // 固定时长或"auto"
  watermark?: WatermarkSettings;
  subtitle?: SubtitleSettings;
}

export interface VideoResolution {
  width: number;
  height: number;
  label: string; // "1080p", "720p", etc.
}

export interface WatermarkSettings {
  enabled: boolean;
  position: WatermarkPosition;
  opacity: number; // 0-1
  scale: number; // 0-1
}

export interface SubtitleSettings {
  enabled: boolean;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  backgroundColor?: string;
  position: SubtitlePosition;
}

export enum TemplateType {
  ASMR_IMAGE_TEXT = 'asmr_image_text',
  ASMR_DIALOGUE = 'asmr_dialogue',
  LANDSCAPE_MEDITATION = 'landscape_meditation',
  CUSTOM = 'custom',
}

export enum WatermarkPosition {
  TOP_LEFT = 'top_left',
  TOP_RIGHT = 'top_right',
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_RIGHT = 'bottom_right',
  CENTER = 'center',
}

export enum SubtitlePosition {
  TOP = 'top',
  CENTER = 'center',
  BOTTOM = 'bottom',
}
```

### 4. 内容生产类型

#### ContentJob 实体类型

```typescript
// packages/shared/src/types/job.types.ts
export interface ContentJob {
  id: string;
  userId: string;
  projectId: string;
  templateId: string;
  jobType: JobType;
  status: JobStatus;
  priority: JobPriority;
  inputConfig: JobInputConfig;
  outputPath?: string;
  progress: number; // 0-100
  errorMessage?: string;
  processingTime?: number; // 秒
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface JobInputConfig {
  templateId: string;
  slotAssignments: SlotAssignment[];
  matchingStrategy: MatchingStrategy;
  videoSettings: VideoSettings;
  batchSize?: number;
}

export interface SlotAssignment {
  slotId: string;
  assetIds: string[];
}

export enum JobType {
  SINGLE = 'single',
  BATCH = 'batch',
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum JobPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum MatchingStrategy {
  ONE_TO_ONE = 'one_to_one', // 一对一匹配
  CARTESIAN = 'cartesian', // 笛卡尔积
  RANDOM = 'random', // 随机组合
  SEQUENTIAL = 'sequential', // 顺序匹配
}
```

#### GeneratedContent 实体类型

```typescript
// packages/shared/src/types/content.types.ts
export interface GeneratedContent {
  id: string;
  userId: string;
  projectId: string;
  jobId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  duration: number;
  thumbnailPath?: string;
  publishStatus: PublishStatus;
  publishedAt?: Date;
  publishPlatforms: PublishPlatform[];
  metadata: ContentMetadata;
  createdAt: Date;
}

export interface ContentMetadata {
  templateId: string;
  templateName: string;
  usedAssets: AssetUsage[];
  videoSettings: VideoSettings;
  processingTime: number;
  generationBatch?: string; // 批次标识
}

export interface AssetUsage {
  assetId: string;
  assetType: AssetType;
  slotId: string;
  fileName: string;
}

export enum PublishStatus {
  DRAFT = 'draft',
  READY = 'ready',
  SCHEDULED = 'scheduled',
  PUBLISHING = 'publishing',
  PUBLISHED = 'published',
  FAILED = 'failed',
}

export enum PublishPlatform {
  WECHAT_VIDEO = 'wechat_video',
  DOUYIN = 'douyin',
  XIAOHONGSHU = 'xiaohongshu',
  BILIBILI = 'bilibili',
}
```

### 5. 发布排期类型

#### PublishSchedule 实体类型

```typescript
// packages/shared/src/types/schedule.types.ts
export interface PublishSchedule {
  id: string;
  userId: string;
  contentId: string;
  platform: PublishPlatform;
  scheduledTime: Date;
  status: ScheduleStatus;
  publishConfig: PublishConfig;
  publishResult?: PublishResult;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface PublishConfig {
  title?: string;
  description?: string;
  tags?: string[];
  visibility: ContentVisibility;
  allowComments: boolean;
  allowDownload: boolean;
  customThumbnail?: string;
}

export interface PublishResult {
  success: boolean;
  publishedUrl?: string;
  platformId?: string; // 平台返回的内容ID
  error?: string;
  responseData?: any;
}

export enum ScheduleStatus {
  PENDING = 'pending',
  READY = 'ready',
  PUBLISHING = 'publishing',
  PUBLISHED = 'published',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ContentVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS = 'friends',
  FOLLOWERS = 'followers',
}
```

### 6. 微信集成类型

#### WechatIntegration 类型

```typescript
// packages/shared/src/types/wechat.types.ts
export interface WechatBinding {
  id: string;
  userId: string;
  wechatUserId: string;
  nickname: string;
  avatarUrl?: string;
  accessToken: string; // 加密存储
  refreshToken: string; // 加密存储
  expiresAt: Date;
  scope: string[];
  bindingStatus: BindingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface WechatVideoUpload {
  uploadId: string;
  filePath: string;
  uploadProgress: number;
  uploadStatus: UploadStatus;
  mediaId?: string;
  uploadUrl?: string;
  errorMessage?: string;
}

export enum BindingStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  ERROR = 'error',
}

export enum UploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
```

---

## 🔧 DTOs 定义

### 1. 素材相关 DTOs

```typescript
// packages/shared/src/dto/asset.dto.ts
import {IsString, IsEnum, IsArray, IsOptional, IsNumber, Min, Max} from 'class-validator';

export class CreateAssetDto {
  @IsString()
  fileName: string;

  @IsString()
  originalName: string;

  @IsString()
  filePath: string;

  @IsNumber()
  @Min(0)
  fileSize: number;

  @IsString()
  mimeType: string;

  @IsEnum(AssetType)
  assetType: AssetType;

  @IsArray()
  @IsString({each: true})
  tags: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(UploadSource)
  uploadSource: UploadSource;

  metadata: AssetMetadata;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsEnum(AssetType)
  assetType?: AssetType;

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  tags?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}

export class AssetSearchDto {
  @IsOptional()
  @IsArray()
  @IsEnum(AssetType, {each: true})
  assetTypes?: AssetType[];

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  tags?: string[];

  @IsOptional()
  @IsEnum(UploadSource)
  uploadSource?: UploadSource;

  @IsOptional()
  @IsString()
  searchKeyword?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

export class BatchAssetOperationDto {
  @IsArray()
  @IsString({each: true})
  assetIds: string[];

  @IsEnum(['delete', 'update_tags', 'move_to_project'])
  operation: string;

  @IsOptional()
  payload?: any;
}
```

### 2. 项目相关 DTOs

```typescript
// packages/shared/src/dto/project.dto.ts
export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus = ProjectStatus.ACTIVE;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

export class AddAssetsToProjectDto {
  @IsArray()
  @IsString({each: true})
  assetIds: string[];
}
```

### 3. 模板相关 DTOs

```typescript
// packages/shared/src/dto/template.dto.ts
export class CreateTemplateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ValidateNested()
  @Type(() => TemplateConfig)
  templateConfig: TemplateConfig;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => SlotDefinition)
  slotDefinitions: SlotDefinition[];

  @ValidateNested()
  @Type(() => VideoSettings)
  videoSettings: VideoSettings;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TemplateConfig)
  templateConfig?: TemplateConfig;

  @IsOptional()
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => SlotDefinition)
  slotDefinitions?: SlotDefinition[];

  @IsOptional()
  @ValidateNested()
  @Type(() => VideoSettings)
  videoSettings?: VideoSettings;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
```

### 4. 内容生产 DTOs

```typescript
// packages/shared/src/dto/job.dto.ts
export class CreateContentJobDto {
  @IsString()
  projectId: string;

  @IsString()
  templateId: string;

  @IsEnum(JobType)
  jobType: JobType;

  @ValidateNested()
  @Type(() => JobInputConfig)
  inputConfig: JobInputConfig;

  @IsOptional()
  @IsEnum(JobPriority)
  priority?: JobPriority = JobPriority.NORMAL;
}

export class CreateBatchJobDto {
  @IsString()
  projectId: string;

  @IsString()
  templateId: string;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => SlotAssignment)
  slotAssignments: SlotAssignment[];

  @IsEnum(MatchingStrategy)
  matchingStrategy: MatchingStrategy;

  @ValidateNested()
  @Type(() => VideoSettings)
  videoSettings: VideoSettings;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  batchSize?: number = 10;
}
```

### 5. 发布排期 DTOs

```typescript
// packages/shared/src/dto/schedule.dto.ts
export class CreateScheduleDto {
  @IsString()
  contentId: string;

  @IsEnum(PublishPlatform)
  platform: PublishPlatform;

  @IsDateString()
  scheduledTime: Date;

  @ValidateNested()
  @Type(() => PublishConfig)
  publishConfig: PublishConfig;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  maxRetries?: number = 3;
}

export class UpdateScheduleDto {
  @IsOptional()
  @IsDateString()
  scheduledTime?: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => PublishConfig)
  publishConfig?: PublishConfig;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;
}

export class BatchCreateScheduleDto {
  @IsArray()
  @IsString({each: true})
  contentIds: string[];

  @IsEnum(PublishPlatform)
  platform: PublishPlatform;

  @ValidateNested()
  @Type(() => PublishConfig)
  publishConfig: PublishConfig;

  @ValidateNested()
  @Type(() => BatchScheduleRule)
  scheduleRule: BatchScheduleRule;
}

export class BatchScheduleRule {
  @IsDateString()
  startDate: Date;

  @IsEnum(['daily', 'weekly', 'custom'])
  frequency: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  intervalDays?: number;

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  specificTimes?: string[]; // ["09:00", "17:00"]

  @IsOptional()
  @IsArray()
  @IsNumber({}, {each: true})
  weekdays?: number[]; // [1,2,3,4,5] for Mon-Fri
}
```

---

## 🚀 构建和导出配置

### 更新 package.json

```json
{
  "name": "@titan/shared",
  "version": "1.1.0",
  "description": "Shared types and DTOs for Titan V1.1",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "start:dev": "tsc --watch",
    "lint": "xo",
    "test": "jest"
  },
  "dependencies": {
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "xo": "^0.58.0",
    "jest": "^29.0.0"
  }
}
```

### 主入口文件更新

```typescript
// packages/shared/src/index.ts
// 实体类型
export * from './types/asset.types';
export * from './types/project.types';
export * from './types/template.types';
export * from './types/job.types';
export * from './types/content.types';
export * from './types/schedule.types';
export * from './types/wechat.types';

// 搜索和通用类型
export * from './types/asset-search.types';
export * from './types/common.types';

// DTOs
export * from './dto/asset.dto';
export * from './dto/project.dto';
export * from './dto/template.dto';
export * from './dto/job.dto';
export * from './dto/content.dto';
export * from './dto/schedule.dto';
export * from './dto/wechat.dto';

// 验证规则
export * from './validators/custom-validators';

// 工具类型
export * from './utils/type-utils';
```

### TypeScript 配置更新

```json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

---

## 🧪 验证规则

### 自定义验证器

```typescript
// packages/shared/src/validators/custom-validators.ts
import {registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

@ValidatorConstraint({async: false})
export class IsValidAssetTypeConstraint implements ValidatorConstraintInterface {
  validate(assetType: AssetType) {
    return Object.values(AssetType).includes(assetType);
  }

  defaultMessage() {
    return 'Invalid asset type';
  }
}

export function IsValidAssetType(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidAssetTypeConstraint,
    });
  };
}

// 文件大小验证
@ValidatorConstraint({async: false})
export class IsValidFileSizeConstraint implements ValidatorConstraintInterface {
  validate(fileSize: number) {
    const maxSize = 500 * 1024 * 1024; // 500MB
    return fileSize > 0 && fileSize <= maxSize;
  }

  defaultMessage() {
    return 'File size must be between 0 and 500MB';
  }
}

export function IsValidFileSize(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidFileSizeConstraint,
    });
  };
}
```

---

## 📝 开发任务清单

### Phase 1: 基础类型定义

- [ ] 创建所有实体类型接口
- [ ] 定义所有枚举类型
- [ ] 创建工具类型和泛型

### Phase 2: DTOs 和验证

- [ ] 创建所有 Create/Update DTOs
- [ ] 添加 class-validator 装饰器
- [ ] 实现自定义验证器
- [ ] 编写 DTO 单元测试

### Phase 3: 构建和集成

- [ ] 更新构建配置
- [ ] 更新导出配置
- [ ] 测试前后端集成
- [ ] 生成类型声明文件

### Phase 4: 文档和工具

- [ ] 生成 API 文档
- [ ] 创建类型使用示例
- [ ] 添加 ESLint 规则
- [ ] 配置自动化测试

---

**关键更新点**:

1. **类型安全**: 所有新功能都有完整的类型定义
2. **验证完整**: DTOs 包含全面的验证规则
3. **向后兼容**: 不影响现有用户认证功能
4. **易于扩展**: 为未来功能预留扩展点

**验收标准**:

- [ ] 前后端能够正确导入和使用所有类型
- [ ] 所有 DTOs 验证规则正确工作
- [ ] 类型定义覆盖所有业务场景
- [ ] 构建过程无错误和警告
