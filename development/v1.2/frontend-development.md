# Titan v1.2 前端开发清单

基于Next.js 15 + TypeScript + React 19，实现智能提示管理和ASMR素材管理功能。

## 📋 项目概览

- **项目代号**: Titan v1.2 - AI提示管理与ASMR素材优化
- **技术栈**: Next.js 15 + React 19 + TypeScript + shadcn/ui + Tailwind CSS
- **核心功能**: 智能提示管理 + ASMR素材管理 + Step1内容创作增强 + Step3音景选择优化
- **开发状态**: 🎯 **第一阶段完成** - 2025-07-15 AI图片生成系统上线
- **当前阶段**: Milestone 1 完成，等待Milestone 2开始

---

## 🎨 前端开发清单

### Phase 1: 智能提示管理系统 ❌

- [ ] **提示库主界面**
  - [ ] `app/[locale]/prompts/page.tsx` - 提示管理主页面
    - **文件路径**: `apps/nextjs-frontend/src/app/[locale]/prompts/page.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 三栏布局 - 过滤面板 + 提示网格 + 详情面板
    - **验收标准**: 响应式布局，提示分类展示，搜索过滤功能
  - [ ] 提示过滤和搜索组件
    - **文件路径**: `apps/nextjs-frontend/src/components/prompts/prompt-filter-panel.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 分类过滤 + 标签过滤 + 关键词搜索
    - **验收标准**: 实时过滤，多条件组合搜索

- [ ] **提示编辑器组件**
  - [ ] 创建/编辑提示表单
    - **文件路径**: `apps/nextjs-frontend/src/components/prompts/prompt-editor.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 多Tab表单 - 基本信息/变量定义/使用示例/AI设置
    - **验收标准**: React Hook Form + Zod验证，变量动态管理
  - [ ] 变量编辑器子组件
    - **文件路径**: `apps/nextjs-frontend/src/components/prompts/variable-editor.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 动态变量添加/删除，类型选择，默认值设置
    - **验收标准**: 变量预览，格式验证

- [ ] **AI提示生成器**
  - [ ] AI智能生成组件
    - **文件路径**: `apps/nextjs-frontend/src/components/prompts/ai-prompt-generator.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 描述输入 + AI生成 + 结果展示
    - **验收标准**: 支持多种生成模式，结果可编辑

### Phase 2: ASMR素材管理系统 ❌

- [ ] **素材浏览器**
  - [ ] 素材管理主界面
    - **文件路径**: `apps/nextjs-frontend/src/components/assets/asset-browser.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 过滤面板 + 网格/列表视图 + 详情面板
    - **验收标准**: 多种视图模式，素材选择和管理
  - [ ] 素材网格/列表组件
    - **文件路径**: `apps/nextjs-frontend/src/components/assets/asset-grid.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 虚拟化列表，多选支持，拖拽操作
    - **验收标准**: 大量素材渲染流畅，交互响应迅速

- [x] **AI图片生成器** ✅
  - [x] AI图片生成主组件
    - **文件路径**: `apps/nextjs-frontend/src/components/ai-image/ai-image-generator.tsx`
    - **实现状态**: ✅ **已完成**
    - **技术实现**: 提示词输入 + Pollinations.AI调用 + 结果展示 + React Query集成
    - **验收标准**: 支持中英文提示词，ASMR场景预设模板，无水印选项，完整的错误处理
  - [x] AI图片管理器
    - **文件路径**: `apps/nextjs-frontend/src/components/ai-image/ai-image-manager.tsx`
    - **实现状态**: ✅ **已完成**
    - **技术实现**: 生成历史 + 参数管理 + 重新生成 + React Query集成
    - **验收标准**: AI生成图片分类管理，实时搜索过滤，乐观更新
  - [x] AI图片页面主入口
    - **文件路径**: `apps/nextjs-frontend/src/app/[locale]/ai-images/page.tsx`
    - **实现状态**: ✅ **已完成**
    - **技术实现**: Tab导航 + 生成器组件 + 管理器组件集成
    - **验收标准**: 完整的AI图片生成和管理工作流
  - [ ] 图片提示词预设库
    - **文件路径**: `apps/nextjs-frontend/src/components/assets/image-prompt-presets.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 预设模板 + 分类管理 + 快速应用
    - **验收标准**: 常用提示词模板，支持自定义保存

