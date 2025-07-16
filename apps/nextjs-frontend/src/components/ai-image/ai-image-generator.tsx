'use client';

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
	Loader2, Wand2, Image, Download, RefreshCw,
} from 'lucide-react';
import {useGenerateAIImage} from '@/hooks/use-ai-images';

type AIImageGeneratorProps = {
	readonly onGenerated?: (imageUrl: string, prompt: string) => void;
};

type ASMRTemplate = {
	title: string;
	description: string;
	templates: string[];
};

type ASMRTemplates = Record<string, ASMRTemplate>;

// ASMR场景预设模板
const ASMR_TEMPLATES: ASMRTemplates = {
	nature: {
		title: '自然景观',
		description: '宁静的自然场景，适合ASMR放松',
		templates: [
			'peaceful forest stream with soft sunlight filtering through green leaves',
			'tranquil mountain lake reflecting clouds at golden sunset',
			'gentle rainfall on moss-covered rocks in a serene garden',
			'soft ocean waves touching a sandy beach under starlight',
			'misty mountain path with wildflowers and butterflies',
			'quiet bamboo forest with gentle breeze and dappled light',
		],
	},
	cozy: {
		title: '温馨环境',
		description: '温暖舒适的室内场景',
		templates: [
			'warm fireplace with soft candlelight in a cozy living room',
			'comfortable reading nook with soft blankets and dim lighting',
			'peaceful bedroom with soft morning light through sheer curtains',
			'vintage study room with books and a warm desk lamp',
			'cozy cafe corner with soft lighting and comfortable chairs',
			'serene tea ceremony setup with delicate porcelain and flowers',
		],
	},
	abstract: {
		title: '抽象艺术',
		description: '柔和的抽象图案和色彩',
		templates: [
			'soft flowing waves in calming blue and lavender tones',
			'gentle abstract patterns in warm earth colors and gold accents',
			'peaceful geometric shapes with soft gradients and light effects',
			'dreamy watercolor textures in pastel pink and blue',
			'minimalist zen patterns with soft curves and natural colors',
			'ethereal light patterns with gentle bokeh effects',
		],
	},
	zen: {
		title: '禅意空间',
		description: '简约禅意的场景设计',
		templates: [
			'minimalist zen garden with carefully arranged stones and sand',
			'simple meditation space with soft cushions and gentle lighting',
			'clean japanese room with tatami mats and paper screens',
			'peaceful temple courtyard with stone lanterns and plants',
			'serene spa environment with candles and natural elements',
			'quiet monastery garden with simple paths and green moss',
		],
	},
};

