# Titan v1.2 共享包开发指南

## 概述

Titan v1.2 共享包为前后端提供共享的类型定义、验证模式和工具函数，支持智能提示管理和ASMR素材管理的新功能。

## 核心架构

### 1. 类型定义扩展

#### 1.1 智能提示管理类型

```typescript
// types/prompt.types.ts
export interface AIPrompt {
	id: string;
	name: string;
	content: string;
	category: PromptCategory;
	tags: string[];
	metadata: PromptMetadata;
	usageCount: number;
	effectiveness: number; // 0-100 effectiveness score
	createdAt: Date;
	updatedAt: Date;
}

export interface PromptCategory {
	id: string;
	name: string;
	description: string;
	icon?: string;
}

export interface PromptMetadata {
	aiModel: 'openai' | 'claude' | 'custom';
	tokens?: number;
	temperature?: number;
	maxTokens?: number;
	variables: PromptVariable[];
	examples: PromptExample[];
}

export interface PromptVariable {
	name: string;
	description: string;
	type: 'string' | 'number' | 'boolean' | 'select';
	required: boolean;
	defaultValue?: any;
	options?: string[];
}

export interface PromptExample {
	title: string;
	description: string;
	variables: Record<string, any>;
	expectedOutput: string;
}

export interface PromptOptimizationRequest {
	promptId: string;
	criteria: OptimizationCriteria[];
	testCases: TestCase[];
}

export interface OptimizationCriteria {
	metric: 'clarity' | 'specificity' | 'creativity' | 'efficiency';
	weight: number;
}

export interface TestCase {
	name: string;
	variables: Record<string, any>;
	expectedQuality: number;
}
```

#### 1.2 ASMR素材管理类型

```typescript
// types/asmr-material.types.ts
export interface ASMRAsset {
	id: string;
	name: string;
	type: ASMRAssetType;
	category: string;
	fileUrl: string;
	fileSize: number;
	duration?: number; // seconds for audio/video
	metadata: ASMRAssetMetadata;
	tags: string[];
	webdavPath?: string;
	projectId?: string;
	createdAt: Date;
	updatedAt: Date;
}

export type ASMRAssetType = 'audio' | 'video' | 'image' | 'text' | 'voice_sample';

export interface ASMRAssetMetadata {
	format: string;
	bitrate?: number;
	sampleRate?: number;
	channels?: number;
	dimensions?: {
		width: number;
		height: number;
	};
	duration?: number;
	fileHash: string;
	aiGenerated: boolean;
	generationParams?: GenerationParams;
}

export interface GenerationParams {
	model?: string;
	prompt?: string;
	settings?: Record<string, any>;
}

export interface ASMRAssetUploadRequest {
	file: File;
	type: ASMRAssetType;
	category: string;
	tags: string[];
	projectId?: string;
	metadata?: Partial<ASMRAssetMetadata>;
}

export interface ASMRAssetSearchParams {
	type?: ASMRAssetType;
	category?: string;
	tags?: string[];
	projectId?: string;
	aiGenerated?: boolean;
	searchTerm?: string;
	page: number;
	limit: number;
}
```

#### 1.3 API响应类型

```typescript
// types/api.types.ts
export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface APIResponse<T = any> {
	success: boolean;
	data?: T;
	error?: APIError;
	message?: string;
}

export interface APIError {
	code: string;
	message: string;
	details?: Record<string, any>;
}

// v1.2 新增API响应类型
export interface PromptListResponse extends PaginatedResponse<AIPrompt> {}
export interface AssetListResponse extends PaginatedResponse<ASMRAsset> {}

export interface PromptGenerationResponse {
	prompt: AIPrompt;
	generatedContent: string;
	tokensUsed: number;
	cost: number;
}

export interface AssetUploadResponse {
	asset: ASMRAsset;
	uploadUrl?: string;
	uploadId?: string;
}
```

### 2. 验证模式

#### 2.1 智能提示验证

```typescript
// validation/prompt.validation.ts
import {z} from 'zod';

export const promptVariableSchema = z.object({
	name: z.string().min(1).max(50),
	description: z.string().min(10).max(500),
	type: z.enum(['string', 'number', 'boolean', 'select']),
	required: z.boolean(),
	defaultValue: z.any().optional(),
	options: z.array(z.string()).optional(),
});

export const promptExampleSchema = z.object({
	title: z.string().min(1).max(100),
	description: z.string().min(10).max(500),
	variables: z.record(z.any()),
	expectedOutput: z.string().min(1),
});

export const promptMetadataSchema = z.object({
	aiModel: z.enum(['openai', 'claude', 'custom']),
	tokens: z.number().positive().optional(),
	temperature: z.number().min(0).max(2).optional(),
	maxTokens: z.number().positive().optional(),
	variables: z.array(promptVariableSchema),
	examples: z.array(promptExampleSchema),
});

export const createPromptSchema = z.object({
	name: z.string().min(1).max(100),
	content: z.string().min(10).max(10000),
	categoryId: z.string().uuid(),
	tags: z.array(z.string()).max(10),
	metadata: promptMetadataSchema,
});

export const updatePromptSchema = createPromptSchema.partial();

export const promptOptimizationSchema = z.object({
	promptId: z.string().uuid(),
	criteria: z
		.array(
			z.object({
				metric: z.enum(['clarity', 'specificity', 'creativity', 'efficiency']),
				weight: z.number().min(0).max(1),
			}),
		)
		.min(1),
	testCases: z
		.array(
			z.object({
				name: z.string().min(1),
				variables: z.record(z.any()),
				expectedQuality: z.number().min(1).max(100),
			}),
		)
		.min(1),
});
```

