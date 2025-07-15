import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import type {
	ASMRGenerationRequest,
	Job,
	JobProgress,
	VoiceOptions,
	SoundscapeOptions,
	MixingOptions,
	BinauralSettings,
	QualityRequirements,
	WizardStep,
} from '@titan/shared';

/**
 * ASMR生成状态类型定义
 */
type ASMRState = {
	/** 向导表单数据 */
	formData: Partial<ASMRGenerationRequest>;

	/** 向导状态 */
	/** 当前步骤编号 */
	currentStep: number;
	/** 最大步骤数 */
	maxSteps: number;
	/** 向导步骤配置 */
	wizardSteps: WizardStep[];

	/** 任务管理 */
	/** 所有生成任务列表 */
	jobs: Job[];
	/** 当前选中的任务ID */
	currentJobId: string | undefined;

	/** UI状态 */
	/** 是否正在提交 */
	isSubmitting: boolean;
	/** 错误信息 */
	error: string | undefined;

	/** 成本估算 */
	estimatedCost:
		| {
			/** 语音合成成本 */
			voiceCost: number;
			/** 音景生成成本 */
			soundscapeCost: number;
			/** 总成本 */
			totalCost: number;
			/** 货币单位 */
			currency: string;
		}
		| undefined;
};

/**
 * ASMR操作方法类型定义
 */
type ASMRActions = {
	/** 表单数据操作 */
	/** 设置文本内容 */
	setText: (text: string) => void;
	/** 设置语音参数 */
	setVoiceSettings: (settings: Partial<VoiceOptions>) => void;
	/** 设置音景配置 */
	setSoundscapeConfig: (config: Partial<SoundscapeOptions>) => void;
	/** 设置混音参数 */
	setMixingSettings: (settings: Partial<MixingOptions>) => void;
	/** 设置双耳效果参数 */
	setBinauralSettings: (settings: Partial<BinauralSettings>) => void;
	/** 设置质量要求 */
	setQualityRequirements: (requirements: Partial<QualityRequirements>) => void;

	/** 向导导航 */
	/** 下一步 */
	nextStep: () => void;
	/** 上一步 */
	prevStep: () => void;
	/** 跳转到指定步骤 */
	goToStep: (step: number) => void;
	/** 完成指定步骤 */
	completeStep: (step: number) => void;

	/** 任务管理 */
	/** 添加新任务 */
	addJob: (job: Job) => void;
	/** 更新任务信息 */
	updateJob: (jobId: string, updates: Partial<Job>) => void;
	/** 设置当前任务ID */
	setCurrentJobId: (jobId: string | undefined) => void;
	/** 删除任务 */
	removeJob: (jobId: string) => void;
	/** 清空所有任务 */
	clearJobs: () => void;

	/** UI状态管理 */
	/** 设置提交状态 */
	setSubmitting: (isSubmitting: boolean) => void;
	/** 设置错误信息 */
	setError: (error: string | undefined) => void;

	/** 成本估算 */
	/** 设置估算成本 */
	setEstimatedCost: (cost: ASMRState['estimatedCost']) => void;

	/** 重置功能 */
	/** 重置表单数据 */
	resetForm: () => void;
	/** 重置向导状态 */
	resetWizard: () => void;
	/** 完全重置 */
	reset: () => void;
};

/** ASMR Store 完整类型 */
type ASMRStore = ASMRState & ASMRActions;

// Initial state
const initialState: ASMRState = {
	formData: {
		text: '',
		voiceSettings: {
			voiceId: '',
			stability: 0.85,
			similarity: 0.9,
			style: 0.1,
			speakerBoost: true,
		},
		soundscapeConfig: {
			prompt: '',
			duration: 300, // 5 minutes default
			category: 'nature',
			intensity: 3,
			quality: 'high',
		},
		mixingSettings: {
			voiceVolume: 0.7,
			soundscapeVolume: 0.3,
			fadeInDuration: 3,
			fadeOutDuration: 5,
			eqSettings: {
				lowFreq: -2,
				midFreq: 1,
				highFreq: -1,
			},
		},
		binauralSettings: {
			enabled: true,
			spatialWidth: 1.1,
			leftDelay: 5,
			rightDelay: 10,
			reverbAmount: 0.1,
		},
		qualityRequirements: {
			minimumScore: 6,
			enableAutoRetry: true,
			maxRetryAttempts: 2,
		},
	},
	currentStep: 1,
	maxSteps: 5,
	wizardSteps: [
		{
			id: 1,
			title: '文本内容',
			description: '输入您想要转换为ASMR音频的文本',
			isCompleted: false,
			isActive: true,
		},
		{
			id: 2,
			title: '选择语音',
			description: '配置AI语音合成参数',
			isCompleted: false,
			isActive: false,
		},
		{
			id: 3,
			title: '环境音效',
			description: '选择或自定义背景音景',
			isCompleted: false,
			isActive: false,
		},
		{
			id: 4,
			title: '高级设置',
			description: '混音、双耳效果等高级选项',
			isCompleted: false,
			isActive: false,
		},
		{
			id: 5,
			title: '确认生成',
			description: '预览设置并提交生成任务',
			isCompleted: false,
			isActive: false,
		},
	],
	jobs: [],
	currentJobId: null,
	isSubmitting: false,
	error: null,
	estimatedCost: null,
};

