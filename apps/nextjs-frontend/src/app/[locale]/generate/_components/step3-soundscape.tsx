'use client';

import {useState, useEffect, type JSX} from 'react';
import {
	Play, Pause, Volume2, Loader2,
} from 'lucide-react';
import type {ASMRPreset, SoundscapeOptions} from '@titan/shared';
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
import {Separator} from '@/components/ui/separator';
import {useASMRStore} from '@/store/asmr/asmr.store';
import {ASMRApiService} from '@/lib/services/asmr-api.service';
import {cn} from '@/lib/utils';

export function Step3Soundscape(): JSX.Element {
	const {formData, setSoundscapeConfig} = useASMRStore();
	const [presets, setPresets] = useState<ASMRPreset[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedPreset, setSelectedPreset] = useState<string>('');
	const [customSettings, setCustomSettings] = useState<SoundscapeOptions>({
		prompt: '',
		duration: 300,
		category: 'nature',
		intensity: 3,
		quality: 'high',
	});

	// Load presets on component mount
	useEffect(() => {
		const loadPresets = async () => {
			try {
				setIsLoading(true);
				const data = await ASMRApiService.getPresets();
				setPresets(data.soundscapePresets);
			} catch (error) {
				console.error('Failed to load soundscape presets:', error);
			} finally {
				setIsLoading(false);
			}
		};

		void loadPresets();
	}, []);

	// Initialize with existing data if available
	useEffect(() => {
		if (formData.soundscapeConfig) {
			setCustomSettings(formData.soundscapeConfig);
		}
	}, [formData.soundscapeConfig]);

	const handlePresetSelect = (presetId: string) => {
		setSelectedPreset(presetId);
		const preset = presets.find(p => p.id === presetId);
		if (preset?.settings) {
			const soundscapeSettings = preset.settings as SoundscapeOptions;
			setCustomSettings(soundscapeSettings);
			setSoundscapeConfig(soundscapeSettings);
		}
	};

	const handleCustomSettingChange = (field: keyof SoundscapeOptions, value: any) => {
		const updatedSettings = {...customSettings, [field]: value};
		setCustomSettings(updatedSettings);
		setSoundscapeConfig(updatedSettings);
		// Clear preset selection when manually adjusting
		if (selectedPreset) {
			setSelectedPreset('');
		}
	};

	const formatDuration = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-12'>
				<Loader2 className='h-6 w-6 animate-spin mr-2' />
				<span className='text-muted-foreground'>加载音景预设...</span>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Preset Selection */}
			<Card>
				<CardHeader>
					<CardTitle>音景预设</CardTitle>
					<CardDescription>选择一个预设音景，或自定义音景设置</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
									<div className='space-y-3'>
										<div className='flex items-start justify-between'>
											<h4 className='font-medium'>{preset.name}</h4>
											<Badge variant='secondary' className='text-xs'>
												{preset.settings?.category || 'nature'}
											</Badge>
										</div>
										<p className='text-sm text-muted-foreground'>{preset.description}</p>
										<div className='flex items-center justify-between text-xs text-muted-foreground'>
											<span>时长: {formatDuration(preset.settings?.duration || 300)}</span>
											<span>强度: {preset.settings?.intensity || 3}/5</span>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Custom Settings */}
			<Card>
				<CardHeader>
					<CardTitle>音景设置</CardTitle>
					<CardDescription>自定义音景参数以满足特定需求</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					{/* Duration Slider */}
					<div className='space-y-3'>
						<div className='flex items-center justify-between'>
							<Label htmlFor='duration'>音景时长</Label>
							<span className='text-sm font-medium'>{formatDuration(customSettings.duration)}</span>
						</div>
						<Slider
							id='duration'
							value={[customSettings.duration]}
							min={60}
							max={1800}
							step={30}
							className='w-full'
							onValueChange={value => {
								handleCustomSettingChange('duration', value[0]);
							}}
						/>
						<div className='flex justify-between text-xs text-muted-foreground'>
							<span>1分钟</span>
							<span>30分钟</span>
						</div>
					</div>

					<Separator />

					{/* Category Selection */}
					<div className='space-y-3'>
						<Label htmlFor='category'>音景类别</Label>
						<Select
							value={customSettings.category}
							onValueChange={value => {
								handleCustomSettingChange('category', value);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder='选择音景类别' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='nature'>自然环境</SelectItem>
								<SelectItem value='indoor'>室内环境</SelectItem>
								<SelectItem value='urban'>城市环境</SelectItem>
								<SelectItem value='abstract'>抽象声音</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Intensity Slider */}
					<div className='space-y-3'>
						<div className='flex items-center justify-between'>
							<Label htmlFor='intensity'>音景强度</Label>
							<span className='text-sm font-medium'>{customSettings.intensity}/5</span>
						</div>
						<Slider
							id='intensity'
							value={[customSettings.intensity]}
							min={1}
							max={5}
							step={1}
							className='w-full'
							onValueChange={value => {
								handleCustomSettingChange('intensity', value[0]);
							}}
						/>
						<div className='flex justify-between text-xs text-muted-foreground'>
							<span>轻柔</span>
							<span>强烈</span>
						</div>
					</div>

					<Separator />

					{/* Quality Selection */}
					<div className='space-y-3'>
						<Label htmlFor='quality'>音频质量</Label>
						<Select
							value={customSettings.quality}
							onValueChange={value => {
								handleCustomSettingChange('quality', value as 'standard' | 'high' | 'premium');
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder='选择音频质量' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='standard'>标准质量</SelectItem>
								<SelectItem value='high'>高质量</SelectItem>
								<SelectItem value='premium'>专业质量</SelectItem>
							</SelectContent>
						</Select>
						<p className='text-xs text-muted-foreground'>更高质量的音频会消耗更多处理时间和费用</p>
					</div>
				</CardContent>
			</Card>

			{/* Current Selection Summary */}
			<Card className='bg-muted/50 border-muted'>
				<CardContent className='pt-6'>
					<h4 className='font-medium mb-3'>当前音景配置</h4>
					<div className='grid grid-cols-2 gap-4 text-sm'>
						<div>
							<span className='text-muted-foreground'>类别:</span>
							<span className='ml-2 font-medium'>
								{customSettings.category === 'nature'
									? '自然环境'
									: customSettings.category === 'indoor'
										? '室内环境'
										: customSettings.category === 'urban'
											? '城市环境'
											: '抽象声音'}
							</span>
						</div>
						<div>
							<span className='text-muted-foreground'>时长:</span>
							<span className='ml-2 font-medium'>{formatDuration(customSettings.duration)}</span>
						</div>
						<div>
							<span className='text-muted-foreground'>强度:</span>
							<span className='ml-2 font-medium'>{customSettings.intensity}/5</span>
						</div>
						<div>
							<span className='text-muted-foreground'>质量:</span>
							<span className='ml-2 font-medium'>
								{customSettings.quality === 'standard' ? '标准' : (customSettings.quality === 'high' ? '高质量' : '专业')}
							</span>
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