#### 2.2 ASMR素材验证

```typescript
// validation/asmr-material.validation.ts
import {z} from 'zod';

export const asmrAssetTypeSchema = z.enum(['audio', 'video', 'image', 'text', 'voice_sample']);

export const asmrAssetMetadataSchema = z.object({
	format: z.string().min(1),
	bitrate: z.number().positive().optional(),
	sampleRate: z.number().positive().optional(),
	channels: z.number().positive().optional(),
	dimensions: z
		.object({
			width: z.number().positive(),
			height: z.number().positive(),
		})
		.optional(),
	duration: z.number().positive().optional(),
	fileHash: z.string().min(32),
	aiGenerated: z.boolean(),
	generationParams: z
		.object({
			model: z.string().optional(),
			prompt: z.string().optional(),
			settings: z.record(z.any()).optional(),
		})
		.optional(),
});

export const createAssetSchema = z.object({
	name: z.string().min(1).max(200),
	type: asmrAssetTypeSchema,
	category: z.string().min(1).max(50),
	tags: z.array(z.string()).max(20),
	projectId: z.string().uuid().optional(),
	metadata: asmrAssetMetadataSchema.optional(),
});

export const uploadAssetSchema = z.object({
	file: z.any().refine((file) => file instanceof File || file instanceof Buffer, '必须提供文件'),
	type: asmrAssetTypeSchema,
	category: z.string().min(1).max(50),
	tags: z.array(z.string()).max(20),
	projectId: z.string().uuid().optional(),
	metadata: z
		.object({
			format: z.string().optional(),
			aiGenerated: z.boolean().optional(),
		})
		.optional(),
});

export const assetSearchSchema = z.object({
	type: asmrAssetTypeSchema.optional(),
	category: z.string().optional(),
	tags: z.array(z.string()).optional(),
	projectId: z.string().uuid().optional(),
	aiGenerated: z.boolean().optional(),
	searchTerm: z.string().optional(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
});
```

### 3. 工具函数

#### 3.1 智能提示工具

```typescript
// utils/prompt.utils.ts
import {AIPrompt, PromptVariable} from '../types/prompt.types';

/**
 * 渲染提示模板
 */
export function renderPromptTemplate(template: string, variables: Record<string, any>): string {
	let rendered = template;

	for (const [key, value] of Object.entries(variables)) {
		const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
		rendered = rendered.replace(placeholder, String(value));
	}

	return rendered;
}

/**
 * 验证提示变量
 */
export function validatePromptVariables(
	variables: PromptVariable[],
	values: Record<string, any>,
): {valid: boolean; errors: string[]} {
	const errors: string[] = [];

	for (const variable of variables) {
		const value = values[variable.name];

		if (variable.required && (value === undefined || value === null)) {
			errors.push(`变量 ${variable.name} 是必填的`);
			continue;
		}

		if (value !== undefined) {
			switch (variable.type) {
				case 'string':
					if (typeof value !== 'string') {
						errors.push(`变量 ${variable.name} 必须是字符串`);
					}
					break;
				case 'number':
					if (typeof value !== 'number' || isNaN(value)) {
						errors.push(`变量 ${variable.name} 必须是数字`);
					}
					break;
				case 'boolean':
					if (typeof value !== 'boolean') {
						errors.push(`变量 ${variable.name} 必须是布尔值`);
					}
					break;
				case 'select':
					if (!variable.options?.includes(String(value))) {
						errors.push(`变量 ${variable.name} 必须是允许的值之一: ${variable.options?.join(', ')}`);
					}
					break;
			}
		}
	}

	return {valid: errors.length === 0, errors};
}

/**
 * 计算提示有效性分数
 */
export function calculatePromptEffectiveness(
	prompt: AIPrompt,
	usageStats: {
		totalUses: number;
		successfulUses: number;
		averageRating?: number;
	},
): number {
	const {totalUses, successfulUses, averageRating = 3} = usageStats;

	if (totalUses === 0) return 0;

	const successRate = successfulUses / totalUses;
	const ratingScore = averageRating / 5; // Normalize to 0-1

	// 加权计算
	return Math.round((successRate * 0.7 + ratingScore * 0.3) * 100);
}

/**
 * 生成提示摘要
 */
export function generatePromptSummary(prompt: AIPrompt): string {
	const content = prompt.content;
	const maxLength = 100;

	if (content.length <= maxLength) return content;

	return content.substring(0, maxLength).trim() + '...';
}
```