- [ ] **WebDAV文件管理器增强**
  - [ ] WebDAV文件管理器组件
    - **文件路径**: `apps/nextjs-frontend/src/components/assets/webdav-file-manager.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 目录导航 + 文件列表 + 批量操作
    - **验收标准**: 完整的文件管理功能，错误处理

- [ ] **素材智能分类**
  - [ ] 自动分类组件
    - **文件路径**: `apps/nextjs-frontend/src/components/assets/auto-categorization.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: AI分析文件内容，推荐分类，置信度显示
    - **验收标准**: 准确的分类建议，用户可接受或修改

### Phase 3: Step1内容创作增强 ✅

- [x] **前端核心组件开发** ✅
  - [x] AI图片生成和管理界面
    - **文件路径**: `apps/nextjs-frontend/src/components/ai-image/*`
    - **实现状态**: ✅ **已完成**
    - **技术实现**: React Query + shadcn/ui + TypeScript严格模式
    - **验收标准**: 完整的AI图片生成工作流，ASMR场景预设，响应式设计

- [x] **工作流集成优化** ✅
  - [x] React Query状态管理集成
    - **实现状态**: ✅ **已完成**
    - **技术实现**: 
      - 创建了 `use-ai-images.ts` 和 `use-ai-prompts.ts` React Query hooks
      - 实现了完整的CRUD操作：生成、列表、删除、更新
      - 集成了乐观更新、错误处理、自动缓存失效
      - 支持实时状态同步和用户反馈
    - **验收标准**: 
      - ✅ 替换手动fetch调用为React Query hooks
      - ✅ 实现自动错误处理和toast通知
      - ✅ 乐观更新提升用户体验
      - ✅ 智能缓存策略减少不必要的API调用

- [ ] **智能提示选择器**
  - [ ] Step1增强组件
    - **文件路径**: `apps/nextjs-frontend/src/components/generate/step1-enhanced.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 提示库集成 + AI生成 + 变量填充 + 文本优化
    - **验收标准**: 无缝集成提示系统，变量动态渲染
  - [ ] 提示库模态框
    - **文件路径**: `apps/nextjs-frontend/src/components/generate/prompt-library-modal.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 提示浏览 + 搜索 + 选择 + 预览
    - **验收标准**: 快速提示选择，变量预填充

### Phase 4: Step3音景选择增强 ❌

- [ ] **素材集成音景选择器**
  - [ ] Step3增强组件
    - **文件路径**: `apps/nextjs-frontend/src/components/generate/step3-enhanced.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 预设音景 + 自定义生成 + 项目素材选择
    - **验收标准**: 三种音景来源无缝切换
  - [ ] 素材音景选择器
    - **文件路径**: `apps/nextjs-frontend/src/components/generate/asset-soundscape-selector.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 音频素材浏览 + 预览 + 选择
    - **验收标准**: 音频预览，时长显示，音质信息

### Phase 5: React Query集成层 ✅

- [x] **AI图片相关Hooks** ✅
  - [x] AI图片管理Hooks
    - **文件路径**: `apps/nextjs-frontend/src/hooks/use-ai-images.ts`
    - **实现状态**: ✅ **已完成**
    - **技术实现**: 
      - `useAIImages()` - 图片列表查询
      - `useGenerateAIImage()` - 图片生成mutation
      - `useDeleteAIImage()` - 图片删除mutation，支持乐观更新
      - `useUpdateAIImage()` - 图片更新mutation
      - 完整的查询键管理和缓存策略
    - **验收标准**: ✅ 自动缓存，乐观更新，错误重试，toast通知

- [x] **AI提示相关Hooks** ✅
  - [x] AI提示管理Hooks
    - **文件路径**: `apps/nextjs-frontend/src/hooks/use-ai-prompts.ts`
    - **实现状态**: ✅ **已完成**
    - **技术实现**: 
      - `useAIPrompts()` - 提示列表查询，支持过滤
      - `useCreateAIPrompt()` - 创建提示mutation
      - `useUpdateAIPrompt()` - 更新提示mutation
      - `useDeleteAIPrompt()` - 删除提示mutation，乐观更新
      - `useDuplicateAIPrompt()` - 复制提示mutation
      - `useAIPromptCategories()` - 分类查询
    - **验收标准**: ✅ 完整的提示CRUD操作，智能缓存失效

