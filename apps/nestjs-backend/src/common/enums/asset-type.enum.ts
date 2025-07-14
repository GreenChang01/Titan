/**
 * 素材类型枚举
 * 包含传统素材类型和新增的ASMR专用素材类型
 */
export enum AssetType {
	// 传统素材类型
	BACKGROUND_IMAGE = 'background_image',
	BACKGROUND_VIDEO = 'background_video',
	NARRATION_AUDIO = 'narration_audio',
	BGM_AUDIO = 'bgm_audio',
	TEXT_CONTENT = 'text_content',
	SUBTITLE_FILE = 'subtitle_file',
	WATERMARK_IMAGE = 'watermark_image',

	// ASMR专用素材类型
	ASMR_NATURAL_SOUND = 'asmr_natural_sound',
	ASMR_WHITE_NOISE = 'asmr_white_noise',
	ASMR_AMBIENT_SOUND = 'asmr_ambient_sound',
	ASMR_VOICE_SAMPLE = 'asmr_voice_sample',

	// AI生成素材类型
	AI_GENERATED_IMAGE = 'ai_generated_image',
}