export const useASMRStore = create<ASMRStore>()(devtools(
	(set, get) => ({
		...initialState,

		// Form data actions
		setText(text: string) {
			set(
				state => ({
					formData: {...state.formData, text},
					error: null,
				}),
				false,
				'setText',
			);
		},

		setVoiceSettings(settings: Partial<VoiceOptions>) {
			set(
				state => ({
					formData: {
						...state.formData,
						voiceSettings: {...state.formData.voiceSettings, ...settings},
					},
					error: null,
				}),
				false,
				'setVoiceSettings',
			);
		},

		setSoundscapeConfig(config: Partial<SoundscapeOptions>) {
			set(
				state => ({
					formData: {
						...state.formData,
						soundscapeConfig: {...state.formData.soundscapeConfig, ...config},
					},
					error: null,
				}),
				false,
				'setSoundscapeConfig',
			);
		},

		setMixingSettings(settings: Partial<MixingOptions>) {
			set(
				state => ({
					formData: {
						...state.formData,
						mixingSettings: {...state.formData.mixingSettings, ...settings},
					},
					error: null,
				}),
				false,
				'setMixingSettings',
			);
		},

		setBinauralSettings(settings: Partial<BinauralSettings>) {
			set(
				state => ({
					formData: {
						...state.formData,
						binauralSettings: {...state.formData.binauralSettings, ...settings},
					},
					error: null,
				}),
				false,
				'setBinauralSettings',
			);
		},

		setQualityRequirements(requirements: Partial<QualityRequirements>) {
			set(
				state => ({
					formData: {
						...state.formData,
						qualityRequirements: {...state.formData.qualityRequirements, ...requirements},
					},
					error: null,
				}),
				false,
				'setQualityRequirements',
			);
		},

		// Wizard navigation
		nextStep() {
			const state = get();
			if (state.currentStep < state.maxSteps) {
				set(
					state => ({
						currentStep: state.currentStep + 1,
						wizardSteps: state.wizardSteps.map(step => ({
							...step,
							isActive: step.id === state.currentStep + 1,
						})),
					}),
					false,
					'nextStep',
				);
			}
		},

		prevStep() {
			const state = get();
			if (state.currentStep > 1) {
				set(
					state => ({
						currentStep: state.currentStep - 1,
						wizardSteps: state.wizardSteps.map(step => ({
							...step,
							isActive: step.id === state.currentStep - 1,
						})),
					}),
					false,
					'prevStep',
				);
			}
		},

		goToStep(step: number) {
			const state = get();
			if (step >= 1 && step <= state.maxSteps) {
				set(
					state => ({
						currentStep: step,
						wizardSteps: state.wizardSteps.map(wizardStep => ({
							...wizardStep,
							isActive: wizardStep.id === step,
						})),
					}),
					false,
					'goToStep',
				);
			}
		},

		completeStep(step: number) {
			set(
				state => ({
					wizardSteps: state.wizardSteps.map(wizardStep => ({
						...wizardStep,
						isCompleted: wizardStep.id === step ? true : wizardStep.isCompleted,
					})),
				}),
				false,
				'completeStep',
			);
		},

		// Jobs management
		addJob(job: Job) {
			set(
				state => ({
					jobs: [job, ...state.jobs],
					currentJobId: job.id,
				}),
				false,
				'addJob',
			);
		},

		updateJob(jobId: string, updates: Partial<Job>) {
			set(
				state => ({
					jobs: state.jobs.map(job => (job.id === jobId ? {...job, ...updates} : job)),
				}),
				false,
				'updateJob',
			);
		},

		setCurrentJobId(jobId: string | undefined) {
			set({currentJobId: jobId}, false, 'setCurrentJobId');
		},

		removeJob(jobId: string) {
			set(
				state => ({
					jobs: state.jobs.filter(job => job.id !== jobId),
					currentJobId: state.currentJobId === jobId ? null : state.currentJobId,
				}),
				false,
				'removeJob',
			);
		},

		clearJobs() {
			set(
				{
					jobs: [],
					currentJobId: null,
				},
				false,
				'clearJobs',
			);
		},

		// UI state management
		setSubmitting(isSubmitting: boolean) {
			set({isSubmitting}, false, 'setSubmitting');
		},

		setError(error: string | undefined) {
			set({error}, false, 'setError');
		},

		// Cost estimation
		setEstimatedCost(cost: ASMRState['estimatedCost']) {
			set({estimatedCost: cost}, false, 'setEstimatedCost');
		},

		// Reset functions
		resetForm() {
			set({formData: initialState.formData}, false, 'resetForm');
		},

		resetWizard() {
			set(
				{
					currentStep: 1,
					wizardSteps: initialState.wizardSteps,
					error: null,
					isSubmitting: false,
				},
				false,
				'resetWizard',
			);
		},

		reset() {
			set(initialState, false, 'reset');
		},
	}),
	{
		name: 'asmr-store', // Name for devtools
	},
));
