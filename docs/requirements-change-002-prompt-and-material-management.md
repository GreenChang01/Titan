# 需求变更单 RCR-002: 智能提示词与素材管理系统

## 变更基本信息

- **变更单号**: RCR-002
- **提出日期**: 2025-01-14
- **变更类型**: 功能增强
- **影响范围**: 前端内容管理、后端API扩展、ASMR生成流程
- **优先级**: 高
- **提出人**: 产品团队
- **评估人**: 开发团队
- **版本**: 1.2.1

## 变更背景与原因

### 当前问题

现有ASMR创作平台在内容创作和素材管理方面存在以下不足：

1. **提示词创作效率低下**:
   - 用户需要从零开始编写ASMR提示词
   - 缺乏AI辅助优化和润色功能
   - 无法有效管理和复用优质提示词
   - 缺乏分类标签系统进行组织

2. **素材管理功能缺失**:
   - 虽然有Asset系统基础架构，但缺乏ASMR专用素材管理界面
   - 用户无法便捷地上传、分类、预览ASMR素材
   - 素材与生成流程未形成无缝集成
   - 缺乏音频素材的专业化管理功能

3. **生成流程用户体验不佳**:
   - Step1内容创作阶段缺乏智能助手
   - Step3音景选择阶段缺乏自定义素材库
   - 无法利用历史优质内容进行快速创作

### 业务影响

- **创作效率低**: 用户需要大量时间进行内容创作和素材准备
- **内容质量不稳定**: 缺乏专业指导和AI优化
- **用户流失风险**: 复杂的创作流程影响用户体验
- **运营成本高**: 无法有效复用优质内容和素材

## 需求变更详情

### 1. 智能提示词管理系统 (Prompt Management System)

#### 1.1 核心功能模块

**智能提示词生成器 (AI Prompt Generator)**

- 基于用户输入的主题、情感、时长等参数生成ASMR提示词
- 支持多种生成模式：快速生成、详细生成、主题定制
- 集成GPT/Claude等AI服务进行内容生成
- 提供生成历史记录和版本管理

**AI润色优化引擎 (AI Enhancement Engine)**

- 对用户输入或生成的提示词进行智能优化
- 固定优化提示词模板（初期版本）
- 支持语言风格调整：温和、专业、亲切、正式
- 提供优化建议和改进点提示
- 预留动态配置接口（后期版本）

**分类标签管理 (Category & Tag Management)**

- 提示词多级分类系统：主题分类、情感分类、时长分类
- 智能标签自动生成和手动标签管理
- 支持标签搜索、筛选、组合查询
- 标签使用频率统计和推荐

**提示词库管理 (Prompt Library)**

- 个人提示词库：收藏、编辑、删除
- 公共提示词库：系统预设、社区分享
- 提示词评分和使用统计
- 批量导入导出功能

#### 1.2 用户界面设计

**主界面结构**

```
📝 智能提示词管理
   ├─ 🎯 快速生成    (AI助手快速创建)
   ├─ 📚 我的提示词  (个人提示词库)
   ├─ 🌟 精选模板    (公共优质模板)
   ├─ 🏷️ 标签管理    (分类标签系统)
   └─ 📊 使用统计    (效果分析)
```

**操作流程优化**

1. **快速生成模式**: 输入关键词 → AI生成 → 一键润色 → 保存使用
2. **模板选择模式**: 浏览分类 → 选择模板 → 个性化调整 → 应用到生成
3. **手动创作模式**: 自由输入 → AI润色建议 → 标签分类 → 保存管理

### 2. ASMR专用素材管理系统 (Material Management System)

#### 2.1 核心功能模块

**素材上传与处理 (Upload & Processing)**

- 支持多种音频格式：MP3、WAV、FLAC、M4A
- 阿里云盘WebDAV集成，支持大文件上传
- 音频格式自动转换和质量优化
- 批量上传和进度监控

**AI图片生成系统 (AI Image Generation)**

- 基于Pollinations.AI的免费图片生成服务
- 支持中英文提示词，自动URL编码处理
- 随机种子生成，确保每次生成不同图片
- 无水印图片生成选项 (nologo=true)
- 生成历史记录和重新生成功能
- AI生成图片与普通上传图片分类管理
- 生成参数保存：提示词、种子、生成时间
- 支持批量生成和预设提示词模板
- **ASMR场景预设模板**: 自然风景、温馨环境、抽象艺术等分类
- **简单易用界面**: 文本描述输入 + 一键生成 + 结果预览
- **项目集成**: 生成的图片自动关联到当前项目
- **智能分类**: AI生成图片在素材管理中有专门标识和分类

