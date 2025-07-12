# Titan V1.1 | 前端开发清单

基于 [PRD V1.1](../../requirements/PRD-v1.1.md) 的智能内容生产与分发平台前端开发任务。

## 📋 开发概览

- **版本**: V1.1
- **技术栈**: Next.js 15 + TypeScript + shadcn/ui + Tailwind CSS + Zustand
- **核心目标**: 构建直观易用的内容生产和管理界面
- **关键功能**: ASMR音频生成、素材管理器、批量生产界面、内容日历、发布管理

---

## 🎵 **已完成**: ASMR音频生成系统 ✅

### ASMR生成向导 (5步骤完整实现)

#### ✅ 1. 基础架构和类型定义

**位置**: `packages/titan-shared/src/types/asmr.ts`

```typescript
// 完整的ASMR类型系统
export type JobStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed';

export interface VoiceOptions {
  voiceId: string;
  stability: number;
  similarity: number;
  style: number;
  speakerBoost: boolean;
}

export interface SoundscapeOptions {
  prompt: string;
  duration: number;
  category: 'nature' | 'indoor' | 'urban' | 'abstract';
  intensity: number;
  quality: 'standard' | 'high' | 'premium';
}

export interface MixingSettings {
  voiceVolume: number;
  soundscapeVolume: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  eqSettings: {
    lowFreq: number;
    midFreq: number;
    highFreq: number;
  };
}

export interface QualityRequirements {
  minimumScore: number;
  enableAutoRetry: boolean;
  maxRetries: number;
  strictValidation: boolean;
}
```

#### ✅ 2. 状态管理系统

**位置**: `apps/nextjs-frontend/src/store/asmr/asmr.store.ts`

```typescript
// Zustand ASMR状态管理
interface ASMRStore {
  // 5步向导状态
  currentStep: number;
  maxSteps: number;
  wizardSteps: WizardStep[];

  // 表单数据
  formData: {
    text?: string;
    voiceSettings?: VoiceOptions;
    soundscapeConfig?: SoundscapeOptions;
    mixingSettings?: MixingSettings;
    qualityRequirements?: QualityRequirements;
  };

  // 任务管理
  jobs: Job[];
  isSubmitting: boolean;
  error: string | null;
  estimatedCost: CostEstimate | null;

  // Actions
  setText: (text: string) => void;
  setVoiceSettings: (settings: VoiceOptions) => void;
  setSoundscapeConfig: (config: SoundscapeOptions) => void;
  setMixingSettings: (settings: MixingSettings) => void;
  setQualityRequirements: (requirements: QualityRequirements) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  addJob: (job: Job) => void;
  setEstimatedCost: (cost: CostEstimate) => void;
}
```

#### ✅ 3. Mock API服务系统

**位置**: `apps/nextjs-frontend/src/lib/services/asmr-api.mock.ts`

- **完整的预设数据**：3种语音预设、4种音景预设、3种混音预设
- **任务进展模拟**：从队列→处理中→完成的完整生命周期
- **成本估算**：基于文本长度和时长的动态计算
- **服务验证**：模拟ElevenLabs、FFmpeg等服务状态

```typescript
// 实现的主要功能
export const mockASMRApiService = {
  createJob: (payload: ASMRGenerationRequest) => Promise<Job>;
  createBatchJobs: (requests: ASMRGenerationRequest[]) => Promise<Job[]>;
  getJobProgress: (jobId: string) => Promise<JobProgress>;
  listJobs: (options?) => Promise<JobListResponse>;
  getJobById: (jobId: string) => Promise<Job>;
  retryJob: (jobId: string) => Promise<Job>;
  getPresets: () => Promise<PresetsResponse>;
  estimateCost: (payload: ASMRGenerationRequest) => Promise<CostEstimate>;
  validateServices: () => Promise<ServiceStatus>;
};
```

#### ✅ 4. API服务层 (Mock集成)

**位置**: `apps/nextjs-frontend/src/lib/services/asmr-api.service.ts`

- **Mock/Real API切换**：通过`USE_MOCK_API`标志控制
- **统一接口**：前端组件无感知API实现方式
- **错误处理**：集成`apiRequestHandler`进行统一错误处理

#### ✅ 5. 完整的5步向导实现

##### Step 1: 文本内容输入 ✅

**位置**: `apps/nextjs-frontend/src/app/[locale]/generate/_components/step1-content.tsx`