#### 3.2 ASMR素材工具

```typescript
// utils/asmr-material.utils.ts
import {ASMRAsset, ASMRAssetType} from '../types/asmr-material.types';

/**
 * 获取文件类型对应的MIME类型
 */
export function getMimeTypeForAssetType(type: ASMRAssetType): string {
	const mimeTypes: Record<ASMRAssetType, string> = {
		audio: 'audio/*',
		video: 'video/*',
		image: 'image/*',
		text: 'text/*',
		voice_sample: 'audio/*',
	};

	return mimeTypes[type];
}

/**
 * 验证文件扩展名
 */
export function validateFileExtension(filename: string, type: ASMRAssetType): boolean {
	const extensions: Record<ASMRAssetType, string[]> = {
		audio: ['.mp3', '.wav', '.flac', '.aac', '.ogg'],
		video: ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
		image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
		text: ['.txt', '.md', '.json', '.xml'],
		voice_sample: ['.mp3', '.wav', '.flac', '.aac'],
	};

	const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
	return extensions[type].includes(fileExtension);
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 B';

	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化持续时间
 */
export function formatDuration(seconds?: number): string {
	if (!seconds) return '未知';

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 生成文件哈希
 */
export async function generateFileHash(file: File | Buffer): Promise<string> {
	const crypto = await import('crypto');
	const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

	return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * 分类ASMR素材
 */
export function categorizeASMRAsset(filename: string, metadata?: any): string {
	const name = filename.toLowerCase();

	// 基于文件名和元数据自动分类
	if (name.includes('rain') || name.includes('雨')) return '自然环境';
	if (name.includes('whisper') || name.includes('耳语')) return '人声';
	if (name.includes('typing') || name.includes('键盘')) return '操作音';
	if (name.includes('fire') || name.includes('火焰')) return '环境音';
	if (name.includes('music') || name.includes('音乐')) return '背景音乐';

	return '其他';
}
```

### 4. 常量定义

```typescript
// constants/index.ts
export const PROMPT_CATEGORIES = [
	{id: 'content-creation', name: '内容创作', description: '用于创作ASMR内容的提示'},
	{id: 'voice-generation', name: '语音生成', description: '用于生成语音的提示'},
	{id: 'soundscape', name: '音景设计', description: '用于设计背景音景的提示'},
	{id: 'storytelling', name: '故事叙述', description: '用于创作ASMR故事的提示'},
	{id: 'meditation', name: '冥想引导', description: '用于冥想引导的提示'},
];

export const ASMR_ASSET_CATEGORIES = ['自然环境', '人声', '操作音', '环境音', '背景音乐', '特效音', '白噪音', '其他'];

export const AI_MODELS = {
	openai: [
		{id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '高性能模型'},
		{id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '快速响应模型'},
	],
	claude: [
		{id: 'claude-3-opus', name: 'Claude 3 Opus', description: '最高智能模型'},
		{id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: '平衡性能模型'},
		{id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: '快速响应模型'},
	],
};

export const FILE_SIZE_LIMITS = {
	audio: 50 * 1024 * 1024, // 50MB
	video: 100 * 1024 * 1024, // 100MB
	image: 10 * 1024 * 1024, // 10MB
	text: 1 * 1024 * 1024, // 1MB
	voice_sample: 20 * 1024 * 1024, // 20MB
};
```

## 开发检查清单

### 类型定义

- [ ] 创建所有新的TypeScript接口
- [ ] 确保类型向后兼容
- [ ] 添加必要的类型守卫

### 验证模式

- [ ] 使用Zod创建所有验证模式
- [ ] 确保验证规则符合业务需求
- [ ] 添加适当的错误消息

### 工具函数

- [ ] 实现所有工具函数
- [ ] 添加单元测试
- [ ] 确保函数有适当的JSDoc注释

### 常量定义

- [ ] 定义所有业务常量
- [ ] 确保常量命名清晰
- [ ] 添加必要的国际化支持

## 集成步骤

1. **构建共享包**

   ```bash
   cd packages/shared
   npm run build
   ```

2. **更新依赖**

   ```bash
   # 在backend和frontend中
   npm update @titan/shared
   ```

3. **验证集成**
   - 运行类型检查: `npm run type-check`
   - 运行测试: `npm run test:unit`
   - 验证导入: 检查所有新类型可以正确导入

## 测试要求

- 所有类型定义必须通过TypeScript编译
- 所有验证模式必须有对应的测试用例
- 工具函数必须有100%测试覆盖率
- 常量定义必须被正确导出和使用

## 性能考虑

- 保持类型定义轻量级
- 避免在共享包中引入重型依赖
- 使用树摇优化确保只导入需要的部分
- 考虑使用const断言优化常量访问