### Phase 6: API集成层 ✅

- [x] **AI图片生成API服务** ✅
  - [x] AI图片生成API集成
    - **文件路径**: 集成在 `apps/nextjs-frontend/src/hooks/use-ai-images.ts`
    - **实现状态**: ✅ **已完成**
    - **API端点映射**:
      - ✅ `POST /api/ai/images/generate` - 生成图片
      - ✅ `GET /api/ai/images` - 获取生成历史
      - ✅ `DELETE /api/ai/images/:id` - 删除生成记录
      - ✅ `PATCH /api/ai/images/:id` - 更新图片信息
    - **验收标准**: ✅ 完整的AI图片生成和管理功能，错误处理，用户反馈

- [x] **AI服务API集成** ✅
  - [x] AI提示管理API集成
    - **文件路径**: 集成在 `apps/nextjs-frontend/src/hooks/use-ai-prompts.ts`
    - **实现状态**: ✅ **已完成**
    - **API端点映射**:
      - ✅ `GET /api/ai/prompts` - 获取提示列表
      - ✅ `POST /api/ai/prompts` - 创建提示
      - ✅ `PATCH /api/ai/prompts/:id` - 更新提示
      - ✅ `DELETE /api/ai/prompts/:id` - 删除提示
      - ✅ `POST /api/ai/prompts/:id/duplicate` - 复制提示
      - ✅ `GET /api/ai/prompts/categories` - 获取分类
    - **验收标准**: ✅ 统一的AI提示管理接口，支持多种操作

### Phase 6: React 19优化和性能 ❌

- [ ] **服务端组件集成**
  - [ ] 提示页面服务端组件
    - **文件路径**: `apps/nextjs-frontend/src/app/[locale]/prompts/step1-server.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 服务端数据预取，流式渲染
    - **验收标准**: 首屏渲染优化，SEO友好

- [ ] **客户端组件优化**
  - [ ] 虚拟化素材网格
    - **文件路径**: `apps/nextjs-frontend/src/components/optimized/asset-grid.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: react-window虚拟化，内存优化
    - **验收标准**: 大量素材列表渲染流畅

- [ ] **状态管理升级**
  - [ ] Zustand v4提示状态
    - **文件路径**: `apps/nextjs-frontend/src/store/prompts.store.ts`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 提示状态管理，选择器优化
    - **验收标准**: 响应式状态更新，性能优化

### Phase 7: Demo验证页面 ❌

