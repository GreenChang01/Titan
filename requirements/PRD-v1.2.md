# PRD: Titan | 智能提示词与素材管理系统 v1.2

## 文档信息

- **版本**: 1.2
- **状态**: 草案
- **创建日期**: 2025-07-14
- **最后更新**: 2025-07-14
- **产品负责人**: 产品团队
- **关联变更单**: [RCR-002: 智能提示词与素材管理系统](../docs/requirements-change-002-prompt-and-material-management.md)

---

## 1. 产品概述 (Product Overview)

### 1.1 背景与价值

随着ASMR内容创作市场的快速发展，现有平台在提示词创作效率和素材管理方面暴露了明显的短板。创作者普遍面临从零开始编写提示词、缺乏AI辅助优化、无法有效复用优质内容以及素材管理混乱等问题。这些问题直接导致了创作效率低下、内容质量不稳定，并增加了用户流失的风险。

V1.2版本旨在通过引入**智能提示词管理系统**和**ASMR专用素材管理系统**，解决以上痛点，核心价值在于：

- **提升创作效率**: 通过AI生成、优化和模板化管理，将创作者从繁琐的提示词编写中解放出来。
- **保证内容质量**: 利用AI润色和专业的素材管理，确保产出内容的专业性和一致性。
- **优化用户体验**: 无缝集成的智能工具和素材库，简化创作流程，降低使用门槛。
- **降低运营成本**: 实现优质提示词和素材的沉淀与复用，提升平台运营效率。

### 1.2 V1.2 核心目标

1.  **构建智能提示词生态**: 实现从AI生成、AI优化、分类管理到库共享的提示词全生命周期管理。
2.  **建立专业素材管理体系**: 提供ASMR专用的音频素材上传、分类、预览、分析和管理功能。
3.  **无缝集成创作流程**: 将智能提示词和自定义素材库深度集成到现有的ASMR生成流程中。
4.  **增强用户友好性**: 针对中老年用户进行界面和交互优化，提供更智能、更便捷的辅助功能。

---

## 2. 功能需求 (Functional Requirements)

### 2.1 智能提示词管理系统 (Prompt Management System)

#### 2.1.1 核心功能

| 功能模块           | 详细描述                                                                                                                               | 优先级 |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| **AI提示词生成器** | - 基于主题、情感、时长等参数生成ASMR提示词<br>- 支持快速、详细、定制化生成模式<br>- 集成GPT/Claude等AI服务<br>- 提供生成历史与版本管理 | **高** |
| **AI润色优化引擎** | - 对用户输入或AI生成的提示词进行智能优化<br>- 提供固定的优化模板（初期）<br>- 支持多种语言风格调整<br>- 预留动态配置接口（后期）       | **高** |
| **分类与标签管理** | - 支持多级分类（主题、情感、时长）<br>- 智能标签生成与手动管理<br>- 支持标签的搜索、筛选与组合查询                                     | **高** |
| **提示词库管理**   | - 个人库：收藏、编辑、删除<br>- 公共库：系统预设、社区分享<br>- 支持评分、使用统计、批量导入导出                                       | **中** |

#### 2.1.2 用户界面与流程

**主界面结构:**

```
📝 智能提示词管理
   ├─ 🎯 快速生成 (AI助手快速创建)
   ├─ 📚 我的提示词 (个人提示词库)
   ├─ 🌟 精选模板 (公共优质模板)
   ├─ 🏷️ 标签管理 (分类标签系统)
   └─ 📊 使用统计 (效果分析)
```

**核心操作流程:**

1.  **快速生成**: 输入关键词 → AI生成 → 一键润色 → 保存使用
2.  **模板选择**: 浏览分类 → 选择模板 → 个性化调整 → 应用
3.  **手动创作**: 自由输入 → AI润色建议 → 标签分类 → 保存

### 2.2 ASMR专用素材管理系统 (Material Management System)

#### 2.2.1 核心功能

| 功能模块           | 详细描述                                                                                                                               | 优先级 |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| **素材上传与处理** | - 支持MP3, WAV, FLAC, M4A等多种音频格式<br>- 集成阿里云盘WebDAV，支持大文件上传<br>- 音频格式自动转换与质量优化                        | **高** |
| **素材分类与管理** | - 智能分类：自然音、白噪音、环境音、人声<br>- 支持自定义分类标签<br>- 管理素材元数据（时长、格式、来源）<br>- 音频波形预览与关键帧提取 | **高** |
| **素材库浏览器**   | - 网格/列表视图切换<br>- 音频波形可视化预览<br>- 实时搜索与多维度筛选<br>- 素材收藏与播放列表管理                                      | **高** |
| **素材质量分析**   | - 自动检测音频质量（采样率、比特率）<br>- 音频内容分析（音量、频谱）<br>- 提供使用建议和优化提示                                       | **中** |

#### 2.2.2 用户界面与流程

**主界面结构:**

```
🎵 ASMR素材管理
   ├─ 📁 素材库 (分类浏览)
   ├─ ⬆️ 上传中心 (批量上传)
   ├─ 🔍 智能搜索 (多维筛选)
   ├─ ⭐ 我的收藏 (常用素材)
   └─ 📈 使用统计 (效果分析)
```

**素材卡片设计:**

- 包含波形缩略图、基本信息、操作按钮。
- 支持悬停预览播放和快速添加到项目。

### 2.3 生成流程集成 (Generation Workflow Integration)