- **ASMR文本模板**：睡前故事、冥想引导、放松练习等预设模板
- **智能建议**：针对中老年听众的内容优化建议
- **实时字数统计**：帮助控制音频时长
- **内容验证**：确保文本适合语音合成

##### Step 2: 语音配置 ✅

**位置**: `apps/nextjs-frontend/src/app/[locale]/generate/_components/step2-voice.tsx`

- **语音预设选择**：温柔女声、沉稳男声、温暖女声
- **参数微调**：稳定性、相似度、风格强度、音量增强
- **实时预览**：语音参数调整的即时反馈
- **老年友好优化**：清晰度和语速专门优化

##### Step 3: 音景选择 ✅

**位置**: `apps/nextjs-frontend/src/app/[locale]/generate/_components/step3-soundscape.tsx`

- **音景预设库**：雨林环境、壁炉火焰、海浪声、风铃声
- **自定义配置**：时长、类别、强度、质量等参数调节
- **分类管理**：自然环境、室内环境、城市环境、抽象声音
- **质量控制**：标准、高质量、专业三个等级

##### Step 4: 高级混音设置 ✅

**位置**: `apps/nextjs-frontend/src/app/[locale]/generate/_components/step4-advanced.tsx`

- **Tab界面组织**：混音设置、质量控制、高级选项
- **音量平衡控制**：人声与音景的精细平衡
- **淡入淡出效果**：开始和结束的平滑过渡
- **3频段均衡器**：低频、中频、高频独立调节
- **质量控制系统**：最低评分、自动重试、严格验证

##### Step 5: 预览与确认 ✅

**位置**: `apps/nextjs-frontend/src/app/[locale]/generate/_components/step5-review.tsx`

- **配置总览**：所有步骤设置的完整展示
- **成本估算**：实时计算AI服务使用费用
- **生产就绪确认**：针对中老年听众的优化说明
- **任务创建**：一键启动ASMR音频生成

#### ✅ 6. 主向导页面

**位置**: `apps/nextjs-frontend/src/app/[locale]/generate/page.tsx`

- **进度指示器**：可视化显示当前步骤和完成进度
- **步骤导航**：支持前进、后退、直接跳转
- **状态管理**：完整的向导状态追踪
- **错误处理**：统一的错误信息显示

#### ✅ 7. 任务监控组件

**位置**: `apps/nextjs-frontend/src/components/asmr/job-monitor.tsx`

- **实时进度监控**：使用SWR进行任务状态轮询
- **任务列表管理**：显示最近的ASMR生成任务
- **状态可视化**：队列中、处理中、已完成、失败等状态
- **错误处理和重试**：失败任务的重新执行

#### ✅ 8. 音频播放组件

**位置**: `apps/nextjs-frontend/src/components/audio/audio-player.tsx`

- **HTML5音频播放器**：完整的播放控制
- **进度控制**：拖拽进度条、时间显示
- **音量控制**：音量滑块、静音切换
- **下载功能**：生成的音频文件下载

#### ✅ 9. Dashboard集成

**位置**: `apps/nextjs-frontend/src/app/[locale]/dashboard/page.tsx`

- **ASMR任务列表**：在主dashboard显示最近任务
- **快速操作**：直接跳转到ASMR生成页面
- **状态统计**：任务数量和状态概览

#### ✅ 10. UI组件扩展

**位置**: `apps/nextjs-frontend/src/components/ui/`

- **Switch组件**：开关控制组件
- **已有组件**：Button, Card, Slider, Select, Progress, Tabs等

### 技术特点

#### 🎯 用户体验设计

- **年轻操作者界面**：专业、高效的操作界面设计
- **中老年内容优化**：生产内容专门针对中老年听众
- **直观的向导流程**：5步渐进式配置体验
- **实时反馈**：配置更改的即时预览和验证

#### 🔧 技术架构

- **TypeScript全覆盖**：完整的类型安全
- **Zustand状态管理**：轻量级、高性能的状态管理
- **shadcn/ui组件系统**：现代化UI组件库
- **SWR数据获取**：智能数据缓存和实时更新
- **Mock优先开发**：前后端完全解耦开发

#### 🚀 开发效率

- **Mock API完整实现**：前端开发无需等待后端
- **模块化组件设计**：高复用性和可维护性
- **统一错误处理**：标准化的异常处理机制
- **实时开发预览**：热重载和即时反馈

---

## 🎨 Milestone 1: 基础组件与布局 (Week 1)

