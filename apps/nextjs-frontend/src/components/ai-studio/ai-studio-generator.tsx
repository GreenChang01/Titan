'use client';

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {
	Loader2, Image, Download, RefreshCw, Settings, History, Eye, EyeOff, Sparkles, Star, Copy,
} from 'lucide-react';
import {useGenerateAIImage} from '@/hooks/use-ai-images';
import {cn} from '@/lib/utils';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';

type GenerationHistory = {
	id: string;
	url: string;
	prompt: string;
	seed: number;
	timestamp: Date;
	model: string;
	style: string;
	parameters: {
		width: number;
		height: number;
		enhance: boolean;
		private: boolean;
	};
};

type PromptTemplate = {
	id: string;
	name: string;
	category: string;
	prompt: string;
	description: string;
	preview?: string;
};

const PROMPT_TEMPLATES: PromptTemplate[] = [
	{
		id: 'nature-1',
		name: '森林小溪',
		category: 'nature',
		prompt: 'peaceful forest stream with soft sunlight filtering through green leaves, crystal clear water, moss-covered rocks, serene atmosphere, natural lighting, photorealistic, 4k',
		description: '宁静的森林小溪，阳光透过绿叶洒下',
	},
	{
		id: 'cozy-1',
		name: '温馨壁炉',
		category: 'cozy',
		prompt: 'warm fireplace with soft candlelight in a cozy living room, comfortable armchair, soft blankets, gentle ambient lighting, hygge atmosphere, soft shadows, inviting',
		description: '温暖舒适的壁炉场景',
	},
	{
		id: 'zen-1',
		name: '禅意花园',
		category: 'zen',
		prompt: 'minimalist zen garden with carefully arranged stones and sand, morning light, peaceful meditation space, simple wooden bench, bonsai tree, serene atmosphere, soft shadows',
		description: '简约禅意的日式庭院',
	},
	{
		id: 'abstract-1',
		name: '柔和抽象',
		category: 'abstract',
		prompt: 'soft flowing waves in calming blue and lavender tones, ethereal dreamscape, gentle gradients, abstract patterns, soft lighting, meditative mood, artistic',
		description: '柔和的抽象艺术风格',
	},
];

