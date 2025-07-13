/**
 * AI音景生成服务接口
 * 支持自然环境音效、ASMR背景音等
 */

export type SoundscapeOptions = {
	duration: number; // 音频时长(秒)
	category: string; // 音景分类
	intensity: number; // 强度 1-10
	quality: 'standard' | 'high' | 'premium';
	loopable: boolean; // 是否可循环播放
	binauralEnabled?: boolean; // 是否启用双耳处理
	spatialWidth?: number; // 空间宽度 0.5-2.0
};

export type SoundscapeCategory = {
	id: string;
	name: string;
	description: string;
	tags: string[];
	defaultIntensity: number;
	suitableForASMR: boolean;
};

export type SoundscapeGenerationResult = {
	audioBuffer: Buffer;
	metadata: {
		duration: number;
		sampleRate: number;
		format: string;
		size: number;
		provider: string;
		category: string;
		intensity: number;
		cost?: number;
		isLoopable: boolean;
	};
};

/**
 * AI音景提供商接口
 */
export type ISoundscapeProvider = {
	/**
	 * 生成音景
	 * @param prompt 音景描述
	 * @param options 生成选项
	 * @returns 音景生成结果
	 */
	generateSoundscape(prompt: string, options: SoundscapeOptions): Promise<SoundscapeGenerationResult>;

	/**
	 * 获取可用音景分类
	 * @returns 音景分类列表
	 */
	getAvailableCategories(): Promise<SoundscapeCategory[]>;

	/**
	 * 估算生成成本
	 * @param duration 时长(秒)
	 * @param quality 质量等级
	 * @returns 估算成本(美元)
	 */
	estimateCost(duration: number, quality: string): Promise<number>;

	/**
	 * 验证API连接
	 * @returns 是否连接成功
	 */
	validateConnection(): Promise<boolean>;
};

/**
 * ASMR音景模板库
 */
export const ASMRSoundscapeTemplates = {
	RAIN_FOREST: {
		prompt: 'Gentle rain falling on leaves in peaceful forest, soft droplets, distant thunder, birds chirping quietly',
		category: 'nature',
		intensity: 3,
		duration: 300, // 5分钟基础循环
		description: '森林雨声，适合深度放松和睡眠',
	},
	FIREPLACE: {
		prompt: 'Crackling fireplace with gentle wood burning, soft flames, cozy atmosphere',
		category: 'indoor',
		intensity: 4,
		duration: 240,
		description: '壁炉火焰声，营造温暖安全感',
	},
	OCEAN_WAVES: {
		prompt: 'Gentle ocean waves lapping shore, soft beach ambience, seagulls in distance',
		category: 'nature',
		intensity: 3,
		duration: 360,
		description: '海浪声，帮助放松和专注',
	},
	WIND_CHIMES: {
		prompt: 'Soft wind chimes with gentle breeze, melodic tinkling, peaceful garden atmosphere',
		category: 'musical',
		intensity: 2,
		duration: 180,
		description: '风铃声，轻柔的ASMR触发器',
	},
	WHITE_NOISE: {
		prompt: 'Clean white noise for focus and relaxation, consistent gentle static',
		category: 'synthetic',
		intensity: 5,
		duration: 600,
		description: '白噪音，遮蔽环境噪音帮助专注',
	},
	COFFEE_SHOP: {
		prompt: 'Quiet coffee shop ambience, distant chatter, coffee machine sounds, papers rustling',
		category: 'indoor',
		intensity: 3,
		duration: 300,
		description: '咖啡厅环境音，适合学习和工作',
	},
	NIGHT_CRICKETS: {
		prompt: 'Peaceful night crickets chirping, gentle night breeze, distant owl calls',
		category: 'nature',
		intensity: 2,
		duration: 480,
		description: '夜晚虫鸣声，助眠效果佳',
	},
	LIBRARY_QUIET: {
		prompt: 'Very quiet library atmosphere, occasional page turning, soft footsteps, whispered silence',
		category: 'indoor',
		intensity: 1,
		duration: 360,
		description: '图书馆静谧环境，极致安静',
	},
} as const;

export type ASMRSoundscapeType = keyof typeof ASMRSoundscapeTemplates;

/**
 * 针对中老年人的音景偏好设置
 */
export const ElderlyFriendlySoundscapes = {
	// 较低频率，避免高频刺激
	preferredCategories: ['nature', 'indoor'],
	avoidCategories: ['synthetic', 'electronic'],

	// 推荐强度范围
	recommendedIntensity: {
		min: 2,
		max: 5,
		default: 3,
	},

	// 适合的音景类型
	suitable: ['RAIN_FOREST', 'OCEAN_WAVES', 'FIREPLACE', 'NIGHT_CRICKETS', 'LIBRARY_QUIET'],

	// 建议避免的类型
	avoid: [
		'WHITE_NOISE', // 可能过于单调
		'COFFEE_SHOP', // 可能过于嘈杂
	],
} as const;
