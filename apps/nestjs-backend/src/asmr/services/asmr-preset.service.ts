import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository, EntityManager} from '@mikro-orm/core';
import {
	ASMRPreset,
	VoiceSettings,
	SoundscapeSettings,
	MixingSettings,
	VoiceType,
	SoundscapeType,
} from '../dto/asmr-generation.dto';
import {ASMRPresetEntity, PresetType} from '../entities/asmr-preset.entity';

@Injectable()
export class ASMRPresetService implements OnModuleInit {
	private readonly logger = new Logger(ASMRPresetService.name);

	constructor(
		@InjectRepository(ASMRPresetEntity)
		private readonly presetRepository: EntityRepository<ASMRPresetEntity>,
		private readonly em: EntityManager,
	) {}

	async onModuleInit() {
		try {
			await this.initializeDefaultPresets();
		} catch (error) {
			this.logger.error('Failed to initialize default presets:', error);
		}
	}

	async getAllPresets(): Promise<ASMRPreset[]> {
		const presets = await this.presetRepository.findAll({
			orderBy: {usageCount: 'DESC'},
		});

		return presets.map((preset: ASMRPresetEntity) => this.mapEntityToDto(preset));
	}

	async getPresetsByType(type: 'voice' | 'soundscape' | 'mixing'): Promise<ASMRPreset[]> {
		const presetType = type === 'voice'
			? PresetType.VOICE
			: (type === 'soundscape'
				? PresetType.SOUNDSCAPE
				: PresetType.MIXING);

		const presets = await this.presetRepository.find({
			type: presetType,
		}, {
			orderBy: {usageCount: 'DESC'},
		});

		return presets.map((preset: ASMRPresetEntity) => this.mapEntityToDto(preset));
	}

	async getPresetById(id: string): Promise<ASMRPreset | null> {
		const preset = await this.presetRepository.findOne({
			id,
		});

		return preset ? this.mapEntityToDto(preset) : null;
	}

	async incrementUsageCount(id: string): Promise<void> {
		const preset = await this.presetRepository.findOne({id});
		if (preset) {
			preset.usageCount += 1;
			await this.presetRepository.getEntityManager().persistAndFlush(preset);
		}
	}

	async getElderlyFriendlyPresets(): Promise<ASMRPreset[]> {
		const presets = await this.presetRepository.find({
			elderlyFriendly: true,
		}, {
			orderBy: {usageCount: 'DESC'},
		});

		return presets.map((preset: ASMRPresetEntity) => this.mapEntityToDto(preset));
	}

	private mapEntityToDto(entity: ASMRPresetEntity): ASMRPreset {
		return {
			id: entity.id,
			name: entity.name,
			description: entity.description,
			type: entity.type,
			config: entity.config,
			elderlyFriendly: entity.elderlyFriendly,
			tags: entity.tags,
			usageCount: entity.usageCount,
			rating: entity.rating,
		};
	}

