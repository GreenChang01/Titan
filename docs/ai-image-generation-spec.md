# AI图片生成功能详细规格

## 1. 功能概述

基于用户的文本描述，使用Pollinations.AI生成ASMR场景相关的图片素材，并集成到现有的素材管理系统中。

## 2. 技术架构

### 2.1 API服务选择
- **服务**: Pollinations.AI (https://image.pollinations.ai/)
- **优势**: 免费、无需API Key、支持中英文、无水印选项
- **限制**: 生成速度相对较慢，图片质量中等

### 2.2 URL构建规则
```
https://image.pollinations.ai/prompt/{encoded_prompt}?seed={random_seed}&nologo=true
```

### 2.3 生成参数
- `prompt`: URL编码的提示词
- `seed`: 随机种子 (1-10000)
- `nologo`: 无水印选项
- `width`: 图片宽度 (默认1024)
- `height`: 图片高度 (默认1024)

## 3. 数据库设计

### 3.1 扩展Asset表
```sql
-- 现有Asset表已存在，添加AI生成相关字段
ALTER TABLE asset ADD COLUMN is_ai_generated BOOLEAN DEFAULT false;
ALTER TABLE asset ADD COLUMN ai_generation_prompt TEXT;
ALTER TABLE asset ADD COLUMN ai_generation_seed INTEGER;
ALTER TABLE asset ADD COLUMN ai_generation_url TEXT;
ALTER TABLE asset ADD COLUMN ai_generation_params JSON;
```

### 3.2 AI生成记录表
```sql
CREATE TABLE ai_image_generation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    asset_id UUID,
    prompt TEXT NOT NULL,
    seed INTEGER NOT NULL,
    generation_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (asset_id) REFERENCES asset(id)
);
```

## 4. 前端组件设计

### 4.1 AI图片生成器组件
```typescript
// apps/nextjs-frontend/src/components/ai-image/ai-image-generator.tsx
interface AIImageGeneratorProps {
  onGenerated: (asset: Asset) => void;
  projectId?: string;
}

const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({ onGenerated, projectId }) => {
  // 提示词输入
  // 预设提示词模板
  // 生成参数设置
  // 生成进度显示
  // 生成历史记录
};
```

### 4.2 AI图片管理器组件
```typescript
// apps/nextjs-frontend/src/components/ai-image/ai-image-manager.tsx
interface AIImageManagerProps {
  userId: string;
  onSelect?: (asset: Asset) => void;
}

const AIImageManager: React.FC<AIImageManagerProps> = ({ userId, onSelect }) => {
  // AI生成图片列表
  // 重新生成功能
  // 参数查看功能
  // 分类管理
};
```

## 5. 后端API设计

### 5.1 生成API端点
```typescript
// POST /api/ai-image/generate
interface GenerateImageRequest {
  prompt: string;
  seed?: number;
  width?: number;
  height?: number;
  projectId?: string;
  category?: string;
}

interface GenerateImageResponse {
  id: string;
  generationUrl: string;
  assetId?: string;
  status: 'pending' | 'completed' | 'failed';
  estimatedTime: number;
}
```

### 5.2 管理API端点
```typescript
// GET /api/ai-image/history
// GET /api/ai-image/:id/status
// POST /api/ai-image/:id/retry
// DELETE /api/ai-image/:id
```

## 6. 预设提示词模板

### 6.1 ASMR场景模板
```typescript
const ASMR_TEMPLATES = {
  nature: {
    title: "自然景观",
    templates: [
      "peaceful forest stream with soft sunlight filtering through trees",
      "tranquil mountain lake reflecting clouds at sunset",
      "gentle rainfall on green leaves in a serene garden"
    ]
  },
  cozy: {
    title: "温馨环境", 
    templates: [
      "warm fireplace with soft candlelight in a cozy room",
      "comfortable reading nook with soft blankets and dim lighting",
      "peaceful bedroom with soft morning light through curtains"
    ]
  },
  abstract: {
    title: "抽象艺术",
    templates: [
      "soft flowing waves in calming blue and purple tones",
      "gentle abstract patterns in warm earth colors",
      "peaceful geometric shapes with soft gradients"
    ]
  }
};
```

## 7. 实现优先级

### Phase 1: 基础生成功能 (3天)
- [ ] 基础AI图片生成组件
- [ ] Pollinations.AI集成
- [ ] 简单的提示词输入界面
- [ ] 生成结果显示

### Phase 2: 素材管理集成 (2天)
- [ ] 与Asset系统集成
- [ ] AI生成图片分类标识
- [ ] 生成历史记录
- [ ] 重新生成功能

### Phase 3: 用户体验优化 (2天)
- [ ] 预设提示词模板
- [ ] 生成参数调整
- [ ] 批量生成功能
- [ ] 错误处理和重试

## 8. 集成点

### 8.1 素材管理系统集成
- AI生成的图片作为特殊类型的Asset
- 在AssetType枚举中添加AI_GENERATED_IMAGE
- 在素材列表中用特殊标识区分AI生成图片

### 8.2 项目管理集成
- 在项目素材管理中添加AI生成入口
- 生成的图片自动关联到当前项目
- 支持在项目中直接使用AI生成图片

## 9. 用户界面设计

### 9.1 生成界面布局
```
┌─────────────────────────────────────────────────────┐
│ AI图片生成器                           [关闭] │
├─────────────────────────────────────────────────────┤
│ 描述你想要的图片内容：                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 一个宁静的森林小溪，阳光透过树叶洒下...      │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ 快速模板：                                        │
│ [自然风景] [温馨环境] [抽象艺术] [更多...]        │
│                                                     │
│ 高级设置：                                        │
│ 尺寸: [1024x1024] 种子: [随机] [生成] │
└─────────────────────────────────────────────────────┘
```

### 9.2 结果展示界面
```
┌─────────────────────────────────────────────────────┐
│ 生成结果                                          │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────┐ 提示词：宁静的森林小溪...      │
│ │                 │ 种子：1234                     │
│ │   生成的图片    │ 生成时间：2025-01-14 10:30    │
│ │                 │                               │
│ │                 │ [保存到项目] [重新生成] [删除] │
│ └─────────────────┘                               │
└─────────────────────────────────────────────────────┘
```

## 10. 错误处理

### 10.1 生成失败处理
- 网络错误重试机制
- 生成超时处理
- 不当内容提示
- 用户友好的错误信息

### 10.2 存储失败处理
- 阿里云盘上传失败重试
- 本地缓存机制
- 数据库保存失败回滚

## 11. 性能优化

### 11.1 前端优化
- 图片预览懒加载
- 生成进度实时更新
- 结果缓存机制

### 11.2 后端优化
- 异步生成处理
- 批量操作支持
- 合理的数据库索引

## 12. 安全考虑

### 12.1 输入验证
- 提示词长度限制
- 敏感词过滤
- 频率限制

### 12.2 数据安全
- 用户隔离
- 生成记录隐私保护
- 图片存储安全

## 13. 监控和日志

### 13.1 关键指标
- 生成成功率
- 平均生成时间
- 用户使用频率
- 错误类型统计

### 13.2 日志记录
- 生成请求日志
- 错误详情记录
- 性能指标追踪

## 14. 未来扩展

### 14.1 功能扩展
- 支持更多AI图片生成服务
- 图片编辑功能
- 风格迁移功能
- 批量生成优化

### 14.2 技术扩展
- 本地AI模型集成
- 更高质量的生成服务
- 实时生成预览
- 智能提示词优化

---

*此规格文档用于指导AI图片生成功能的开发实现，确保功能简单易用且与现有系统完美集成。*