### 1.1 项目结构扩展

#### 新增页面路由

- [ ] `app/[locale]/assets/` - 素材管理
  - `page.tsx` - 素材库主页面
  - `upload/page.tsx` - 素材上传页面
  - `[id]/page.tsx` - 素材详情页面

- [ ] `app/[locale]/projects/` - 项目管理
  - `page.tsx` - 项目列表页面
  - `[id]/page.tsx` - 项目详情页面
  - `[id]/production/page.tsx` - 内容生产页面

- [ ] `app/[locale]/templates/` - 模板管理
  - `page.tsx` - 模板列表页面
  - `[id]/page.tsx` - 模板详情页面
  - `create/page.tsx` - 创建模板页面

- [ ] `app/[locale]/content/` - 内容管理
  - `page.tsx` - 内容列表页面
  - `calendar/page.tsx` - 内容日历页面
  - `[id]/page.tsx` - 内容详情页面

- [ ] `app/[locale]/publish/` - 发布管理
  - `page.tsx` - 发布概览页面
  - `settings/page.tsx` - 发布设置页面

#### 组件目录结构

```
src/components/
├── assets/                    # 素材相关组件
│   ├── asset-upload/
│   ├── asset-browser/
│   ├── asset-card/
│   └── asset-preview/
├── projects/                  # 项目相关组件
│   ├── project-form/
│   ├── project-assets/
│   └── project-analytics/
├── templates/                 # 模板相关组件
│   ├── template-editor/
│   ├── template-preview/
│   └── slot-definition/
├── content/                   # 内容相关组件
│   ├── content-grid/
│   ├── content-calendar/
│   ├── batch-production/
│   └── content-preview/
├── publish/                   # 发布相关组件
│   ├── publish-schedule/
│   ├── platform-settings/
│   └── publish-status/
└── shared/                    # 共享组件
    ├── file-uploader/
    ├── media-player/
    ├── progress-tracker/
    └── filter-panel/
```

### 1.2 状态管理架构扩展

#### Store 结构设计

- [ ] **AssetStore** - 素材管理状态

  ```typescript
  interface AssetStore {
    assets: Asset[];
    selectedAssets: Asset[];
    filters: AssetFilters;
    uploadProgress: UploadProgress[];

    // Actions
    loadAssets: (filters?: AssetFilters) => Promise<void>;
    uploadAssets: (files: File[], metadata: AssetMetadata) => Promise<void>;
    selectAsset: (asset: Asset) => void;
    selectMultipleAssets: (assets: Asset[]) => void;
    updateAssetTags: (assetId: string, tags: string[]) => Promise<void>;
    deleteAsset: (assetId: string) => Promise<void>;
  }
  ```

- [ ] **ProjectStore** - 项目管理状态

  ```typescript
  interface ProjectStore {
    projects: Project[];
    currentProject: Project | null;
    projectAssets: Asset[];

    // Actions
    loadProjects: () => Promise<void>;
    createProject: (projectData: CreateProjectDto) => Promise<void>;
    selectProject: (projectId: string) => Promise<void>;
    addAssetsToProject: (assetIds: string[]) => Promise<void>;
    removeAssetFromProject: (assetId: string) => Promise<void>;
  }
  ```

- [ ] **ContentStore** - 内容生产状态

  ```typescript
  interface ContentStore {
    contentJobs: ContentJob[];
    generatedContent: GeneratedContent[];
    productionProgress: ProductionProgress;

    // Actions
    createBatchProduction: (config: BatchProductionConfig) => Promise<void>;
    checkJobProgress: (jobId: string) => Promise<void>;
    loadGeneratedContent: () => Promise<void>;
    deleteContent: (contentId: string) => Promise<void>;
  }
  ```

- [ ] **PublishStore** - 发布管理状态

  ```typescript
  interface PublishStore {
    schedules: PublishSchedule[];
    publishPlatforms: PublishPlatform[];
    calendarData: CalendarData;

    // Actions
    loadSchedules: (dateRange: DateRange) => Promise<void>;
    createSchedule: (schedule: CreateScheduleDto) => Promise<void>;
    updateScheduleTime: (scheduleId: string, newTime: Date) => Promise<void>;
    publishNow: (contentId: string, platform: string) => Promise<void>;
  }
  ```

### 1.3 基础UI组件

#### 文件上传组件