- [ ] **API Demo页面**
  - [ ] 智能提示API Demo
    - **文件路径**: `apps/nextjs-frontend/src/app/[locale]/demo/prompts/page.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 提示测试，变量替换，AI响应展示
    - **验收标准**: 完整的API功能验证
  - [ ] ASMR素材API Demo
    - **文件路径**: `apps/nextjs-frontend/src/app/[locale]/demo/assets/page.tsx`
    - **实现状态**: ❌ 待开始
    - **技术实现**: 素材上传，分类，搜索测试
    - **验收标准**: 所有素材功能可验证

---

## 📦 React Query集成 ✅

### Phase 1: 查询Hooks ✅

- [x] **提示相关Hooks** ✅
  - [x] 提示查询Hooks
    - **文件路径**: `apps/nextjs-frontend/src/hooks/use-ai-prompts.ts`
    - **实现状态**: ✅ **已完成**
    - **技术实现**: useQuery, useMutation, 缓存策略, 乐观更新
    - **验收标准**: ✅ 自动缓存，乐观更新，错误重试

- [x] **素材相关Hooks** ✅
  - [x] AI图片管理Hooks
    - **文件路径**: `apps/nextjs-frontend/src/hooks/use-ai-images.ts`
    - **实现状态**: ✅ **已完成**
    - **技术实现**: 图片生成状态管理，列表查询，CRUD操作，错误处理
    - **验收标准**: ✅ 流畅的AI图片生成和管理体验

- [x] **AI图片生成Hooks** ✅
  - [x] AI图片生成Hooks
    - **文件路径**: `apps/nextjs-frontend/src/hooks/use-ai-images.ts`
    - **实现状态**: ✅ **已完成**
    - **技术实现**: 图片生成状态管理，历史记录，CRUD操作，乐观更新
    - **验收标准**: ✅ 完整的AI图片生成状态管理和缓存策略

---

## 🎯 开发优先级

### 高优先级 (P0) - 核心功能

1. ✅ **AI图片生成功能** - 核心新功能 (**已完成**)
2. ✅ **React Query集成** - 数据状态管理 (**已完成**)
3. ❌ **智能提示管理系统** - 核心新功能
4. ❌ **提示API集成** - 数据支持
5. ❌ **Step1内容创作增强** - 用户体验提升
6. ❌ **素材管理优化** - 现有功能增强

### 中优先级 (P1) - 体验优化

1. ❌ Step3音景选择增强
2. ❌ 素材智能分类
3. ❌ React 19性能优化
4. ❌ Demo验证页面

### 低优先级 (P2) - 高级功能

1. ❌ AI服务深度集成
2. ❌ 高级素材搜索
3. ❌ 批量操作优化
4. ❌ 键盘快捷键支持

---

## 🚀 里程碑计划

### Milestone 1: AI图片生成系统 ✅

**时间**: Week 8
**状态**: ✅ **已完成**
**已完成**: 2025-07-15

- ✅ AI图片生成器组件开发
- ✅ AI图片管理器组件开发
- ✅ React Query hooks集成
- ✅ 完整的CRUD操作实现
- ✅ ASMR场景预设模板
- ✅ 乐观更新和错误处理

### Milestone 2: 素材管理增强 ❌

**时间**: Week 9
**状态**: 待开始
**依赖**: Milestone 1完成 ✅

- ❌ 素材浏览器优化
- ❌ 智能分类功能
- ❌ WebDAV管理增强
- ❌ 批量操作支持

### Milestone 3: 生成流程优化 ❌

**时间**: Week 10
**状态**: 待开始
**依赖**: Milestone 2完成

- ❌ Step1内容创作增强
- ❌ Step3音景选择优化
- ❌ 提示系统集成
- ❌ 素材选择优化

### Milestone 4: 性能和体验 ❌

**时间**: Week 11
**状态**: 待开始
**依赖**: Milestone 3完成

- ❌ React 19优化
- ❌ 虚拟化列表
- ❌ 缓存策略优化
- ❌ 用户体验打磨

---

## 📝 技术债务和风险评估

### 技术债务

1. **AI服务集成复杂度** - 多个AI提供商集成，错误处理复杂
2. **大数据列表性能** - 素材列表可能包含大量数据
3. **实时预览功能** - 音频/视频预览的性能挑战
4. **状态同步复杂性** - 提示和素材状态的一致性维护

### 风险评估

**高风险**:
- AI服务调用延迟影响用户体验
- 大文件素材的前端处理性能
- 复杂的提示变量解析逻辑

**中风险**:
- React 19新特性的兼容性
- 虚拟化列表的滚动性能
- WebDAV文件操作的错误处理

**低风险**:
- 提示模板的格式标准化
- 素材分类算法的准确性
- UI组件的响应式适配

### 应对策略

1. **渐进式开发**: 先实现核心功能，再优化性能
2. **缓存策略**: 积极使用React Query缓存减少API调用
3. **错误边界**: 完善的错误处理和用户反馈
4. **性能监控**: 实时监控关键指标

---

## 📊 质量标准

### 代码质量
- TypeScript严格模式，无类型错误
- React 19新特性正确使用
- 组件测试覆盖率 > 75%
- XO (ESLint) 规则100%通过

### 用户体验
- AI响应时间 < 5s
- 素材列表渲染 < 1s
- 操作响应时间 < 300ms
- 文件上传进度实时显示

### 性能标准
- 大素材列表流畅滚动
- 内存使用合理增长
- AI服务调用优化
- 缓存策略有效

---

## 🔗 依赖关系

### 外部依赖
- **后端AI服务API**: 智能提示和分类功能
- **素材管理API增强**: 支持智能分类和搜索
- **共享类型包更新**: 新的AI相关类型定义

### 内部依赖
- **AI服务集成** → 智能功能
- **React Query配置** → 数据缓存和同步
- **素材管理基础** → 增强功能开发
- **提示系统** → Step1和Step3增强

---

_本清单基于Titan v1.2前端开发需求编写，专注于AI提示管理和ASMR素材管理的深度集成，使用React 19和Next.js 15的最新特性。_