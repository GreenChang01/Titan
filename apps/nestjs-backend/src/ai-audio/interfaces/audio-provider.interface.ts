/**
 * AI音频提供商统一接口
 * 支持语音合成、语音克隆等AI音频服务
 */

export type VoiceOptions = {
	voiceId: string;
	stability?: number; // 0.0-1.0, 语音稳定性
	similarityBoost?: number; // 0.0-1.0, 相似度增强
	style?: number; // 0.0-1.0, 风格强度
	speakerBoost?: boolean; // 是否启用说话者增强
	model?: string; // 语音模型ID
};

export type Voice = {
	id: string;
	name: string;
	description?: string;
	category?: string; // 如：'male', 'female', 'neutral'
	language?: string; // 如：'zh-CN', 'en-US'
	isCustom?: boolean; // 是否为用户自定义语音
	previewUrl?: string; // 语音预览URL
};

export type VoiceGenerationResult = {
	audioBuffer: Buffer;
	metadata: {
		duration: number; // 音频时长(秒)
		sampleRate: number; // 采样率
		format: string; // 音频格式(如 'mp3')
		size: number; // 文件大小(字节)
		provider: string; // 提供商名称
		model: string; // 使用的模型
		cost?: number; // 生成成本
	};
};

export type VoiceCloneResult = {
	voiceId: string;
	name: string;
	status: 'processing' | 'completed' | 'failed';
	similarity?: number; // 相似度评分 0-1
};

/**
 * AI语音提供商接口
 */
export type IAudioProvider = {
	/**
	 * 生成语音
	 * @param text 要转换的文本
	 * @param options 语音选项
	 * @returns 语音生成结果
	 */
	generateVoice(text: string, options: VoiceOptions): Promise<VoiceGenerationResult>;

	/**
	 * 获取可用语音列表
	 * @param category 语音分类过滤
	 * @returns 语音列表
	 */
	getVoices(category?: string): Promise<Voice[]>;

	/**
	 * 根据ID获取语音信息
	 * @param voiceId 语音ID
	 * @returns 语音信息
	 */
	getVoiceById(voiceId: string): Promise<Voice>;

	/**
	 * 克隆语音
	 * @param audioSample 音频样本数据
	 * @param name 语音名称
	 * @param description 语音描述
	 * @returns 克隆结果
	 */
	cloneVoice(audioSample: Buffer, name: string, description?: string): Promise<VoiceCloneResult>;

	/**
	 * 获取语音克隆状态
	 * @param voiceId 语音ID
	 * @returns 克隆状态
	 */
	getCloneStatus(voiceId: string): Promise<VoiceCloneResult>;

	/**
	 * 估算生成成本
	 * @param text 文本内容
	 * @param options 语音选项
	 * @returns 估算成本(美元)
	 */
	estimateCost(text: string, options: VoiceOptions): Promise<number>;

	/**
	 * 验证API连接和配置
	 * @returns 是否连接成功
	 */
	validateConnection(): Promise<boolean>;
};

/**
 * ASMR语音优化预设
 */
export const ASMRVoicePresets = {
	GENTLE_FEMALE: {
		stability: 0.8,
		similarityBoost: 0.9,
		style: 0.2,
		speakerBoost: true,
		description: '温柔女声，适合睡眠引导',
	},
	CALM_MALE: {
		stability: 0.9,
		similarityBoost: 0.85,
		style: 0.15,
		speakerBoost: true,
		description: '沉稳男声，适合冥想放松',
	},
	NEUTRAL_SOOTHING: {
		stability: 0.75,
		similarityBoost: 0.8,
		style: 0.1,
		speakerBoost: false,
		description: '中性舒缓声音，通用放松',
	},
	ELDERLY_FRIENDLY: {
		stability: 0.85,
		similarityBoost: 0.9,
		style: 0.05,
		speakerBoost: true,
		description: '针对中老年人优化的清晰语音',
	},
} as const;

export type ASMRPresetType = keyof typeof ASMRVoicePresets;