- [ ] **FileUploader 组件**

  ```typescript
  interface FileUploaderProps {
    accept: string[];
    multiple?: boolean;
    maxSize?: number;
    onUpload: (files: File[]) => void;
    onProgress?: (progress: UploadProgress[]) => void;
    className?: string;
  }
  ```

  - 拖拽上传支持
  - 文件类型验证
  - 上传进度显示
  - 错误处理和重试

#### 媒体预览组件

- [ ] **MediaPlayer 组件**

  ```typescript
  interface MediaPlayerProps {
    src: string;
    type: 'image' | 'video' | 'audio';
    autoPlay?: boolean;
    controls?: boolean;
    className?: string;
  }
  ```

  - 支持图片、视频、音频预览
  - 响应式设计
  - 加载状态和错误处理

#### 筛选面板组件

- [ ] **FilterPanel 组件**

  ```typescript
  interface FilterPanelProps {
    filters: FilterConfig[];
    values: FilterValues;
    onChange: (values: FilterValues) => void;
    onReset: () => void;
  }
  ```

  - 动态筛选项配置
  - 多选、单选、范围选择
  - 搜索框集成

---

## 📁 Milestone 2: 素材管理界面 (Week 2)

### 2.1 素材库主页面

#### AssetBrowser 组件

- [ ] **布局设计**

  ```typescript
  // 三栏布局：筛选面板 + 素材网格 + 详情面板
  <div className="flex h-full">
    <AssetFilterPanel className="w-64 flex-shrink-0" />
    <AssetGrid className="flex-1" />
    <AssetDetailPanel className="w-80 flex-shrink-0" />
  </div>
  ```

- [ ] **功能特性**
  - 无限滚动加载
  - 虚拟化渲染(大量素材时)
  - 网格/列表视图切换
  - 批量选择模式
  - 快捷键支持(Ctrl+A全选等)

#### AssetGrid 组件

- [ ] **AssetCard 设计**

  ```typescript
  interface AssetCardProps {
    asset: Asset;
    selected?: boolean;
    onSelect?: (asset: Asset) => void;
    onPreview?: (asset: Asset) => void;
    showDetails?: boolean;
  }
  ```

  - 缩略图展示
  - 文件类型图标
  - 标签显示
  - 悬停操作菜单
  - 选择状态指示

### 2.2 素材上传页面

#### AssetUpload 组件

- [ ] **上传界面**

  ```typescript
  interface AssetUploadProps {
    onUploadComplete?: (assets: Asset[]) => void;
    defaultAssetType?: AssetType;
    projectId?: string; // 可选：直接上传到项目
  }
  ```

- [ ] **功能实现**
  - 多文件批量上传
  - 上传前预览
  - 元数据编辑表单
  - 标签自动建议
  - 上传进度追踪
  - 失败重试机制

#### 元数据编辑表单

- [ ] **AssetMetadataForm 组件**
  ```typescript
  interface MetadataFormData {
    assetType: AssetType;
    tags: string[];
    description?: string;
    customMetadata?: Record<string, any>;
  }
  ```

### 2.3 素材详情与编辑

#### AssetDetailPanel 组件

- [ ] **详情展示**
  - 大尺寸预览
  - 完整元数据信息
  - 使用历史记录
  - 关联项目列表

- [ ] **编辑功能**
  - 在线标签编辑
  - 描述信息修改
  - 分类重新选择
  - 删除确认对话框

---

## 🗂️ Milestone 3: 项目与模板管理 (Week 3)

### 3.1 项目管理界面

#### ProjectList 组件

- [ ] **项目列表**
  - 卡片式布局展示
  - 项目状态指示
  - 素材和内容计数
  - 快速操作菜单
  - 搜索和排序功能

#### ProjectDetail 页面

- [ ] **项目概览区域**

  ```typescript
  interface ProjectOverviewProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (projectId: string) => void;
  }
  ```

- [ ] **项目素材管理**
  ```typescript
  // 双栏布局：素材库 + 项目素材
  <div className="grid grid-cols-2 gap-4">
    <AssetLibraryPanel onAddToProject={addAssets} />
    <ProjectAssetsPanel onRemoveFromProject={removeAsset} />
  </div>
  ```

### 3.2 模板管理系统

#### TemplateEditor 组件

- [ ] **可视化编辑器**

  ```typescript
  interface TemplateEditorProps {
    template?: ContentTemplate;
    onSave: (template: ContentTemplate) => void;
    onPreview: (template: ContentTemplate) => void;
  }
  ```