	private async initializeDefaultPresets(): Promise<void> {
		// Fork the EntityManager to create a new context
		const em = this.em.fork();
		const existingPresets = await em.count(ASMRPresetEntity);

		if (existingPresets > 0) {
			this.logger.debug('Default presets already exist, skipping initialization');
			return;
		}

		this.logger.log('Initializing default ASMR presets');

		const defaultPresets = [
			// Voice Presets
			{
				id: 'voice-gentle-female',
				name: '温柔女声',
				description: '温和亲切的女性声音，适合睡前引导',
				type: 'voice' as const,
				config: {
					type: VoiceType.GENTLE_FEMALE,
					speed: 0.8,
					volume: 0.7,
					stability: 0.6,
					clarity: 0.8,
				} as VoiceSettings,
				elderlyFriendly: true,
				tags: ['温柔', '女声', '睡前', '放松'],
				usageCount: 0,
				rating: 4.5,
			},
			{
				id: 'voice-warm-male',
				name: '温暖男声',
				description: '温暖沉稳的男性声音，适合冥想引导',
				type: 'voice' as const,
				config: {
					type: VoiceType.WARM_MALE,
					speed: 0.9,
					volume: 0.8,
					stability: 0.7,
					clarity: 0.75,
				} as VoiceSettings,
				elderlyFriendly: true,
				tags: ['温暖', '男声', '冥想', '沉稳'],
				usageCount: 0,
				rating: 4.3,
			},
			{
				id: 'voice-elderly-female',
				name: '慈祥奶奶',
				description: '慈祥温暖的年长女性声音，特别适合老年人',
				type: 'voice' as const,
				config: {
					type: VoiceType.ELDERLY_FEMALE,
					speed: 0.7,
					volume: 0.8,
					stability: 0.8,
					clarity: 0.7,
				} as VoiceSettings,
				elderlyFriendly: true,
				tags: ['慈祥', '奶奶', '老年人', '温暖'],
				usageCount: 0,
				rating: 4.7,
			},
			{
				id: 'voice-elderly-male',
				name: '慈祥爷爷',
				description: '慈祥稳重的年长男性声音，特别适合老年人',
				type: 'voice' as const,
				config: {
					type: VoiceType.ELDERLY_MALE,
					speed: 0.7,
					volume: 0.8,
					stability: 0.8,
					clarity: 0.7,
				} as VoiceSettings,
				elderlyFriendly: true,
				tags: ['慈祥', '爷爷', '老年人', '稳重'],
				usageCount: 0,
				rating: 4.6,
			},
			{
				id: 'voice-narrator',
				name: '专业旁白',
				description: '清晰专业的旁白声音，适合故事朗读',
				type: 'voice' as const,
				config: {
					type: VoiceType.NARRATOR,
					speed: 1,
					volume: 0.8,
					stability: 0.5,
					clarity: 0.9,
				} as VoiceSettings,
				elderlyFriendly: false,
				tags: ['专业', '旁白', '故事', '清晰'],
				usageCount: 0,
				rating: 4.2,
			},

			// Soundscape Presets
			{
				id: 'soundscape-nature',
				name: '自然之声',
				description: '鸟鸣、风声、流水的自然环境音',
				type: 'soundscape' as const,
				config: {
					type: SoundscapeType.NATURE,
					volume: 0.3,
					customParameters: {
						birdVolume: 0.4,
						windVolume: 0.2,
						waterVolume: 0.3,
					},
				} as SoundscapeSettings,
				elderlyFriendly: true,
				tags: ['自然', '鸟鸣', '放松', '环境'],
				usageCount: 0,
				rating: 4.6,
			},
			{
				id: 'soundscape-rain',
				name: '雨声',
				description: '温柔的雨声，营造宁静舒适的氛围',
				type: 'soundscape' as const,
				config: {
					type: SoundscapeType.RAIN,
					volume: 0.4,
					customParameters: {
						intensity: 'light',
						thunder: false,
					},
				} as SoundscapeSettings,
				elderlyFriendly: true,
				tags: ['雨声', '宁静', '舒适', '睡眠'],
				usageCount: 0,
				rating: 4.8,
			},
			{
				id: 'soundscape-ocean',
				name: '海浪声',
				description: '温和的海浪声，适合深度放松',
				type: 'soundscape' as const,
				config: {
					type: SoundscapeType.OCEAN,
					volume: 0.3,
					customParameters: {
						waveIntensity: 'gentle',
						seagulls: false,
					},
				} as SoundscapeSettings,
				elderlyFriendly: true,
				tags: ['海浪', '放松', '深度', '海洋'],
				usageCount: 0,
				rating: 4.4,
			},
			{
				id: 'soundscape-fireplace',
				name: '壁炉',
				description: '温暖的壁炉火焰声，营造温馨氛围',
				type: 'soundscape' as const,
				config: {
					type: SoundscapeType.FIREPLACE,
					volume: 0.25,
					customParameters: {
						crackling: 'soft',
						warmth: 'cozy',
					},
				} as SoundscapeSettings,
				elderlyFriendly: true,
				tags: ['壁炉', '温暖', '温馨', '舒适'],
				usageCount: 0,
				rating: 4.3,
			},
			{
				id: 'soundscape-white-noise',
				name: '白噪音',
				description: '平滑的白噪音，有助于专注和放松',
				type: 'soundscape' as const,
				config: {
					type: SoundscapeType.WHITE_NOISE,
					volume: 0.2,
					customParameters: {
						frequency: 'mid',
						smoothness: 'high',
					},
				} as SoundscapeSettings,
				elderlyFriendly: true,
				tags: ['白噪音', '专注', '放松', '睡眠'],
				usageCount: 0,
				rating: 4.1,
			},
			{
				id: 'soundscape-none',
				name: '纯人声',
				description: '不添加任何背景音，纯净的人声体验',
				type: 'soundscape' as const,
				config: {
					type: SoundscapeType.NONE,
					volume: 0,
				} as SoundscapeSettings,
				elderlyFriendly: true,
				tags: ['纯净', '人声', '简单', '清晰'],
				usageCount: 0,
				rating: 4,
			},

			// Mixing Presets
			{
				id: 'mixing-elderly-optimized',
				name: '老年人优化',
				description: '专为老年人优化的音频设置',
				type: 'mixing' as const,
				config: {
					binaural: false,
					asmrFilter: true,
					elderlyOptimization: true,
					masterVolume: 0.9,
				} as MixingSettings,
				elderlyFriendly: true,
				tags: ['老年人', '优化', '清晰', '舒适'],
				usageCount: 0,
				rating: 4.7,
			},
			{
				id: 'mixing-binaural',
				name: '立体声效果',
				description: '增强立体声效果，提供沉浸式体验',
				type: 'mixing' as const,
				config: {
					binaural: true,
					asmrFilter: true,
					elderlyOptimization: false,
					masterVolume: 0.8,
				} as MixingSettings,
				elderlyFriendly: false,
				tags: ['立体声', '沉浸', '效果', '体验'],
				usageCount: 0,
				rating: 4.2,
			},
			{
				id: 'mixing-pure-asmr',
				name: '纯ASMR',
				description: '纯粹的ASMR体验，专业频率滤波',
				type: 'mixing' as const,
				config: {
					binaural: false,
					asmrFilter: true,
					elderlyOptimization: false,
					masterVolume: 0.7,
				} as MixingSettings,
				elderlyFriendly: false,
				tags: ['纯ASMR', '专业', '滤波', '体验'],
				usageCount: 0,
				rating: 4.4,
			},
			{
				id: 'mixing-balanced',
				name: '平衡模式',
				description: '平衡的音频设置，适合大多数用户',
				type: 'mixing' as const,
				config: {
					binaural: false,
					asmrFilter: true,
					elderlyOptimization: true,
					masterVolume: 0.8,
				} as MixingSettings,
				elderlyFriendly: true,
				tags: ['平衡', '通用', '适合', '标准'],
				usageCount: 0,
				rating: 4.5,
			},
		];

		// Save all presets
		for (const preset of defaultPresets) {
			const convertedType = preset.type === 'voice'
				? PresetType.VOICE
				: (preset.type === 'soundscape'
					? PresetType.SOUNDSCAPE
					: PresetType.MIXING);

			const entity = em.create(ASMRPresetEntity, {
				...preset,
				type: convertedType,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			em.persist(entity);
		}

		await em.flush();
		this.logger.log(`Initialized ${defaultPresets.length} default presets`);
	}
}
