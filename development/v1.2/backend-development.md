# Titan V1.2 | 智能提示词与素材管理系统 后端开发清单

基于 [PRD V1.2](../../requirements/PRD-v1.2.md) 的AI驱动提示词管理和ASMR专业素材管理系统后端开发任务。

## 📋 项目概览

- **版本**: V1.2
- **技术栈**: NestJS + MikroORM + PostgreSQL + Redis + OpenAI/Claude + ElevenLabs
- **核心功能**: AI驱动提示词管理 + ASMR专业素材管理 + WebDAV集成
- **开发状态**: 新功能开发阶段

---

## 🏗️ 后端开发清单

### Phase 1: 数据库架构扩展 ❌

- [ ] **智能提示词表结构**
  - [ ] `ai_prompt` 表创建 - AI提示词存储
    - **文件路径**: `apps/nestjs-backend/src/prompts/entities/prompt.entity.ts`
    - **实现状态**: ❌ 待实现
    - **核心字段**: id, user_id, title, content, category, tags, is_public, is_ai_generated
    - **验收标准**: 完整的提示词存储结构
  - [ ] `prompt_tag` 表创建 - 标签管理
    - **实现状态**: ❌ 待实现
    - **核心字段**: id, name, category, color, usage_count
    - **验收标准**: 标签分类和重用机制
  - [ ] `prompt_tag_relation` 关联表
    - **实现状态**: ❌ 待实现
    - **验收标准**: 多对多标签关联

- [ ] **素材系统扩展**
  - [ ] `asset` 表字段扩展 - ASMR专用音频字段
    - **实现状态**: ❌ 待实现
    - **新增字段**: audio_duration, audio_format, audio_quality, waveform_data, is_asmr_optimized
    - **验收标准**: 专业音频元数据存储
  - [ ] 数据库索引优化
    - **实现状态**: ❌ 待实现
    - **索引设计**: 用户ID、分类、标签、使用频率复合索引
    - **验收标准**: 查询性能 < 100ms

- [ ] **枚举类型扩展**
  - [ ] `PromptCategory` 枚举 - 提示词分类
    - **实现状态**: ❌ 待实现
    - **包含值**: SLEEP_GUIDANCE, MEDITATION, RELAXATION, FOCUS_ENHANCEMENT, NATURE_IMMERSION, HEALING_THERAPY
    - **验收标准**: 完整分类体系
  - [ ] `AssetType` 扩展 - ASMR素材类型
    - **实现状态**: ❌ 待实现
    - **新增值**: ASMR_NATURAL_SOUND, ASMR_WHITE_NOISE, ASMR_AMBIENT_SOUND, ASMR_VOICE_SAMPLE
    - **验收标准**: 专业素材分类

### Phase 2: AI服务集成模块 ❌

- [ ] **智能提示词服务 (PromptAIService)**
  - [ ] AI提示词生成功能
    - **文件路径**: `apps/nestjs-backend/src/prompts/services/prompt-ai.service.ts`
    - **实现状态**: ❌ 待实现
    - **核心方法**: generatePrompt(), optimizePrompt(), analyzePromptQuality(), suggestTags()
    - **验收标准**: 5秒内生成高质量提示词
  - [ ] AI服务提供商集成
    - **实现状态**: ❌ 待实现
    - **集成服务**: OpenAI GPT-4, Claude 3.5 Sonnet
    - **验收标准**: 多AI引擎支持，成本优化

- [ ] **音频分析服务 (AudioAnalysisService)**
  - [ ] 音频质量分析
    - **文件路径**: `apps/nestjs-backend/src/assets/services/audio-analysis.service.ts`
    - **实现状态**: ❌ 待实现
    - **核心功能**: 音质评分、频谱分析、ASMR适用性评估
    - **验收标准**: 自动化音频质量检测
  - [ ] 波形数据生成
    - **实现状态**: ❌ 待实现
    - **技术方案**: FFmpeg音频处理
    - **验收标准**: 可视化波形数据输出

- [ ] **WebDAV集成服务 (WebDAVClientService)**
  - [ ] 阿里云盘WebDAV连接
    - **文件路径**: `apps/nestjs-backend/src/assets/services/webdav-client.service.ts`
    - **实现状态**: ❌ 待实现
    - **核心功能**: 连接测试、文件列表、上传下载、目录操作
    - **验收标准**: 稳定WebDAV操作，错误重试机制

### Phase 3: 核心业务模块 ❌