**素材分类与管理 (Classification & Management)**

- 智能分类系统：自然音、白噪音、环境音、人声素材
- 自定义分类标签和子分类
- 素材元数据管理：时长、格式、质量、来源
- 音频波形预览和关键帧提取

**素材库浏览器 (Material Browser)**

- 网格视图和列表视图切换
- 音频波形可视化预览
- 实时搜索和多维度筛选
- 素材收藏和播放列表管理

**素材质量分析 (Quality Analysis)**

- 音频质量自动检测：采样率、比特率、动态范围
- 音频内容分析：音量均衡、频谱分析
- 使用建议和优化提示
- 素材评分和推荐系统

#### 2.2 用户界面设计

**主界面结构**

```
🎵 ASMR素材管理
   ├─ 📁 素材库     (分类浏览)
   ├─ 🖼️ AI图片生成 (AI图片创作)
   ├─ ⬆️ 上传中心   (批量上传)
   ├─ 🔍 智能搜索   (多维筛选)
   ├─ ⭐ 我的收藏   (常用素材)
   └─ 📈 使用统计   (效果分析)
```

**素材卡片设计**

- 波形缩略图 + 基本信息 + 操作按钮
- 鼠标悬停预览播放
- 快速添加到项目功能
- 标签和分类显示

### 3. 生成流程集成方案 (Generation Workflow Integration)

#### 3.1 Step1 - 内容创作增强

**智能提示词助手集成**

- 在现有内容输入框旁边添加"AI助手"按钮
- 弹出式智能生成面板，支持：
  - 主题关键词输入
  - 情感基调选择
  - 时长预估设置
  - 一键生成和润色
- 生成结果可直接填入内容框或进行编辑
- 支持多个生成方案对比选择

**模板快速应用**

- 扩展现有模板功能，集成新的提示词库
- 按分类显示：睡前放松、冥想引导、专注提升等
- 模板预览和个性化调整
- 使用历史和推荐算法

#### 3.2 Step3 - 音景选择增强

**自定义素材库集成**

- 在现有音景选择基础上增加"我的素材"标签页
- 按分类展示用户上传的素材
- 支持素材试听和波形预览
- 素材与ElevenLabs音景的混合使用

**智能推荐系统**

- 基于文本内容推荐匹配的素材
- 考虑用户历史偏好和使用习惯
- 素材质量评分和适配度分析
- 一键应用推荐素材

#### 3.3 API Demo验证

**素材生成API演示**

- 创建独立的API测试页面
- 演示通过API调用生成素材的完整流程
- 支持参数调整和结果预览
- 性能测试和错误处理验证

## 技术实现规格

### 前端开发任务

| 组件               | 文件路径                                                     | 开发工作量 | 依赖           |
| ------------------ | ------------------------------------------------------------ | ---------- | -------------- |
| 智能提示词管理页面 | `src/app/[locale]/prompts/page.tsx`                          | 6天        | AI服务集成     |
| 提示词生成器组件   | `src/components/prompts/prompt-generator.tsx`                | 4天        | GPT/Claude API |
| 提示词库浏览器     | `src/components/prompts/prompt-library.tsx`                  | 3天        | 搜索和筛选     |
| ASMR素材管理页面   | `src/app/[locale]/materials/page.tsx`                        | 5天        | 现有Asset API  |
| 素材浏览器组件     | `src/components/materials/material-browser.tsx`              | 4天        | 音频预览       |
| 素材上传组件       | `src/components/materials/material-uploader.tsx`             | 3天        | WebDAV集成     |
| AI图片生成器组件   | `src/components/materials/ai-image-generator.tsx`            | 3天        | Pollinations API |
| AI图片管理器组件   | `src/components/materials/ai-image-manager.tsx`              | 2天        | 素材管理API    |
| Step1增强          | `src/app/[locale]/generate/_components/step1-content.tsx`    | 2天        | 提示词API      |
| Step3增强          | `src/app/[locale]/generate/_components/step3-soundscape.tsx` | 2天        | 素材API        |
| API Demo页面       | `src/app/[locale]/demo/api-demo.tsx`                         | 2天        | 后端API        |

### 后端开发任务

