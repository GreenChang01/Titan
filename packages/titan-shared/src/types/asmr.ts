/**
 * ASMR音频生成系统的类型定义
 *
 * 包含了ASMR内容生成、作业管理和UI组件所需的所有类型
 * 支持语音合成、音景生成、音频混合和双耳效果处理
 *
 * @version 1.0.0
 * @package @titan/shared
 */

/**
 * 作业执行状态
 *
 * 用于追踪ASMR生成作业的整个生命周期
 * 支持SWR轮询机制的类型安全检查
 *
 * @example
 * ```typescript
 * const isComplete = status === 'completed';
 * const isInProgress = ['pending', 'queued', 'processing'].includes(status);
 * ```
 */
export type JobStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed';

/**
 * 音景质量等级
 *
 * 影响音频生成的品质、耗时和成本
 * 高质量生成的音频更适合专业场景
 */
export type SoundscapeQuality = 'low' | 'medium' | 'high';

// === 配置类型定义 ===

/**
 * AI语音合成配置选项
 *
 * 控制ElevenLabs语音合成的各种参数
 * 所有数值参数均为0.0-1.0范围
 *
 * @param voiceId ElevenLabs语音模型的唯一标识符
 * @param stability 语音稳定性，高值更一致但缺乏变化
 * @param similarity 语音相似度，与原始语音的匹配程度
 * @param style 语音风格，0为稳定，1为变化丰富
 * @param speakerBoost 是否启用扬声器增强效果
 */
export type VoiceOptions = {
  /** ElevenLabs语音模型的唯一标识符 */
  voiceId: string;
  /** 语音稳定性 (0.0-1.0)，控制输出一致性 */
  stability?: number;
  /** 语音相似度 (0.0-1.0)，与原始声音的匹配程度 */
  similarity?: number;
  /** 语音风格 (0.0-1.0)，0为稳定，1为变化丰富 */
  style?: number;
  /** 是否启用扬声器增强效果 */
  speakerBoost?: boolean;
};

/**
 * AI音景生成配置选项
 *
 * 控制背景音景的生成参数
 * 支持各种环境音效和强度调节
 *
 * @param prompt 音景描述文本，如“雨林中的小溪”
 * @param duration 音频时长（秒）
 * @param category 音景类别，如nature、indoor等
 * @param intensity 音景强度 (0.0-1.0)
 * @param quality 音频质量等级
 */
export type SoundscapeOptions = {
  /** 音景描述文本，用于AI生成指导 */
  prompt: string;
  /** 音频时长（秒） */
  duration: number;
  /** 音景类别，如nature、indoor等 */
  category: string;
  /** 音景强度 (0.0-1.0) */
  intensity: number;
  /** 音频质量等级 */
  quality: SoundscapeQuality;
};

/**
 * 音频混合配置选项
 *
 * 控制语音和音景的混合参数
 * 包括音量、淡入淡出和均衡器设置
 *
 * @param voiceVolume 语音音量 (0.0-1.0)
 * @param soundscapeVolume 音景音量 (0.0-1.0)
 * @param fadeInDuration 淡入时长（秒）
 * @param fadeOutDuration 淡出时长（秒）
 * @param eqSettings 可选的均衡器设置
 */
export type MixingOptions = {
  /** 语音音量 (0.0-1.0) */
  voiceVolume: number;
  /** 音景音量 (0.0-1.0) */
  soundscapeVolume: number;
  /** 淡入时长（秒） */
  fadeInDuration: number;
  /** 淡出时长（秒） */
  fadeOutDuration: number;
  /** 可选的均衡器设置 */
  eqSettings?: {
    /** 低频调节 (dB) */
    lowFreq: number;
    /** 中频调节 (dB) */
    midFreq: number;
    /** 高频调节 (dB) */
    highFreq: number;
  };
};

/**
 * 双耳效果处理配置
 *
 * 用于创建3D空间音频效果的配置参数
 * 提供沉浸式的ASMR听觉体验
 *
 * @param enabled 是否启用双耳效果处理
 * @param spatialWidth 空间宽度 (0.0-2.0)，控制立体声宽度
 * @param leftDelay 左声道延迟（毫秒）
 * @param rightDelay 右声道延迟（毫秒）
 * @param reverbAmount 混响量 (0.0-1.0)
 */
export type BinauralSettings = {
  /** 是否启用双耳效果处理 */
  enabled: boolean;
  /** 空间宽度 (0.0-2.0)，控制立体声宽度 */
  spatialWidth: number;
  /** 左声道延迟（毫秒） */
  leftDelay: number;
  /** 右声道延迟（毫秒） */
  rightDelay: number;
  /** 混响量 (0.0-1.0) */
  reverbAmount: number;
};

/**
 * 质量控制和重试配置
 *
 * 定义ASMR生成的质量标准和自动重试机制
 * 确保输出的音频符合质量要求
 *
 * @param minimumScore 最低质量评分 (1.0-10.0)
 * @param enableAutoRetry 是否启用自动重试
 * @param maxRetryAttempts 最大重试次数
 */