- [ ] **提示词管理模块 (PromptsModule)**
  - [ ] 实体设计
    - **文件路径**: `apps/nestjs-backend/src/prompts/entities/prompt.entity.ts`
    - **实现状态**: ❌ 待实现
    - **核心功能**: 完整的提示词CRUD、搜索、分类、评分
    - **验收标准**: 支持复杂查询和筛选
  - [ ] API端点实现
    - **实现状态**: ❌ 待实现
    - **包含端点**: POST /prompts, GET /prompts, GET /prompts/:id, PATCH /prompts/:id, DELETE /prompts/:id
    - **验收标准**: RESTful API完整实现

- [ ] **素材管理模块扩展 (AssetsModule)**
  - [ ] ASMR素材专用服务
    - **文件路径**: `apps/nestjs-backend/src/assets/services/asmr-assets.service.ts`
    - **实现状态**: ❌ 待实现
    - **核心功能**: ASMR素材上传、分析、分类、搜索
    - **验收标准**: 专业素材管理功能
  - [ ] 批量操作服务
    - **文件路径**: `apps/nestjs-backend/src/assets/services/batch-asset.service.ts`
    - **实现状态**: ❌ 待实现
    - **核心功能**: 批量上传、批量分析、批量标签更新
    - **验收标准**: 高效批量处理能力

### Phase 4: 生成流程集成增强 ❌

- [ ] **Step1内容创作增强**
  - [ ] AI内容生成功能
    - **文件路径**: `apps/nestjs-backend/src/generation/services/content-enhancement.service.ts`
    - **实现状态**: ❌ 待实现
    - **核心功能**: AI从零生成、现有内容优化、模板应用
    - **验收标准**: 智能内容创作辅助

- [ ] **Step3音景选择增强**
  - [ ] 个性化素材库
    - **文件路径**: `apps/nestjs-backend/src/generation/services/soundscape-enhancement.service.ts`
    - **实现状态**: ❌ 待实现
    - **核心功能**: 个人素材库集成、智能推荐、内容匹配
    - **验收标准**: 基于用户偏好的素材推荐

### Phase 5: API Demo验证系统 ❌

- [ ] **Demo API端点**
  - [ ] 快速验证接口
    - **文件路径**: `apps/nestjs-backend/src/demo/demo.controller.ts`
    - **实现状态**: ❌ 待实现
    - **包含端点**: POST /demo/prompt-generation, POST /demo/prompt-optimization, GET /demo/asset-catalog
    - **验收标准**: 独立验证各功能模块
  - [ ] 集成测试端点
    - **文件路径**: `apps/nestjs-backend/src/demo/integration-demo.controller.ts`
    - **实现状态**: ❌ 待实现
    - **包含端点**: GET /demo/integration/full-workflow, POST /demo/integration/end-to-end
    - **验收标准**: 端到端流程验证

### Phase 6: 安全与性能优化 ❌

- [ ] **安全配置**
  - [ ] AI服务安全配置
    - **实现状态**: ❌ 待实现
    - **配置内容**: API密钥管理、限流策略、内容过滤
    - **验收标准**: 安全可靠的AI服务调用
  - [ ] 文件上传安全
    - **实现状态**: ❌ 待实现
    - **安全措施**: 文件类型验证、大小限制、恶意内容扫描
    - **验收标准**: 安全的文件上传机制

- [ ] **性能优化**
  - [ ] Redis缓存策略
    - **实现状态**: ❌ 待实现
    - **缓存内容**: 提示词模板、素材元数据、用户偏好、搜索结果
    - **验收标准**: 响应时间 < 2秒
  - [ ] 数据库查询优化
    - **实现状态**: ❌ 待实现
    - **优化方案**: 复合索引、查询优化、连接池配置
    - **验收标准**: 查询性能 < 100ms

---

## 📦 共享类型包开发

### Phase 1: 类型定义 ❌

- [ ] **新增类型定义**
  - [ ] AI提示词相关类型
    - **文件路径**: `packages/titan-shared/src/types/ai-prompt.ts`
    - **实现状态**: ❌ 待实现
    - **包含类型**: Prompt, PromptTag, PromptCategory, PromptSearchFilters
    - **验收标准**: 前后端类型一致性
  - [ ] 音频分析类型
    - **文件路径**: `packages/titan-shared/src/types/audio-analysis.ts`
    - **实现状态**: ❌ 待实现
    - **包含类型**: AudioQualityReport, WaveformData, ASMRTrigger
    - **验收标准**: 完整音频处理类型定义

---