| 功能模块        | 开发工作量 | 描述                            |
| --------------- | ---------- | ------------------------------- |
| 智能提示词API   | 4天        | 集成AI服务，提示词生成和优化    |
| 提示词管理API   | 3天        | CRUD操作，分类标签管理          |
| 素材管理API扩展 | 3天        | 基于现有Asset系统的ASMR专用功能 |
| AI图片生成API   | 2天        | Pollinations.AI集成和图片管理   |
| 文件上传处理    | 2天        | 音频文件处理和格式转换          |
| 搜索和推荐      | 3天        | 智能搜索和推荐算法              |
| API Demo接口    | 1天        | 演示用API端点                   |

### 数据库架构调整

#### 新增表结构

```sql
-- 智能提示词表
CREATE TABLE ai_prompt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags JSON,
    is_public BOOLEAN DEFAULT false,
    is_ai_generated BOOLEAN DEFAULT false,
    generation_params JSON,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 提示词标签表
CREATE TABLE prompt_tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    color VARCHAR(7) DEFAULT '#3B82F6',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 提示词标签关联表
CREATE TABLE prompt_tag_relation (
    prompt_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    PRIMARY KEY (prompt_id, tag_id),
    FOREIGN KEY (prompt_id) REFERENCES ai_prompt(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES prompt_tag(id) ON DELETE CASCADE
);

-- 扩展现有Asset表，增加ASMR专用字段
ALTER TABLE asset ADD COLUMN audio_duration INTEGER;
ALTER TABLE asset ADD COLUMN audio_format VARCHAR(10);
ALTER TABLE asset ADD COLUMN audio_quality VARCHAR(20);
ALTER TABLE asset ADD COLUMN waveform_data TEXT;
ALTER TABLE asset ADD COLUMN usage_count INTEGER DEFAULT 0;

-- AI生成图片元数据表
CREATE TABLE ai_generated_image (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL,
    prompt TEXT NOT NULL,
    seed INTEGER NOT NULL,
    generation_url TEXT NOT NULL,
    pollinations_params JSON,
    generated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (asset_id) REFERENCES asset(id) ON DELETE CASCADE
);
```

#### 枚举类型扩展

```typescript
// 扩展AssetType枚举
export enum AssetType {
	BACKGROUND_IMAGE = 'background_image',
	BACKGROUND_VIDEO = 'background_video',
	NARRATION_AUDIO = 'narration_audio',
	BGM_AUDIO = 'bgm_audio',
	TEXT_CONTENT = 'text_content',
	SUBTITLE_FILE = 'subtitle_file',
	WATERMARK_IMAGE = 'watermark_image',
	// 新增ASMR专用类型
	ASMR_NATURAL_SOUND = 'asmr_natural_sound',
	ASMR_WHITE_NOISE = 'asmr_white_noise',
	ASMR_AMBIENT_SOUND = 'asmr_ambient_sound',
	ASMR_VOICE_SAMPLE = 'asmr_voice_sample',
	// 新增AI生成图片类型
	AI_GENERATED_IMAGE = 'ai_generated_image',
}

// 新增提示词分类枚举
export enum PromptCategory {
	SLEEP_GUIDANCE = 'sleep_guidance',
	MEDITATION = 'meditation',
	RELAXATION = 'relaxation',
	FOCUS_ENHANCEMENT = 'focus_enhancement',
	NATURE_IMMERSION = 'nature_immersion',
	HEALING_THERAPY = 'healing_therapy',
	CUSTOM = 'custom',
}
```

## 用户体验改进

### 智能化交互设计

1. **AI助手交互**:
   - 对话式界面，自然语言交互
   - 实时预览和调整建议
   - 学习用户偏好，个性化推荐
   - 错误处理和重试机制

2. **素材管理优化**:
   - 拖拽式上传，进度可视化
   - 音频波形实时预览
   - 智能分类建议
   - 批量操作和快捷键支持

3. **生成流程优化**:
   - 无缝集成，不破坏现有流程
   - 智能建议和自动填充
   - 历史记录和快速重复使用
   - 错误预防和提示

### 中老年用户友好设计

1. **界面简化**:
   - 大按钮和清晰图标
   - 高对比度和大字体
   - 简化的操作流程
   - 详细的帮助提示

2. **智能辅助**:
   - 语音输入支持
   - 自动保存和恢复
   - 智能推荐减少选择负担
   - 操作引导和教程

## 验收标准

### 功能验收

**智能提示词管理**

- [ ] AI生成功能正常工作，生成质量符合预期
- [ ] 润色优化功能有效，提升内容质量
- [ ] 分类标签系统完整，支持多维度查询
- [ ] 提示词库管理功能完善，支持CRUD操作
- [ ] 与现有Template系统兼容

**ASMR素材管理**

