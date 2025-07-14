/**
 * AI提示词分类枚举
 * 用于对ASMR相关的AI提示词进行分类管理
 */
export enum PromptCategory {
	/** 睡眠引导 */
	SLEEP_GUIDANCE = 'sleep_guidance',
	/** 冥想引导 */
	MEDITATION = 'meditation',
	/** 放松引导 */
	RELAXATION = 'relaxation',
	/** 专注力提升 */
	FOCUS_ENHANCEMENT = 'focus_enhancement',
	/** 自然沉浸 */
	NATURE_IMMERSION = 'nature_immersion',
	/** 治疗康复 */
	HEALING_THERAPY = 'healing_therapy',
	/** 自定义分类 */
	CUSTOM = 'custom',
}
