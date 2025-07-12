'use client';

import {useState, useEffect, type JSX} from 'react';
import {
	Settings, Volume2, Headphones, Zap, Info, Loader2,
} from 'lucide-react';
import type {ASMRPreset, MixingSettings, QualityRequirements} from '@titan/shared';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Label} from '@/components/ui/label';
import {Slider} from '@/components/ui/slider';
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {Separator} from '@/components/ui/separator';
import {
	Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {useASMRStore} from '@/store/asmr/asmr.store';
import {ASMRApiService} from '@/lib/services/asmr-api.service';
import {cn} from '@/lib/utils';

export function Step4Advanced(): JSX.Element {
	const {formData, setMixingSettings, setQualityRequirements} = useASMRStore();
	const [presets, setPresets] = useState<ASMRPreset[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedPreset, setSelectedPreset] = useState<string>('');

	const [mixingSettings, setLocalMixingSettings] = useState<MixingSettings>({
		voiceVolume: 0.7,
		soundscapeVolume: 0.3,
		fadeInDuration: 3,
		fadeOutDuration: 5,
		eqSettings: {
			lowFreq: 0,
			midFreq: 0,
			highFreq: 0,
		},
	});

	const [qualitySettings, setLocalQualitySettings] = useState<QualityRequirements>({
		minimumScore: 7,
		enableAutoRetry: true,
		maxRetries: 3,
		strictValidation: false,
	});

	// Load mixing presets on component mount
	useEffect(() => {
		const loadPresets = async () => {
			try {
				setIsLoading(true);
				const data = await ASMRApiService.getPresets();
				setPresets(data.mixingPresets);
			} catch (error) {
				console.error('Failed to load mixing presets:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadPresets();
	}, []);

	// Initialize with existing data if available
	useEffect(() => {
		if (formData.mixingSettings) {
			setLocalMixingSettings(formData.mixingSettings);
		}

		if (formData.qualityRequirements) {
			setLocalQualitySettings(formData.qualityRequirements);
		}
	}, [formData.mixingSettings, formData.qualityRequirements]);

	// Update store when local settings change
	useEffect(() => {
		setMixingSettings(mixingSettings);
	}, [mixingSettings, setMixingSettings]);

	useEffect(() => {
		setQualityRequirements(qualitySettings);
	}, [qualitySettings, setQualityRequirements]);

	const handlePresetSelect = (presetId: string) => {
		setSelectedPreset(presetId);
		const preset = presets.find(p => p.id === presetId);
		if (preset?.settings) {
			const presetMixingSettings = preset.settings as MixingSettings;
			setLocalMixingSettings(presetMixingSettings);
		}
	};

	const handleMixingChange = (field: keyof MixingSettings, value: any) => {
		setLocalMixingSettings(previous => ({...previous, [field]: value}));
		// Clear preset selection when manually adjusting
		if (selectedPreset) {
			setSelectedPreset('');
		}
	};

	const handleEqChange = (freq: 'lowFreq' | 'midFreq' | 'highFreq', value: number) => {
		setLocalMixingSettings(previous => ({
			...previous,
			eqSettings: {
				...previous.eqSettings,
				[freq]: value,
			},
		}));
		// Clear preset selection when manually adjusting
		if (selectedPreset) {
			setSelectedPreset('');
		}
	};

	const handleQualityChange = (field: keyof QualityRequirements, value: any) => {
		setLocalQualitySettings(previous => ({...previous, [field]: value}));
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-12'>
				<Loader2 className='h-6 w-6 animate-spin mr-2' />
				<span className='text-muted-foreground'>加载混音预设...</span>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<Tabs defaultValue='mixing' className='w-full'>
				<TabsList className='grid w-full grid-cols-3'>
					<TabsTrigger value='mixing'>混音设置</TabsTrigger>
					<TabsTrigger value='quality'>质量控制</TabsTrigger>
					<TabsTrigger value='advanced'>高级选项</TabsTrigger>
				</TabsList>

				<TabsContent value='mixing' className='space-y-6'>
					{/* Mixing Presets */}
					<Card>
						<CardHeader>
							<CardTitle>混音预设</CardTitle>
							<CardDescription>选择专业的混音预设或自定义设置</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								{presets.map(preset => (
									<Card
										key={preset.id}
										className={cn(
											'cursor-pointer transition-all duration-200 hover:shadow-md',
											selectedPreset === preset.id ? 'ring-2 ring-primary border-primary' : '',
										)}
										onClick={() => {
											handlePresetSelect(preset.id);
										}}
									>
										<CardContent className='p-4'>
											<div className='space-y-2'>
												<div className='flex items-center justify-between'>
													<h4 className='font-medium'>{preset.name}</h4>
													<Volume2 className='h-4 w-4 text-muted-foreground' />
												</div>
												<p className='text-sm text-muted-foreground'>{preset.description}</p>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Volume Controls */}
					<Card>
						<CardHeader>
							<CardTitle>音量控制</CardTitle>
							<CardDescription>调节人声和音景的音量平衡</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Voice Volume */}
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<Label htmlFor='voice-volume'>人声音量</Label>
									<span className='text-sm font-medium'>{Math.round(mixingSettings.voiceVolume * 100)}%</span>
								</div>
								<Slider
									id='voice-volume'
									value={[mixingSettings.voiceVolume]}
									min={0}
									max={1}
									step={0.05}
									className='w-full'
									onValueChange={value => {
										handleMixingChange('voiceVolume', value[0]);
									}}
								/>
							</div>

							{/* Soundscape Volume */}
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<Label htmlFor='soundscape-volume'>音景音量</Label>
									<span className='text-sm font-medium'>{Math.round(mixingSettings.soundscapeVolume * 100)}%</span>
								</div>
								<Slider
									id='soundscape-volume'
									value={[mixingSettings.soundscapeVolume]}
									min={0}
									max={1}
									step={0.05}
									className='w-full'
									onValueChange={value => {
										handleMixingChange('soundscapeVolume', value[0]);
									}}
								/>
							</div>

							{/* Volume Balance Indicator */}
							<div className='p-3 bg-muted/50 rounded-md'>
								<div className='flex items-center justify-between text-sm'>
									<span>总音量平衡:</span>
									<span className='font-medium'>
										人声 {Math.round(mixingSettings.voiceVolume * 100)}% | 音景{' '}
										{Math.round(mixingSettings.soundscapeVolume * 100)}%
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Fade Effects */}
					<Card>
						<CardHeader>
							<CardTitle>淡入淡出效果</CardTitle>
							<CardDescription>配置音频开始和结束的过渡效果</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Fade In */}
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<Label htmlFor='fade-in'>淡入时长</Label>
									<span className='text-sm font-medium'>{mixingSettings.fadeInDuration}秒</span>
								</div>
								<Slider
									id='fade-in'
									value={[mixingSettings.fadeInDuration]}
									min={0}
									max={10}
									step={0.5}
									className='w-full'
									onValueChange={value => {
										handleMixingChange('fadeInDuration', value[0]);
									}}
								/>
							</div>

							{/* Fade Out */}
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<Label htmlFor='fade-out'>淡出时长</Label>
									<span className='text-sm font-medium'>{mixingSettings.fadeOutDuration}秒</span>
								</div>
								<Slider
									id='fade-out'
									value={[mixingSettings.fadeOutDuration]}
									min={0}
									max={15}
									step={0.5}
									className='w-full'
									onValueChange={value => {
										handleMixingChange('fadeOutDuration', value[0]);
									}}
								/>
							</div>
						</CardContent>
					</Card>

					{/* EQ Settings */}
					<Card>
						<CardHeader>
							<CardTitle>均衡器设置</CardTitle>
							<CardDescription>调节音频的频率特性以优化听感</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Low Frequency */}
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<Label htmlFor='eq-low'>低频 (60-250Hz)</Label>
									<span className='text-sm font-medium'>
										{mixingSettings.eqSettings.lowFreq > 0 ? '+' : ''}
										{mixingSettings.eqSettings.lowFreq}dB
									</span>
								</div>
								<Slider
									id='eq-low'
									value={[mixingSettings.eqSettings.lowFreq]}
									min={-6}
									max={6}
									step={0.5}
									className='w-full'
									onValueChange={value => {
										handleEqChange('lowFreq', value[0]);
									}}
								/>
							</div>

							{/* Mid Frequency */}
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<Label htmlFor='eq-mid'>中频 (250-4000Hz)</Label>
									<span className='text-sm font-medium'>
										{mixingSettings.eqSettings.midFreq > 0 ? '+' : ''}
										{mixingSettings.eqSettings.midFreq}dB
									</span>
								</div>
								<Slider
									id='eq-mid'
									value={[mixingSettings.eqSettings.midFreq]}
									min={-6}
									max={6}
									step={0.5}
									className='w-full'
									onValueChange={value => {
										handleEqChange('midFreq', value[0]);
									}}
								/>
							</div>

							{/* High Frequency */}
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<Label htmlFor='eq-high'>高频 (4000-20000Hz)</Label>
									<span className='text-sm font-medium'>
										{mixingSettings.eqSettings.highFreq > 0 ? '+' : ''}
										{mixingSettings.eqSettings.highFreq}dB
									</span>
								</div>
								<Slider
									id='eq-high'
									value={[mixingSettings.eqSettings.highFreq]}
									min={-6}
									max={6}
									step={0.5}
									className='w-full'
									onValueChange={value => {
										handleEqChange('highFreq', value[0]);
									}}
								/>
							</div>

							<div className='p-3 bg-blue-50 border border-blue-200 rounded-md'>
								<div className='flex items-start gap-2'>
									<Info className='h-4 w-4 text-blue-600 mt-0.5' />
									<div className='space-y-1'>
										<p className='text-sm text-blue-800'>中频增强有助于提高人声清晰度，适合中老年听众</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='quality' className='space-y-6'>
					{/* Quality Requirements */}
					<Card>
						<CardHeader>
							<CardTitle>质量控制</CardTitle>
							<CardDescription>设置音频质量标准和自动重试机制</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Minimum Score */}
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<Label htmlFor='min-score'>最低质量评分</Label>
									<span className='text-sm font-medium'>{qualitySettings.minimumScore}/10</span>
								</div>
								<Slider
									id='min-score'
									value={[qualitySettings.minimumScore]}
									min={5}
									max={9.5}
									step={0.1}
									className='w-full'
									onValueChange={value => {
										handleQualityChange('minimumScore', value[0]);
									}}
								/>
								<p className='text-xs text-muted-foreground'>低于此评分的音频将被自动重新生成</p>
							</div>

							<Separator />

							{/* Auto Retry */}
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label htmlFor='auto-retry'>自动重试</Label>
									<p className='text-sm text-muted-foreground'>质量不达标时自动重新生成</p>
								</div>
								<Switch
									id='auto-retry'
									checked={qualitySettings.enableAutoRetry}
									onCheckedChange={checked => {
										handleQualityChange('enableAutoRetry', checked);
									}}
								/>
							</div>

							{/* Max Retries */}
							{qualitySettings.enableAutoRetry
								? <div className='space-y-3'>
									<div className='flex items-center justify-between'>
										<Label htmlFor='max-retries'>最大重试次数</Label>
										<span className='text-sm font-medium'>{qualitySettings.maxRetries}次</span>
									</div>
									<Slider
										id='max-retries'
										value={[qualitySettings.maxRetries]}
										min={1}
										max={5}
										step={1}
										className='w-full'
										onValueChange={value => {
											handleQualityChange('maxRetries', value[0]);
										}}
									/>
								</div>
								: null}

							<Separator />

							{/* Strict Validation */}
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label htmlFor='strict-validation'>严格验证</Label>
									<p className='text-sm text-muted-foreground'>启用更严格的音频质量检查</p>
								</div>
								<Switch
									id='strict-validation'
									checked={qualitySettings.strictValidation}
									onCheckedChange={checked => {
										handleQualityChange('strictValidation', checked);
									}}
								/>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='advanced' className='space-y-6'>
					{/* Advanced Options */}
					<Card>
						<CardHeader>
							<CardTitle>高级选项</CardTitle>
							<CardDescription>专业级音频处理选项</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='p-4 bg-muted/50 rounded-md'>
								<div className='flex items-center gap-2 mb-2'>
									<Headphones className='h-4 w-4' />
									<span className='font-medium'>双耳处理</span>
									<Badge variant='secondary'>即将推出</Badge>
								</div>
								<p className='text-sm text-muted-foreground'>3D音效、双耳节拍等高级功能将在后续版本中提供</p>
							</div>

							<div className='p-4 bg-muted/50 rounded-md'>
								<div className='flex items-center gap-2 mb-2'>
									<Zap className='h-4 w-4' />
									<span className='font-medium'>实时处理</span>
									<Badge variant='secondary'>即将推出</Badge>
								</div>
								<p className='text-sm text-muted-foreground'>实时音频效果预览和动态调整功能</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Settings Summary */}
			<Card className='bg-muted/50 border-muted'>
				<CardContent className='pt-6'>
					<h4 className='font-medium mb-3'>当前配置总览</h4>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
						<div>
							<span className='text-muted-foreground'>人声音量:</span>
							<span className='ml-2 font-medium'>{Math.round(mixingSettings.voiceVolume * 100)}%</span>
						</div>
						<div>
							<span className='text-muted-foreground'>音景音量:</span>
							<span className='ml-2 font-medium'>{Math.round(mixingSettings.soundscapeVolume * 100)}%</span>
						</div>
						<div>
							<span className='text-muted-foreground'>质量要求:</span>
							<span className='ml-2 font-medium'>{qualitySettings.minimumScore}/10</span>
						</div>
						<div>
							<span className='text-muted-foreground'>自动重试:</span>
							<Badge variant={qualitySettings.enableAutoRetry ? 'default' : 'secondary'} className='ml-2'>
								{qualitySettings.enableAutoRetry ? '启用' : '禁用'}
							</Badge>
						</div>
					</div>
					{selectedPreset
						? <div className='mt-3 pt-3 border-t border-muted'>
							<div className='flex items-center gap-2'>
								<Badge variant='secondary'>预设</Badge>
								<span className='text-sm'>{presets.find(p => p.id === selectedPreset)?.name}</span>
							</div>
						</div>
						: null}
				</CardContent>
			</Card>
		</div>
	);
}