- [ ] 音频文件上传和处理正常
- [ ] 素材分类和搜索功能有效
- [ ] 音频预览和波形显示正确
- [ ] 与阿里云盘WebDAV集成稳定
- [ ] 素材质量分析准确

**生成流程集成**

- [ ] Step1智能助手集成无缝
- [ ] Step3素材选择功能完善
- [ ] 不影响现有生成流程
- [ ] API Demo功能正常
- [ ] 用户体验流畅自然

### 性能验收

- [ ] AI生成响应时间 < 5秒
- [ ] 素材上传支持大文件和断点续传
- [ ] 音频预览加载时间 < 2秒
- [ ] 页面加载时间 < 3秒
- [ ] 并发用户支持 > 100人

### 安全验收

- [ ] 用户数据隔离和权限控制
- [ ] AI服务调用安全和限流
- [ ] 文件上传安全检查
- [ ] 敏感信息加密存储
- [ ] API接口安全认证

## 风险评估与缓解

### 技术风险

**风险1: AI服务集成复杂度**

- **描述**: GPT/Claude API集成可能面临调用限制、成本控制等问题
- **缓解**: 实现多AI服务适配器，支持服务切换和降级方案

**风险2: 音频处理性能**

- **描述**: 大量音频文件处理可能影响系统性能
- **缓解**: 异步处理架构，引入队列和缓存机制

**风险3: 数据库性能**

- **描述**: 新增表和复杂查询可能影响数据库性能
- **缓解**: 合理设计索引，实现读写分离

### 产品风险

**风险1: 用户接受度**

- **描述**: 新功能可能增加学习成本
- **缓解**: 渐进式功能发布，完善用户引导

**风险2: 内容质量控制**

- **描述**: AI生成内容质量可能不稳定
- **缓解**: 内容审核机制，用户反馈优化

### 运营风险

**风险1: AI服务成本**

- **描述**: 大量AI调用可能产生高额费用
- **缓解**: 实现使用量监控和智能缓存

**风险2: 存储成本**

- **描述**: 音频素材存储可能产生高成本
- **缓解**: 智能压缩和生命周期管理

## 实施计划

### 第一阶段: 核心功能开发 (Week 1-3)

**Week 1: 后端基础架构**

- 数据库表结构设计和迁移
- 基础API接口开发
- AI服务集成框架搭建

**Week 2: 前端核心组件**

- 智能提示词管理页面开发
- 素材管理页面开发
- 基础UI组件库扩展

**Week 3: 功能集成**

- 生成流程集成开发
- API Demo页面开发
- 单元测试和集成测试

### 第二阶段: 功能完善 (Week 4-5)

**Week 4: 高级功能**

- AI润色优化功能
- 智能推荐系统
- 音频处理和分析

**Week 5: 用户体验优化**

- 界面优化和交互改进
- 性能优化和错误处理
- 帮助文档和用户引导

### 第三阶段: 测试发布 (Week 6-7)

**Week 6: 全面测试**

- 功能测试和性能测试
- 用户验收测试
- 安全测试和渗透测试

**Week 7: 发布准备**

- 生产环境部署
- 监控和日志配置
- 用户培训和文档更新

### 第四阶段: 监控优化 (Week 8)

- 生产环境监控
- 用户反馈收集
- 性能调优和问题修复
- 下一版本规划

## 成功指标

### 用户指标

- **功能采用率**: 新功能使用率 > 60%
- **内容质量**: AI生成内容满意度 > 85%
- **创作效率**: 平均创作时间减少 > 40%
- **用户留存**: 月活跃用户增长 > 25%

### 技术指标

- **系统性能**: 平均响应时间 < 2秒
- **稳定性**: 系统可用性 > 99.5%
- **资源利用**: 服务器资源利用率 < 70%
- **成本控制**: AI服务成本控制在预算内

### 业务指标

- **用户满意度**: NPS分数 > 70
- **创作产出**: 平均每用户创作数量增长 > 50%
- **素材利用**: 素材库使用率 > 80%
- **运营效率**: 客服工单减少 > 30%

## 变更批准

- **产品负责人**: **\_\_\_\_** 日期: **\_\_\_\_**
- **技术负责人**: **\_\_\_\_** 日期: **\_\_\_\_**
- **设计负责人**: **\_\_\_\_** 日期: **\_\_\_\_**
- **运营负责人**: **\_\_\_\_** 日期: **\_\_\_\_**

---

**变更状态**: 待审批  
**最后更新**: 2025-01-14  
**文档版本**: v1.0  
**关联文档**: RCR-001 (侧边栏导航架构重构)