export function AIImageGenerator({
	onGenerated,
}: AIImageGeneratorProps) {
	const [prompt, setPrompt] = useState('');
	const [generatedImage, setGeneratedImage] = useState<{
		url: string;
		prompt: string;
		seed: number;
	} | undefined>(undefined);
	const [selectedCategory, setSelectedCategory] = useState<string>('nature');

	const generateMutation = useGenerateAIImage();

	const handleGenerate = async () => {
		if (!prompt.trim()) {
			return;
		}

		try {
			const result = await generateMutation.mutateAsync({
				prompt,
				model: 'pollinations',
				width: 1024,
				height: 1024,
				enhance: true,
				nologo: true,
				private: false,
				nofeed: false,
			});

			const imageData = {
				url: result.imageUrl,
				prompt,
				seed: Math.floor(Math.random() * 1_000_000), // Generate a random seed for display
			};

			setGeneratedImage(imageData);

			if (onGenerated) {
				onGenerated(imageData.url, imageData.prompt);
			}
		} catch (error) {
			console.error('AI图片生成失败:', error);
		}
	};

	const handleRegenerate = async () => {
		if (!generatedImage) {
			return;
		}

		try {
			const result = await generateMutation.mutateAsync({
				prompt: generatedImage.prompt,
				model: 'pollinations',
				width: 1024,
				height: 1024,
				enhance: true,
				nologo: true,
				private: false,
				nofeed: false,
			});

			const imageData = {
				url: result.imageUrl,
				prompt: generatedImage.prompt,
				seed: Math.floor(Math.random() * 1_000_000), // Generate a new random seed
			};

			setGeneratedImage(imageData);

			if (onGenerated) {
				onGenerated(imageData.url, imageData.prompt);
			}
		} catch (error) {
			console.error('重新生成失败:', error);
		}
	};

	const handleTemplateSelect = (template: string) => {
		setPrompt(template);
	};

	const handleDownload = () => {
		if (generatedImage) {
			const link = document.createElement('a');
			link.href = generatedImage.url;
			link.download = `ai-generated-${generatedImage.seed}.jpg`;
			document.body.append(link);
			link.click();
			link.remove();
		}
	};

	return (
		<div className='space-y-6'>
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Wand2 className='w-5 h-5'/>
						AI图片生成器
					</CardTitle>
					<CardDescription>
						使用AI技术生成ASMR场景相关的图片素材
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>选择场景类型</label>
						<Select value={selectedCategory} onValueChange={setSelectedCategory}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(ASMR_TEMPLATES).map(([key, template]) => (
									<SelectItem key={key} value={key}>
										{template.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className='text-sm text-muted-foreground'>
							{ASMR_TEMPLATES[selectedCategory]?.description}
						</p>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>场景模板</label>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
							{ASMR_TEMPLATES[selectedCategory]?.templates.map((templateText, index) => (
								<Button
									key={index}
									variant='outline'
									size='sm'
									className='text-left justify-start h-auto p-3'
									onClick={() => {
										handleTemplateSelect(templateText);
									}}
								>
									<span className='text-xs'>{templateText}</span>
								</Button>
							))}
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>图片描述</label>
						<Textarea
							placeholder='描述你想要生成的图片内容，例如：宁静的森林小溪，阳光透过树叶洒下...'
							value={prompt}
							rows={3}
							className='resize-none'
							onChange={e => {
								setPrompt(e.target.value);
							}}
						/>
					</div>

					<Button
						disabled={generateMutation.isPending || !prompt.trim()}
						className='w-full'
						onClick={handleGenerate}
					>
						{generateMutation.isPending ? (
							<>
								<Loader2 className='w-4 h-4 mr-2 animate-spin'/>
								生成中...
							</>
						) : (
							<>
								<Image className='w-4 h-4 mr-2'/>
								生成图片
							</>
						)}
					</Button>
				</CardContent>
			</Card>

			{generatedImage ? <Card>
				<CardHeader>
					<CardTitle className='flex items-center justify-between'>
						<span>生成结果</span>
						<div className='flex gap-2'>
							<Button
								variant='outline'
								size='sm'
								disabled={generateMutation.isPending}
								onClick={handleRegenerate}
							>
								<RefreshCw className='w-4 h-4 mr-1'/>
								重新生成
							</Button>
							<Button
								variant='outline'
								size='sm'
								onClick={handleDownload}
							>
								<Download className='w-4 h-4 mr-1'/>
								下载
							</Button>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						<div className='relative'>
							<img
								src={generatedImage.url}
								alt={generatedImage.prompt}
								className='w-full max-w-md mx-auto rounded-lg shadow-lg'
								onError={() => {
									console.error('图片加载失败');
								}}
							/>
						</div>

						<div className='space-y-2'>
							<div className='flex items-center gap-2'>
								<Badge variant='secondary'>提示词</Badge>
								<span className='text-sm text-muted-foreground'>
									{generatedImage.prompt}
								</span>
							</div>
							<div className='flex items-center gap-2'>
								<Badge variant='outline'>种子</Badge>
								<span className='text-sm text-muted-foreground'>
									{generatedImage.seed}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
                     </Card> : null}
		</div>
	);
}