export type QualityRequirements = {
  /** 最低质量评分 (1.0-10.0) */
  minimumScore: number;
  /** 是否启用自动重试 */
  enableAutoRetry: boolean;
  /** 最大重试次数 */
  maxRetryAttempts: number;
};

// === 主要API请求和响应类型 ===

/**
 * ASMR生成请求完整配置
 *
 * 包含生成高质量ASMR内容所需的所有参数
 * 支持语音、音景、混合和特效的全面配置
 *
 * @param text 要转换为语音的文本内容
 * @param voiceSettings AI语音合成配置
 * @param soundscapeConfig 背景音景配置
 * @param mixingSettings 音频混合配置
 * @param binauralSettings 可选的双耳效果配置
 * @param qualityRequirements 可选的质量控制配置
 */
export type AsmrGenerationRequest = {
  /** 要转换为语音的文本内容 */
  text: string;
  /** AI语音合成配置 */
  voiceSettings: VoiceOptions;
  /** 背景音景配置 */
  soundscapeConfig: SoundscapeOptions;
  /** 音频混合配置 */
  mixingSettings: MixingOptions;
  /** 可选的双耳效果配置 */
  binauralSettings?: BinauralSettings;
  /** 可选的质量控制配置 */
  qualityRequirements?: QualityRequirements;
};

/**
 * ASMR生成作业信息
 *
 * 表示一个正在执行或已完成的ASMR生成作业
 * 用于GET /api/jobs或POST /api/jobs/create-single接口响应
 *
 * @param id 作业的唯一标识符
 * @param status 作业当前执行状态
 * @param createdAt 作业创建时间（ISO 8601格式）
 * @param completedAt 作业完成时间（可选）
 * @param resultUrl 生成结果的下载链接（可选）
 * @param error 错误信息（可选）
 * @param requestPayload 原始请求参数，用于UI显示
 */
export type Job = {
  /** 作业的唯一标识符 */
  id: string;
  /** 作业当前执行状态 */
  status: JobStatus;
  /** 作业创建时间（ISO 8601格式） */
  createdAt: string;
  /** 作业完成时间（ISO 8601格式） */
  completedAt?: string;
  /** 生成结果的下载链接 */
  resultUrl?: string;
  /** 错误信息 */
  error?: string;
  /** 原始请求参数，用于UI显示 */
  requestPayload: Partial<AsmrGenerationRequest>;
};

/**
 * 作业执行进度信息
 *
 * 用于GET /api/jobs/:id/progress接口响应
 * 提供实时的作业进度和状态更新
 *
 * @param jobId 作业唯一标识符
 * @param status 作业当前状态
 * @param progress 完成进度百分比 (0-100)
 * @param currentStep 当前执行步骤描述
 * @param error 错误信息（可选）
 * @param estimatedTimeRemaining 预估剩余时间（秒）
 */
export type JobProgress = {
  /** 作业唯一标识符 */
  jobId: string;
  /** 作业当前状态 */
  status: JobStatus;
  /** 完成进度百分比 (0-100) */
  progress: number;
  /** 当前执行步骤描述，如"正在生成语音"、"正在混合音景" */
  currentStep: string;
  /** 错误信息 */
  error?: string;
  /** 预估剩余时间（秒） */
  estimatedTimeRemaining?: number;
};

// === UI组件相关类型 ===

/**
 * ASMR预设配置模板
 *
 * 用于存储和管理常用的ASMR生成配置
 * 支持语音、音景和混合参数的预设管理
 *
 * @param id 预设的唯一标识符
 * @param name 预设名称
 * @param description 预设描述
 * @param category 预设类型：语音、音景或混合
 * @param settings 对应类型的配置参数
 */
export type AsmrPreset = {
  /** 预设的唯一标识符 */
  id: string;
  /** 预设名称 */
  name: string;
  /** 预设描述 */
  description: string;
  /** 预设类型：语音、音景或混合 */
  category: 'voice' | 'soundscape' | 'mixing';
  /** 对应类型的配置参数 */
  settings: VoiceOptions | SoundscapeOptions | MixingOptions;
};

/**
 * 向导步骤配置
 *
 * 用于ASMR生成向导界面的步骤管理
 * 跟踪用户在多步骤配置流程中的进度
 *
 * @param id 步骤编号
 * @param title 步骤标题
 * @param description 步骤描述
 * @param isCompleted 是否已完成
 * @param isActive 是否为当前活跃步骤
 */
export type WizardStep = {
  /** 步骤编号 */
  id: number;
  /** 步骤标题 */
  title: string;
  /** 步骤描述 */
  description: string;
  /** 是否已完成 */
  isCompleted: boolean;
  /** 是否为当前活跃步骤 */
  isActive: boolean;
};