## 🔧 配置和部署

### Phase 1: 环境配置 ❌

- [ ] **AI服务环境变量**
  - [ ] OpenAI API配置
    - **配置项**: OPENAI_API_KEY, OPENAI_BASE_URL, AI_REQUEST_TIMEOUT
    - **实现状态**: ❌ 待配置
    - **验收标准**: 生产环境完整配置
  - [ ] Claude API配置
    - **配置项**: CLAUDE_API_KEY, CLAUDE_BASE_URL, AI_MAX_TOKENS
    - **实现状态**: ❌ 待配置
    - **验收标准**: 备用AI引擎支持

- [ ] **音频处理配置**
  - [ ] FFmpeg配置
    - **配置项**: FFMPEG_PATH, AUDIO_ANALYSIS_TIMEOUT, MAX_AUDIO_FILE_SIZE
    - **实现状态**: ❌ 待配置
    - **验收标准**: 音频处理环境就绪

### Phase 2: 数据库迁移 ❌

- [ ] **迁移脚本创建**
  - **命令**: `npm run migration:create -- --name=add-ai-prompt-system`
  - **实现状态**: ❌ 待执行
  - **验收标准**: 新表和字段正确创建

- [ ] **索引优化脚本**
  - **实现状态**: ❌ 待执行
  - **验收标准**: 查询性能优化

---

## 📊 开发工作量评估

| 模块             | 功能描述                   | 开发工作量 | 优先级 |
| ---------------- | -------------------------- | ---------- | ------ |
| **数据库设计**   | 新表结构 + 索引            | 1天        | P0     |
| **AI服务集成**   | OpenAI/Claude + 提示词生成 | 3天        | P0     |
| **提示词管理**   | CRUD + 搜索 + 标签         | 2天        | P0     |
| **素材管理扩展** | 音频分析 + WebDAV          | 3天        | P0     |
| **生成流程集成** | Step1/Step3增强            | 2天        | P0     |
| **API Demo**     | 验证接口开发               | 1天        | P1     |
| **安全优化**     | 限流 + 验证                | 1天        | P1     |
| **性能优化**     | 缓存 + 查询优化            | 1天        | P1     |

**总计**: **14天** (P0功能: 11天, P1功能: 3天)

---

## 🎯 开发优先级

### 🟢 P0 - 核心功能 (必须完成)

1. **数据库架构** - 新表和扩展字段
2. **AI提示词生成** - OpenAI/Claude集成
3. **提示词管理系统** - 完整的CRUD和搜索
4. **素材管理增强** - 音频分析和分类
5. **生成流程集成** - Step1和Step3功能增强

### 🟡 P1 - 增强功能 (建议完成)

1. **API Demo系统** - 验证和演示接口
2. **安全优化** - 限流、验证、清理
3. **性能优化** - 缓存、索引、查询优化

### 🔵 P2 - 未来扩展 (后续版本)

1. **高级AI功能** - 多模态提示词生成
2. **社区功能** - 提示词分享和协作
3. **分析系统** - 使用统计和效果追踪

---

## 🧪 测试策略

### 单元测试 ❌

- [ ] **PromptAIService测试**
  - **测试范围**: 提示词生成、优化、质量分析
  - **验收标准**: 100%核心逻辑覆盖

- [ ] **AudioAnalysisService测试**
  - **测试范围**: 音频质量评估、元数据提取
  - **验收标准**: 准确性和性能验证

### 集成测试 ❌

- [ ] **完整工作流测试**
  - **测试范围**: 提示词创建 → AI优化 → 保存 → 搜索
  - **验收标准**: 端到端流程验证

---

## 🎉 验收标准

### 功能验收 ❌

- [ ] AI提示词生成响应时间 < 5秒
- [ ] 音频文件上传和预处理 < 10秒
- [ ] 素材搜索响应时间 < 2秒
- [ ] 所有API端点正确实现
- [ ] 数据库迁移成功执行

### 性能验收 ❌

- [ ] 支持100+并发用户
- [ ] 数据库查询优化 < 100ms
- [ ] 文件上传支持500MB文件
- [ ] AI服务调用成功率 > 95%

### 安全验收 ❌

- [ ] 用户数据完全隔离
- [ ] 文件上传安全检查通过
- [ ] AI服务密钥安全存储
- [ ] API限流正确工作

---

**状态**: 🔄 **新功能开发阶段** - 核心功能待实现

**下一步**: 开始Phase 1数据库架构扩展

**依赖**: AI服务API密钥配置完成