- [ ] **插槽定义编辑器**
  ```typescript
  interface SlotDefinition {
    name: string;
    type: AssetType;
    required: boolean;
    description?: string;
    constraints?: SlotConstraints;
  }
  ```

#### 预置模板展示

- [ ] **模板选择器**
  - 预置模板缩略图
  - 模板功能说明
  - 使用示例展示
  - 一键应用功能

---

## 🎬 Milestone 4: 内容生产界面 (Week 4)

### 4.1 批量生产配置

#### BatchProduction 组件

- [ ] **生产向导界面**
  ```typescript
  interface BatchProductionSteps {
    1: 'template-selection'; // 选择模板
    2: 'asset-mapping'; // 素材映射
    3: 'production-config'; // 生产配置
    4: 'preview-confirm'; // 预览确认
    5: 'execution-monitor'; // 执行监控
  }
  ```

#### 模板选择步骤

- [ ] **TemplateSelector 组件**
  - 可用模板展示
  - 模板预览功能
  - 插槽需求说明
  - 选择确认

#### 素材映射步骤

- [ ] **AssetMapping 组件**

  ```typescript
  interface AssetMappingProps {
    template: ContentTemplate;
    projectAssets: Asset[];
    onMappingChange: (mapping: AssetMapping) => void;
  }
  ```

  - 插槽与素材的拖拽映射
  - 批量选择界面
  - 匹配策略选择(一对一/笛卡尔积/随机)
  - 预期输出数量显示

### 4.2 生产监控界面

#### ProductionMonitor 组件

- [ ] **实时进度展示**

  ```typescript
  interface ProductionProgress {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    currentJob?: ContentJob;
    estimatedTimeRemaining: number;
  }
  ```

- [ ] **任务列表**
  - 每个任务的状态指示
  - 错误信息展示
  - 重试失败任务
  - 取消未开始任务

### 4.3 内容管理界面

#### ContentGrid 组件

- [ ] **生成内容展示**
  - 视频缩略图网格
  - 状态标签(已完成/已发布等)
  - 批量操作工具栏
  - 预览和下载功能

#### ContentPreview 组件

- [ ] **内容预览器**
  - 视频播放器集成
  - 元数据信息展示
  - 发布历史记录
  - 快速发布按钮

---

## 📅 Milestone 5: 发布管理与日历 (Week 5)

### 5.1 内容日历界面

#### ContentCalendar 组件

- [ ] **日历集成**

  ```typescript
  import {FullCalendar} from '@fullcalendar/react';

  interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end?: Date;
    extendedProps: {
      contentId: string;
      platform: string;
      status: ScheduleStatus;
    };
  }
  ```

- [ ] **日历功能**
  - 月/周/日视图切换
  - 拖拽排期功能
  - 批量排期工具
  - 冲突检测提示
  - 快速操作菜单

#### 排期创建组件

- [ ] **ScheduleCreator 组件**
  ```typescript
  interface ScheduleCreatorProps {
    contents: GeneratedContent[];
    onScheduleCreated: (schedules: PublishSchedule[]) => void;
    defaultPlatform?: string;
    defaultTime?: Date;
  }
  ```

### 5.2 发布管理界面

#### PublishDashboard 组件

- [ ] **发布概览**
  - 待发布内容统计
  - 发布成功率图表
  - 最近发布活动
  - 平台连接状态

#### PlatformSettings 组件

- [ ] **平台配置管理**
  - 微信视频号授权状态
  - 授权绑定/解绑流程
  - 发布参数配置
  - 测试连接功能

---

## 🔧 Milestone 6: 集成与优化 (Week 6)

### 6.1 用户体验优化

#### 加载状态管理

- [ ] **LoadingStates 组件系统**
  ```typescript
  interface LoadingStateProps {
    loading: boolean;
    error?: string;
    empty?: boolean;
    children: React.ReactNode;
  }
  ```

#### 错误处理

- [ ] **ErrorBoundary 组件**
  - 组件级错误捕获
  - 友好错误信息展示
  - 重试机制
  - 错误报告收集

#### 性能优化

- [ ] **React性能优化**

  ```typescript
  // 使用React.memo优化重渲染
  const AssetCard = React.memo(({asset, selected, onSelect}) => {
    // ...
  });

  // 使用useMemo缓存计算结果
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => matchesFilters(asset, filters));
  }, [assets, filters]);
  ```

### 6.2 响应式设计

