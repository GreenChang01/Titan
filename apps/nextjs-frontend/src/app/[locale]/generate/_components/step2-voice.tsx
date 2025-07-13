'use client';

import {type JSX} from 'react';
import {Mic, Volume2, Settings} from 'lucide-react';
import {useASMRStore} from '@/store/asmr/asmr.store';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {Slider} from '@/components/ui/slider';

export function Step2Voice(): JSX.Element {
	const {formData, setVoiceSettings, completeStep, nextStep} = useASMRStore();

	const handleVoiceChange = (field: string, value: any) => {
		setVoiceSettings({[field]: value});
		// Auto-complete step when voice is selected
		if (field === 'voiceId' && value) {
			completeStep(2);
		}
	};

	const handleContinue = () => {
		if (formData.voiceSettings?.voiceId) {
			completeStep(2);
			nextStep();
		}
	};

	// 模拟语音预设数据 (实际应该从API获取)
	const voicePresets = [
		{
			id: 'female-gentle',
			name: '温柔女声',
			description: '适合睡前故事和冥想引导',
			category: '女性',
			ageGroup: '中年',
		},
		{
			id: 'male-calm',
			name: '沉稳男声',
			description: '适合正念练习和深度放松',
			category: '男性',
			ageGroup: '中年',
		},
		{
			id: 'female-mature',
			name: '成熟女声',
			description: '温暖亲切，适合中老年听众',
			category: '女性',
			ageGroup: '成熟',
		},
	];

	return (
		<div className='space-y-6'>
			{/* 语音选择 */}
			<div className='space-y-4'>
				<div className='space-y-2'>
					<Label className='text-base font-medium flex items-center gap-2'>
						<Mic className='h-4 w-4'/>
						选择AI语音
					</Label>
					<p className='text-sm text-muted-foreground'>选择最适合您内容的语音风格。每种语音都经过ASMR优化调校。</p>
				</div>

				<div className='grid gap-4'>
					{voicePresets.map(voice => (
						<Card
							key={voice.id}
							className={`cursor-pointer transition-colors ${
								formData.voiceSettings?.voiceId === voice.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
							}`}
							onClick={() => {
								handleVoiceChange('voiceId', voice.id);
							}}
						>
							<CardContent className='p-4'>
								<div className='flex items-center justify-between'>
									<div className='space-y-1'>
										<div className='flex items-center gap-2'>
											<h4 className='font-medium'>{voice.name}</h4>
											<Badge variant='secondary'>{voice.category}</Badge>
											<Badge variant='outline'>{voice.ageGroup}</Badge>
										</div>
										<p className='text-sm text-muted-foreground'>{voice.description}</p>
									</div>
									<Button variant='outline' size='sm'>
										试听
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* 高级语音设置 */}
			{formData.voiceSettings?.voiceId ? (
				<Card>
					<CardHeader>
						<CardTitle className='text-lg flex items-center gap-2'>
							<Settings className='h-5 w-5'/>
							高级语音设置
						</CardTitle>
						<CardDescription>调整语音参数以获得最佳ASMR效果（可选）</CardDescription>
					</CardHeader>
					<CardContent className='space-y-6'>
						{/* 稳定性 */}
						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<Label>语音稳定性</Label>
								<span className='text-sm text-muted-foreground'>
									{Math.round((formData.voiceSettings?.stability || 0.85) * 100)}%
								</span>
							</div>
							<Slider
								value={[formData.voiceSettings?.stability || 0.85]}
								max={1}
								min={0}
								step={0.05}
								className='w-full'
								onValueChange={([value]) => {
									handleVoiceChange('stability', value);
								}}
							/>
							<p className='text-xs text-muted-foreground'>更高的稳定性产生更一致的语音，适合ASMR内容</p>
						</div>

						{/* 相似度 */}
						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<Label>语音相似度</Label>
								<span className='text-sm text-muted-foreground'>
									{Math.round((formData.voiceSettings?.similarity || 0.9) * 100)}%
								</span>
							</div>
							<Slider
								value={[formData.voiceSettings?.similarity || 0.9]}
								max={1}
								min={0}
								step={0.05}
								className='w-full'
								onValueChange={([value]) => {
									handleVoiceChange('similarity', value);
								}}
							/>
							<p className='text-xs text-muted-foreground'>保持语音特征的一致性</p>
						</div>

						{/* 风格强度 */}
						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<Label>风格强度</Label>
								<span className='text-sm text-muted-foreground'>
									{Math.round((formData.voiceSettings?.style || 0.1) * 100)}%
								</span>
							</div>
							<Slider
								value={[formData.voiceSettings?.style || 0.1]}
								max={1}
								min={0}
								step={0.05}
								className='w-full'
								onValueChange={([value]) => {
									handleVoiceChange('style', value);
								}}
							/>
							<p className='text-xs text-muted-foreground'>较低的风格强度产生更自然的语音效果</p>
						</div>
					</CardContent>
				</Card>
			) : null}

			{/* 中老年人优化提示 */}
			<Card className='bg-green-50 border-green-200'>
				<CardContent className='pt-6'>
					<div className='space-y-2'>
						<h4 className='font-medium text-green-900 flex items-center gap-2'>
							<Volume2 className='h-4 w-4'/>
							中老年人友好优化
						</h4>
						<p className='text-sm text-green-800'>
							当前设置已针对中老年听众进行优化：高稳定性、清晰发音、适中语速。 这些参数有助于提高听力理解度和放松效果。
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