#### 2.3.1 Step1 - 内容创作增强

- **AI助手集成**: 在内容输入框旁添加"AI助手"按钮，提供弹窗式智能生成面板。
- **模板快速应用**: 扩展现有模板功能，集成新提示词库，支持按分类浏览和预览。

#### 2.3.2 Step3 - 音景选择增强

- **自定义素材库**: 在音景选择中增加"我的素材"标签页，展示用户上传的素材。
- **智能推荐系统**: 基于文本内容和用户偏好，推荐匹配的音景素材。

#### 2.3.3 API Demo验证

- 创建独立的API测试页面，用于演示和验证素材生成API的完整流程。

---

## 3. 技术实现规格 (Technical Specifications)

### 3.1 数据库架构变更

#### 3.1.1 新增表结构

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
```

#### 3.1.2 `asset` 表扩展

```sql
-- 扩展现有Asset表，增加ASMR专用字段
ALTER TABLE asset ADD COLUMN audio_duration INTEGER;
ALTER TABLE asset ADD COLUMN audio_format VARCHAR(10);
ALTER TABLE asset ADD COLUMN audio_quality VARCHAR(20);
ALTER TABLE asset ADD COLUMN waveform_data TEXT;
ALTER TABLE asset ADD COLUMN usage_count INTEGER DEFAULT 0;
```

#### 3.1.3 枚举类型扩展

```typescript
// 扩展AssetType枚举
export enum AssetType {
	// ... 现有类型
	ASMR_NATURAL_SOUND = 'asmr_natural_sound',
	ASMR_WHITE_NOISE = 'asmr_white_noise',
	ASMR_AMBIENT_SOUND = 'asmr_ambient_sound',
	ASMR_VOICE_SAMPLE = 'asmr_voice_sample',
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

### 3.2 API 扩展

| 功能模块            | 开发工作量 | 描述                                       |
| :------------------ | :--------- | :----------------------------------------- |
| **智能提示词API**   | 4天        | 集成AI服务，负责提示词的生成和优化。       |
| **提示词管理API**   | 3天        | 提供提示词的CRUD操作及分类标签管理。       |
| **素材管理API扩展** | 3天        | 在现有Asset系统基础上，增加ASMR专用功能。  |
| **文件上传处理**    | 2天        | 负责音频文件的处理、格式转换和元数据提取。 |
| **搜索与推荐API**   | 3天        | 实现提示词和素材的智能搜索与推荐算法。     |
| **API Demo接口**    | 1天        | 提供用于前端演示的专用API端点。            |

### 3.3 前端组件开发

| 组件               | 文件路径                                                     | 开发工作量 |
| :----------------- | :----------------------------------------------------------- | :--------- |
| 智能提示词管理页面 | `src/app/[locale]/prompts/page.tsx`                          | 6天        |
| 提示词生成器组件   | `src/components/prompts/prompt-generator.tsx`                | 4天        |
| 提示词库浏览器     | `src/components/prompts/prompt-library.tsx`                  | 3天        |
| ASMR素材管理页面   | `src/app/[locale]/materials/page.tsx`                        | 5天        |
| 素材浏览器组件     | `src/components/materials/material-browser.tsx`              | 4天        |
| 素材上传组件       | `src/components/materials/material-uploader.tsx`             | 3天        |
| Step1增强          | `src/app/[locale]/generate/_components/step1-content.tsx`    | 2天        |
| Step3增强          | `src/app/[locale]/generate/_components/step3-soundscape.tsx` | 2天        |
| API Demo页面       | `src/app/[locale]/demo/api-demo.tsx`                         | 2天        |

---

## 4. 验收标准 (Acceptance Criteria)

### 4.1 功能验收

- **智能提示词**: AI生成、润色、分类、库管理功能完整可用，并与Template系统兼容。
- **ASMR素材管理**: 音频上传、处理、分类、搜索、预览功能正常，WebDAV集成稳定。
- **生成流程集成**: Step1和Step3的增强功能无缝集成，不影响现有流程，API Demo正常工作。

### 4.2 性能验收

- AI生成响应时间 < 5秒。
- 音频预览加载时间 < 2秒。
- 页面加载时间 < 3秒。
- 支持 > 100人并发使用。

### 4.3 安全验收

- 用户数据隔离，API接口认证和限流。
- AI服务调用安全，文件上传经过安全检查。
- 敏感信息加密存储。

---

## 5. 实施计划与风险

### 5.1 实施计划

- **第一阶段 (Week 1-3)**: 核心功能开发（后端基础、前端核心组件、功能集成）。
- **第二阶段 (Week 4-5)**: 功能完善（高级功能、用户体验优化）。
- **第三阶段 (Week 6-7)**: 测试发布（全面测试、发布准备）。
- **第四阶段 (Week 8)**: 监控优化（生产监控、反馈收集）。

### 5.2 风险评估

| 风险类型     | 风险描述                                       | 缓解措施                                             |
| :----------- | :--------------------------------------------- | :--------------------------------------------------- |
| **技术风险** | AI服务集成复杂度高，音频处理可能存在性能瓶颈。 | 实现多AI服务适配器，采用异步处理架构。               |
| **产品风险** | 新功能可能增加用户学习成本，AI内容质量不稳定。 | 渐进式发布，完善用户引导，建立内容审核机制。         |
| **运营风险** | AI服务和存储成本可能超出预算。                 | 实现用量监控和智能缓存，采用智能压缩和生命周期管理。 |