export function AIStudioGenerator() {
	const [prompt, setPrompt] = useState('');
	const [currentImage, setCurrentImage] = useState<GenerationHistory | undefined>(undefined);
	const [, setHistory] = useState<GenerationHistory[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [settings, setSettings] = useState({
		width: 1024,
		height: 1024,
		enhance: true,
		private: false,
		model: 'pollinations',
		style: 'photorealistic',
	});
	const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
	const [showAdvanced, setShowAdvanced] = useState(false);

	const generateMutation = useGenerateAIImage();

	const handleGenerate = async () => {
		if (!prompt.trim()) {
			return;
		}

		setIsGenerating(true);
		try {
			const result = await generateMutation.mutateAsync({
				prompt,
				model: settings.model,
				width: settings.width,
				height: settings.height,
				enhance: settings.enhance,
				nologo: true,
				private: settings.private,
				nofeed: false,
			});

			const newImage: GenerationHistory = {
				id: Date.now().toString(),
				url: result.imageUrl,
				prompt,
				seed: Math.floor(Math.random() * 1_000_000),
				timestamp: new Date(),
				model: settings.model,
				style: settings.style,
				parameters: {
					width: settings.width,
					height: settings.height,
					enhance: settings.enhance,
					private: settings.private,
				},
			};

			setCurrentImage(newImage);
			setHistory(prev => [newImage, ...prev].slice(0, 50));
		} catch (error) {
			console.error('Generation failed:', error);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleTemplateSelect = (template: PromptTemplate) => {
		setPrompt(template.prompt);
		setSelectedTemplate(template.id);
	};

	const handleQuickAction = (action: string) => {
		if (!currentImage) {
			return;
		}

		switch (action) {
			case 'download': {
				const link = document.createElement('a');
				link.href = currentImage.url;
				link.download = `ai-generated-${currentImage.id}.jpg`;
				document.body.append(link);
				link.click();
				link.remove();
				break;
			}

			case 'copy': {
				navigator.clipboard.writeText(currentImage.prompt);
				break;
			}

			case 'favorite': {
				// Add to favorites logic
				break;
			}
		}
	};

	const handleRegenerate = () => {
		if (currentImage) {
			setPrompt(currentImage.prompt);
			handleGenerate();
		}
	};

	return (
		<div className='min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 dark:from-slate-900 dark:via-purple-950/20 dark:to-blue-950/10 p-6'>
			<div className='max-w-4xl mx-auto'>
				{/* Header */}
				<div className='text-center mb-8'>
					<div className='flex items-center justify-center gap-4 mb-4'>
						<h1 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
							AI 图片生成
						</h1>
						<Button
							variant='outline'
							size='sm'
							onClick={() => globalThis.location.href = '/ai-studio/images'}
						>
							<History className='w-4 h-4 mr-2'/>
							查看历史记录
						</Button>
					</div>
					<p className='text-gray-600 dark:text-gray-400'>
						输入描述，AI 为你生成精美的图片
					</p>
				</div>

				{/* Generation Section */}
				<div className='space-y-6'>
					{/* Template Selection */}
					<Card className='border-0 shadow-sm bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/30 dark:to-blue-950/30'>
						<CardHeader className='pb-3'>
							<CardTitle className='text-sm font-medium'>模板库</CardTitle>
							<CardDescription className='text-xs'>选择预设场景快速开始</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
								{PROMPT_TEMPLATES.map(template => (
									<button
										key={template.id}
										className={cn(
											'p-3 rounded-lg border text-sm transition-all text-left',
											selectedTemplate === template.id
												? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50'
												: 'border-gray-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-purple-700',
										)}
										onClick={() => {
											handleTemplateSelect(template);
										}}
									>
										<div className='font-medium truncate'>{template.name}</div>
										<div className='text-xs text-gray-500 dark:text-gray-400 truncate'>
											{template.description}
										</div>
									</button>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Prompt Input */}
					<div className='space-y-3'>
						<Label className='text-sm font-medium'>创意描述</Label>
						<Textarea
							placeholder='描述你想要生成的场景，越详细效果越好...'
							value={prompt}
							className='min-h-[120px] resize-none border-gray-300 dark:border-gray-600 focus:border-purple-500'
							maxLength={500}
							onChange={e => {
								setPrompt(e.target.value);
							}}
						/>
						<div className='text-xs text-gray-500 text-right'>
							{prompt.length}/500
						</div>
					</div>

					{/* Advanced Settings */}
					<Card className='border-0 shadow-sm bg-gray-50/50 dark:bg-gray-900/50'>
						<CardHeader className='pb-3'>
							<CardTitle className='text-sm font-medium flex items-center gap-2'>
								<Settings className='w-4 h-4'/>
								高级设置
								<Button
									variant='ghost'
									size='sm'
									className='ml-auto text-xs'
									onClick={() => {
										setShowAdvanced(!showAdvanced);
									}}
								>
									{showAdvanced ? <EyeOff className='w-3 h-3'/> : <Eye className='w-3 h-3'/>}
									{showAdvanced ? '隐藏' : '展开'}
								</Button>
							</CardTitle>
						</CardHeader>
						{showAdvanced ? <CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label className='text-sm'>尺寸</Label>
								<div className='grid grid-cols-4 gap-2'>
									{[512, 768, 1024, 1536].map(size => (
										<button
											key={size}
											className={cn(
												'px-2 py-1 text-xs rounded border',
												settings.width === size
													? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50'
													: 'border-gray-300 hover:border-purple-300 dark:border-gray-600 dark:hover:border-purple-700',
											)}
											onClick={() => {
												setSettings(prev => ({...prev, width: size, height: size}));
											}}
										>
											{size}×{size}
										</button>
									))}
								</div>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div className='flex items-center justify-between'>
									<Label htmlFor='enhance' className='text-sm'>画质增强</Label>
									<Switch
										id='enhance'
										checked={settings.enhance}
										onCheckedChange={checked => {
											setSettings(prev => ({...prev, enhance: checked}));
										}}
									/>
								</div>
								<div className='flex items-center justify-between'>
									<Label htmlFor='private' className='text-sm'>私有模式</Label>
									<Switch
										id='private'
										checked={settings.private}
										onCheckedChange={checked => {
											setSettings(prev => ({...prev, private: checked}));
										}}
									/>
								</div>
							</div>
						</CardContent> : null}
					</Card>

					{/* Generate Button */}
					<Button
						disabled={isGenerating || !prompt.trim()}
						className='w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
						size='lg'
						onClick={handleGenerate}
					>
						{isGenerating ? (
							<>
								<Loader2 className='w-5 h-5 mr-2 animate-spin'/>
								生成中...
							</>
						) : (
							<>
								<Sparkles className='w-5 h-5 mr-2'/>
								开始创作
							</>
						)}
					</Button>

					{/* Generated Image */}
					{currentImage ? <Card className='border-0 shadow-lg'>
						<CardHeader>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<Image className='w-4 h-4 text-purple-500'/>
									<span className='text-sm font-medium'>生成结果</span>
								</div>
								<div className='flex items-center gap-2'>
									<Button
										size='sm' variant='ghost' onClick={() => {
											handleQuickAction('download');
										}}
									>
										<Download className='w-4 h-4'/>
									</Button>
									<Button
										size='sm' variant='ghost' onClick={() => {
											handleQuickAction('copy');
										}}
									>
										<Copy className='w-4 h-4'/>
									</Button>
									<Button
										size='sm' variant='ghost' onClick={() => {
											handleQuickAction('favorite');
										}}
									>
										<Star className='w-4 h-4'/>
									</Button>
									<Button size='sm' variant='ghost' onClick={handleRegenerate}>
										<RefreshCw className='w-4 h-4'/>
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-center'>
								<img
									src={currentImage.url}
									alt={currentImage.prompt}
									className='rounded-lg shadow-lg max-w-full max-h-[500px] object-contain mx-auto'
								/>
							</div>
							<div className='mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
									<div>
										<span className='text-gray-500 dark:text-gray-400'>提示词:</span>
										<p className='text-gray-700 dark:text-gray-300 mt-1 line-clamp-2'>
											{currentImage.prompt}
										</p>
									</div>
									<div>
										<span className='text-gray-500 dark:text-gray-400'>参数:</span>
										<div className='flex gap-2 mt-1'>
											<Badge variant='secondary' className='text-xs'>
												{currentImage.parameters.width}×{currentImage.parameters.height}
											</Badge>
											<Badge variant='outline' className='text-xs'>
												种子: {currentImage.seed}
											</Badge>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card> : null}
				</div>
			</div>
		</div>
	);
}

