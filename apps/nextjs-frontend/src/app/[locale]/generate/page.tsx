'use client';

import {type JSX, useState} from 'react';
import {Sparkles, FileText, Mic, Volume2, Settings, Play, Download, Loader2} from 'lucide-react';
import {useASMRStore} from '@/store/asmr/asmr.store';
import {Header} from '@/components/layout/header';
import {Main} from '@/components/layout/main';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Badge} from '@/components/ui/badge';
import {Slider} from '@/components/ui/slider';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Progress} from '@/components/ui/progress';
import {Separator} from '@/components/ui/separator';

export default function ASMRGenerationPage(): JSX.Element {
	const {formData, setText, setVoiceSettings, generateAudio, isSubmitting, error, result} = useASMRStore();
	const [isGenerating, setIsGenerating] = useState(false);
	const [progress, setProgress] = useState(0);

	// 内容模板
	const contentTemplates = [
		{
			title: '睡前放松',
			content: '闭上眼睛，让身体完全放松下来。感受每一次呼吸带来的宁静，让思绪慢慢沉淀。今天的疲惫正在离你而去，取而代之的是深深的安宁。',
			category: '睡眠引导',
		},
		{
			title: '自然冥想',
			content: '想象自己置身于宁静的森林中，微风轻抚过树叶，发出沙沙的声响。鸟儿在远处轻声歌唱，溪水潺潺流淌。这里只有你和大自然的和谐共鸣。',
			category: '冥想引导',
		},
		{
			title: '正念练习',
			content: '将注意力集中在当下的感受。感受空气进入肺部的温度，感受身体与椅子接触的感觉。没有过去，没有未来，只有此刻的宁静和专注。',
			category: '正念练习',
		},
	];

	// 语音预设
	const voicePresets = [
		{
			id: 'female-gentle',
			name: '温柔女声',
			description: '适合睡前故事和冥想引导',
			category: '女性',
		},
		{
			id: 'male-calm',
			name: '沉稳男声',
			description: '适合正念练习和深度放松',
			category: '男性',
		},
		{
			id: 'female-mature',
			name: '成熟女声',
			description: '温暖亲切，适合中老年听众',
			category: '女性',
		},
	];

	// 音景预设
	const soundscapePresets = [
		{id: 'rain', name: '雨声', description: '温和的雨声背景'},
		{id: 'forest', name: '森林', description: '鸟鸣与风声'},
		{id: 'ocean', name: '海洋', description: '轻柔的海浪声'},
		{id: 'fireplace', name: '壁炉', description: '温暖的火声'},
		{id: 'none', name: '无背景', description: '纯人声'},
	];

	const handleGenerate = async () => {
		if (!formData.text?.trim() || !formData.voiceSettings?.voiceId) {
			return;
		}

		setIsGenerating(true);
		setProgress(0);

		// 模拟生成过程
		const interval = setInterval(() => {
			setProgress(prev => {
				if (prev >= 95) {
					clearInterval(interval);
					return 95;
				}
				return prev + Math.random() * 10;
			});
		}, 500);

		try {
			await generateAudio();
			setProgress(100);
		} catch (err) {
			console.error('Generation failed:', err);
		} finally {
			setIsGenerating(false);
			clearInterval(interval);
		}
	};

	const isValid = formData.text?.trim() && formData.voiceSettings?.voiceId;

	return (
		<>
			<Header>
				<h1 className='text-lg font-medium flex items-center gap-2'>
					<Sparkles className='h-5 w-5 text-primary'/>
					开始创作
				</h1>
				<p className='text-sm text-muted-foreground'>
					一键生成高质量ASMR音频内容
				</p>
			</Header>

			<Main>
				<div className='max-w-4xl mx-auto space-y-6'>
					{/* 错误提示 */}
					{error && (
						<Card className='border-destructive'>
							<CardContent className='pt-6'>
								<div className='text-sm text-destructive'>
									<strong>错误:</strong> {error}
								</div>
							</CardContent>
						</Card>
					)}

					{/* 生成进度 */}
					{isGenerating && (
						<Card>
							<CardContent className='pt-6'>
								<div className='space-y-4'>
									<div className='flex items-center gap-3'>
										<Loader2 className='h-5 w-5 animate-spin text-primary'/>
										<span className='text-sm font-medium'>正在生成ASMR音频...</span>
									</div>
									<Progress value={progress} className='w-full'/>
									<div className='text-xs text-muted-foreground'>
										{progress < 30 && '正在处理文本内容...'}
										{progress >= 30 && progress < 70 && '正在生成语音...'}
										{progress >= 70 && progress < 95 && '正在添加音景效果...'}
										{progress >= 95 && '即将完成...'}
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* 主要内容区域 */}
					<div className='grid gap-6 lg:grid-cols-2'>
						{/* 左侧：文本内容 */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<FileText className='h-5 w-5'/>
									文本内容
								</CardTitle>
								<CardDescription>
									输入您想要转换为ASMR音频的文本内容
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='space-y-2'>
									<Textarea
										placeholder='在这里输入您的文本内容...'
										value={formData.text || ''}
										className='min-h-[200px] text-base leading-relaxed'
										maxLength={2000}
										onChange={e => setText(e.target.value)}
									/>
									<div className='flex justify-between items-center text-sm text-muted-foreground'>
										<span>建议长度：100-800字符</span>
										<span>{formData.text?.length || 0} / 2000</span>
									</div>
								</div>

								{/* 内容模板 */}
								<div className='space-y-3'>
									<Label className='text-sm font-medium'>快速模板</Label>
									<div className='grid gap-2'>
										{contentTemplates.map((template, index) => (
											<Card key={index} className='cursor-pointer hover:bg-muted/50 transition-colors'>
												<CardContent className='p-3'>
													<div className='space-y-2'>
														<div className='flex items-center justify-between'>
															<span className='font-medium text-sm'>{template.title}</span>
															<Badge variant='secondary' className='text-xs'>
																{template.category}
															</Badge>
														</div>
														<p className='text-xs text-muted-foreground line-clamp-2'>
															{template.content}
														</p>
														<Button
															variant='outline'
															size='sm'
															className='w-full'
															onClick={() => setText(template.content)}
														>
															使用此模板
														</Button>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* 右侧：语音设置 */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Mic className='h-5 w-5'/>
									语音设置
								</CardTitle>
								<CardDescription>
									选择语音类型和音效设置
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6'>
								{/* 语音选择 */}
								<div className='space-y-3'>
									<Label className='text-sm font-medium'>语音类型</Label>
									<Select
										value={formData.voiceSettings?.voiceId || ''}
										onValueChange={(value) => setVoiceSettings({voiceId: value})}
									>
										<SelectTrigger>
											<SelectValue placeholder='选择语音类型'/>
										</SelectTrigger>
										<SelectContent>
											{voicePresets.map(voice => (
												<SelectItem key={voice.id} value={voice.id}>
													<div className='flex items-center justify-between w-full'>
														<span>{voice.name}</span>
														<Badge variant='outline' className='ml-2'>
															{voice.category}
														</Badge>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<Separator/>

								{/* 音景设置 */}
								<div className='space-y-3'>
									<Label className='text-sm font-medium'>背景音景</Label>
									<Select
										value={formData.soundscapeConfig?.category || 'none'}
										onValueChange={(value) => setVoiceSettings({soundscape: value})}
									>
										<SelectTrigger>
											<SelectValue placeholder='选择背景音景'/>
										</SelectTrigger>
										<SelectContent>
											{soundscapePresets.map(soundscape => (
												<SelectItem key={soundscape.id} value={soundscape.id}>
													<div className='flex flex-col'>
														<span>{soundscape.name}</span>
														<span className='text-xs text-muted-foreground'>
															{soundscape.description}
														</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<Separator/>

								{/* 语音参数 */}
								<div className='space-y-4'>
									<div className='space-y-2'>
										<Label className='text-sm font-medium flex items-center gap-2'>
											<Volume2 className='h-4 w-4'/>
											语音速度
										</Label>
										<Slider
											value={[formData.voiceSettings?.speed || 1.0]}
											max={2.0}
											min={0.5}
											step={0.1}
											onValueChange={(value) => setVoiceSettings({speed: value[0]})}
										/>
										<div className='flex justify-between text-xs text-muted-foreground'>
											<span>慢速</span>
											<span>正常</span>
											<span>快速</span>
										</div>
									</div>

									<div className='space-y-2'>
										<Label className='text-sm font-medium flex items-center gap-2'>
											<Settings className='h-4 w-4'/>
											语音音量
										</Label>
										<Slider
											value={[formData.voiceSettings?.volume || 0.8]}
											max={1.0}
											min={0.1}
											step={0.1}
											onValueChange={(value) => setVoiceSettings({volume: value[0]})}
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* 生成按钮 */}
					<Card>
						<CardContent className='pt-6'>
							<div className='flex justify-center'>
								<Button
									size='lg'
									className='min-w-[200px] h-12'
									disabled={!isValid || isGenerating}
									onClick={handleGenerate}
								>
									{isGenerating ? (
										<>
											<Loader2 className='h-5 w-5 animate-spin mr-2'/>
											生成中...
										</>
									) : (
										<>
											<Sparkles className='h-5 w-5 mr-2'/>
											开始生成
										</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* 生成结果 */}
					{result && (
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Play className='h-5 w-5'/>
									生成完成
								</CardTitle>
								<CardDescription>
									您的ASMR音频已生成完成
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									<div className='flex items-center gap-4'>
										<Button variant='outline' size='sm'>
											<Play className='h-4 w-4 mr-2'/>
											预览播放
										</Button>
										<Button size='sm'>
											<Download className='h-4 w-4 mr-2'/>
											下载音频
										</Button>
									</div>
									<div className='text-sm text-muted-foreground'>
										文件大小: {result.fileSize || 'N/A'} | 时长: {result.duration || 'N/A'}
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</Main>
		</>
	);
}