#### 移动端适配

- [ ] **响应式组件**
  - 触摸友好的操作
  - 移动端导航菜单
  - 适配小屏幕的布局
  - 手势操作支持

#### 平板适配

- [ ] **中等屏幕优化**
  - 侧边栏自动收缩
  - 触摸操作优化
  - 布局密度调整

### 6.3 国际化完善

#### 多语言支持

- [ ] **i18n扩展**
  ```typescript
  // 新增翻译文件
  en.json: {
    "assets": {
      "upload": "Upload Assets",
      "filters": "Filters",
      "type": "Asset Type",
      "tags": "Tags"
    },
    "projects": { ... },
    "content": { ... },
    "publish": { ... }
  }
  ```

---

## 🎨 设计系统与组件库

### 设计token扩展

- [ ] **颜色系统**

  ```css
  :root {
    /* 状态颜色 */
    --color-status-pending: #f59e0b;
    --color-status-processing: #3b82f6;
    --color-status-completed: #10b981;
    --color-status-failed: #ef4444;

    /* 素材类型颜色 */
    --color-asset-image: #8b5cf6;
    --color-asset-video: #f59e0b;
    --color-asset-audio: #10b981;
    --color-asset-text: #6b7280;
  }
  ```

### 自定义组件

- [ ] **StatusBadge 组件**

  ```typescript
  interface StatusBadgeProps {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
  }
  ```

- [ ] **ProgressTracker 组件**
  ```typescript
  interface ProgressTrackerProps {
    steps: ProgressStep[];
    currentStep: number;
    orientation?: 'horizontal' | 'vertical';
  }
  ```

---

## 🧪 测试策略

### 组件测试

- [ ] **关键组件单元测试**
  ```typescript
  // AssetCard.test.tsx
  describe('AssetCard', () => {
    it('displays asset information correctly', () => {});
    it('handles selection state', () => {});
    it('calls onPreview when clicked', () => {});
  });
  ```

### 集成测试

- [ ] **用户流程E2E测试**
  ```typescript
  // batch-production.e2e.spec.ts
  test('complete batch production workflow', async ({page}) => {
    // 1. 上传素材
    // 2. 创建项目
    // 3. 选择模板
    // 4. 配置生产
    // 5. 验证结果
  });
  ```

### 性能测试

- [ ] **渲染性能测试**
  - 大量素材列表渲染
  - 日历组件数据加载
  - 视频预览性能
  - 状态更新频率测试

---

## 📱 PWA功能

### 离线支持

- [ ] **Service Worker配置**
  - 缓存关键资源
  - 离线页面展示
  - 数据同步策略

### 桌面应用体验

- [ ] **PWA配置**
  ```json
  // manifest.json
  {
    "name": "Titan Content Platform",
    "short_name": "Titan",
    "display": "standalone",
    "orientation": "landscape-primary"
  }
  ```

---

## 🔧 开发工具与配置

### 开发环境增强

- [ ] **热重载优化**
  - 状态保持配置
  - 快速刷新设置
  - 错误边界开发模式

### 构建优化

- [ ] **生产构建配置**
  ```typescript
  // next.config.ts
  {
    experimental: {
      optimizeCss: true,
      optimizeImages: true,
    },
    images: {
      domains: ['your-cdn-domain.com'],
      formats: ['image/webp', 'image/avif'],
    }
  }
  ```

---

## 📊 性能指标

### 核心Web指标

- [ ] **性能要求**
  - First Contentful Paint < 1.5s
  - Largest Contentful Paint < 2.5s
  - Cumulative Layout Shift < 0.1
  - First Input Delay < 100ms

### 用户体验指标

- [ ] **交互响应时间**
  - 素材筛选响应 < 200ms
  - 页面导航切换 < 300ms
  - 文件上传开始 < 500ms
  - 预览加载完成 < 1s

---

**开发优先级**:

1. **P0**: 基础布局、素材管理、项目管理
2. **P1**: 内容生产、发布管理、日历功能
3. **P2**: 性能优化、PWA功能、高级特性

**关键技术挑战**:

- 大量媒体文件的性能优化
- 复杂状态管理的数据一致性
- 拖拽操作的用户体验
- 实时进度更新的WebSocket集成

**验收标准**:

- [ ] 所有核心用户流程可完整执行
- [ ] 响应式设计在各设备正常工作
- [ ] 性能指标达到要求标准
- [ ] 无障碍性支持基本完整
