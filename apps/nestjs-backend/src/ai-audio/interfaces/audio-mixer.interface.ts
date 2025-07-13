/**
 * 专业音频混合处理接口
 * 支持多轨混音、双耳处理、ASMR优化等
 */

export type MixingOptions = {
	voiceVolume: number; // 语音音量 0.0-1.0
	soundscapeVolume: number; // 音景音量 0.0-1.0
	fadeInDuration: number; // 淡入时长(秒)
	fadeOutDuration: number; // 淡出时长(秒)
	compressionRatio?: number; // 压缩比 1.0-10.0
	eqSettings?: EQSettings; // 均衡器设置
};

export type BinauralSettings = {
	enabled: boolean;
	spatialWidth: number; // 空间宽度 0.5-2.0
	leftDelay: number; // 左声道延迟(毫秒)
	rightDelay: number; // 右声道延迟(毫秒)
	reverbAmount: number; // 混响量 0.0-1.0
	roomSize?: number; // 房间大小 0.0-1.0
};

export type EQSettings = {
	lowFreq: number; // 低频调节 -20 到 +20 (dB)
	midFreq: number; // 中频调节 -20 到 +20 (dB)
	highFreq: number; // 高频调节 -20 到 +20 (dB)
	lowCutoff?: number; // 低切频率 (Hz)
	highCutoff?: number; // 高切频率 (Hz)
};

export type FrequencyAnalysis = {
	peakFrequency: number; // 峰值频率
	averageFrequency: number; // 平均频率
	dynamicRange: number; // 动态范围
	spectralCentroid: number; // 频谱重心
};

export type AudioQualityReport = {
	overallScore: number; // 总体评分 1-10
	technicalMetrics: {
		sampleRate: number;
		bitRate: number;
		dynamicRange: number;
		noiseFloor: number;
		frequencyResponse: FrequencyAnalysis;
	};
	asmrMetrics: {
		voiceClarity: number; // 语音清晰度 1-10
		soundscapeHarmony: number; // 音景协调性 1-10
		binauralEffectiveness: number; // 双耳效果 1-10
		relaxationPotential: number; // 放松潜力 1-10
	};
	recommendations: string[]; // 优化建议
	needsReprocessing: boolean; // 是否需要重新处理
};

export type AudioProcessingResult = {
	outputBuffer: Buffer;
	metadata: {
		duration: number;
		sampleRate: number;
		channels: number;
		format: string;
		size: number;
		processingTime: number; // 处理耗时(毫秒)
	};
	qualityReport: AudioQualityReport;
};

/**
 * 音频混合处理接口
 */
export type IAudioMixer = {
	/**
   * 混合语音和音景
   * @param voice 语音音频数据
   * @param soundscape 音景音频数据
   * @param options 混合选项
   * @returns 混合结果
   */
	mixVoiceAndSoundscape(voice: Buffer, soundscape: Buffer, options: MixingOptions): Promise<AudioProcessingResult>;

	/**
   * 应用双耳音频处理
   * @param audio 音频数据
   * @param settings 双耳设置
   * @returns 处理结果
   */
	applyBinauralEffects(audio: Buffer, settings: BinauralSettings): Promise<Buffer>;

	/**
   * 针对ASMR优化音频
   * @param audio 音频数据
   * @returns 优化后的音频
   */
	optimizeForAsmr(audio: Buffer): Promise<Buffer>;

	/**
   * 分析音频质量
   * @param audio 音频数据
   * @returns 质量报告
   */
	analyzeAudioQuality(audio: Buffer): Promise<AudioQualityReport>;

	/**
   * 标准化音频音量
   * @param audio 音频数据
   * @param targetLUFS 目标LUFS值
   * @returns 标准化后的音频
   */
	normalizeAudio(audio: Buffer, targetLUFS?: number): Promise<Buffer>;

	/**
   * 音频格式转换
   * @param audio 音频数据
   * @param targetFormat 目标格式
   * @param quality 质量设置
   * @returns 转换后的音频
   */
	convertFormat(
		audio: Buffer,
		targetFormat: 'mp3' | 'wav' | 'aac',
		quality?: 'standard' | 'high' | 'premium',
	): Promise<Buffer>;
};

/**
 * ASMR混音预设配置
 */
export const ASMRMixingPresets = {
	SLEEP_OPTIMIZED: {
		voiceVolume: 0.7,
		soundscapeVolume: 0.3,
		fadeInDuration: 3,
		fadeOutDuration: 5,
		compressionRatio: 2.5,
		eqSettings: {
			lowFreq: -2, // 减少低频噪音
			midFreq: 1, // 增强人声清晰度
			highFreq: -1, // 柔和高频
			lowCutoff: 80, // 高通滤波移除rumble
			highCutoff: 15_000, // 低通滤波增加温暖感
		},
		description: '针对睡眠优化的混音设置',
	},

	FOCUS_OPTIMIZED: {
		voiceVolume: 0.8,
		soundscapeVolume: 0.2,
		fadeInDuration: 2,
		fadeOutDuration: 3,
		compressionRatio: 1.8,
		eqSettings: {
			lowFreq: -1,
			midFreq: 2,
			highFreq: 0,
			lowCutoff: 100,
			highCutoff: 12_000,
		},
		description: '增强专注力的混音设置',
	},

	RELAXATION_OPTIMIZED: {
		voiceVolume: 0.65,
		soundscapeVolume: 0.35,
		fadeInDuration: 4,
		fadeOutDuration: 6,
		compressionRatio: 3,
		eqSettings: {
			lowFreq: 1,
			midFreq: 0,
			highFreq: -2,
			lowCutoff: 60,
			highCutoff: 16_000,
		},
		description: '深度放松的混音设置',
	},

	ELDERLY_FRIENDLY: {
		voiceVolume: 0.75, // 稍高的语音音量确保清晰度
		soundscapeVolume: 0.25, // 较低的背景音避免干扰
		fadeInDuration: 5, // 更长的淡入避免突然刺激
		fadeOutDuration: 8, // 更长的淡出
		compressionRatio: 2, // 适中的压缩保持动态
		eqSettings: {
			lowFreq: -3, // 显著减少低频
			midFreq: 3, // 增强中频清晰度
			highFreq: -4, // 大幅减少高频避免刺激
			lowCutoff: 120, // 更高的高通频率
			highCutoff: 8000, // 更低的低通频率
		},
		description: '专为中老年人优化的混音设置',
	},
} as const;

export type ASMRMixingPresetType = keyof typeof ASMRMixingPresets;

/**
 * 音频质量标准定义
 */
export const AudioQualityStandards = {
	ASMR_MINIMUM: {
		sampleRate: 44_100,
		bitRate: 192_000,
		dynamicRange: 12, // DB
		noiseFloor: -60, // DB
		overallScore: 4,
	},

	ASMR_RECOMMENDED: {
		sampleRate: 48_000,
		bitRate: 256_000,
		dynamicRange: 16,
		noiseFloor: -65,
		overallScore: 6,
	},

	ASMR_PREMIUM: {
		sampleRate: 48_000,
		bitRate: 320_000,
		dynamicRange: 20,
		noiseFloor: -70,
		overallScore: 8,
	},
} as const;
