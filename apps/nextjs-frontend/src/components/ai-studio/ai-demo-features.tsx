'use client';

import React, {useState} from 'react';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
	Tabs, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
	Play, Pause, RotateCcw, Settings, Zap, Eye, Download, Sparkles, Layers, Palette, Image as ImageIcon, FileText, X,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {ScrollArea} from '@/components/ui/scroll-area';

interface DemoFeature {
	id: string;
	title: string;
	description: string;
	category: string;
	difficulty: 'easy' | 'medium' | 'hard';
	estimatedTime: string;
	imageUrl: string;
	parameters: Record<string, any>;
	steps: string[];
}

const demoFeatures: DemoFeature[] = [
	{
		id: 'text-to-image',
		title: '文字转图片',
		description: '输入文字描述，AI自动生成精美图片',
		category: '基础功能',
		difficulty: 'easy',
		estimatedTime: '30秒',
		imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
		parameters: {
			prompt: '宁静的森林小溪，阳光透过绿叶洒下',
			style: 'photorealistic',
			enhance: true,
			width: 1024,
			height: 1024
		},
		steps: [
			'输入创意描述文字',
			'选择图片风格和参数',
			'点击生成按钮',
			'等待AI处理完成',
			'下载或分享结果'
		]
	},
	{
		id: 'style-transfer',
		title: '风格迁移',
		description: '将一张图片的风格应用到另一张图片上',
		category: '进阶功能',
		difficulty: 'medium',
		estimatedTime: '1分钟',
		imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
		parameters: {
			contentImage: '原始图片',
			styleImage: '风格图片',
			strength: 0.8,
			preserveColors: true
		},
		steps: [
			'上传原始图片',
			'选择风格图片',
			'调整风格强度',
			'设置保留颜色选项',
			'应用风格迁移'
		]
	},
	{
		id: 'batch-generation',
		title: '批量生成',
		description: '一次性生成多张相似风格的图片',
		category: '效率工具',
		difficulty: 'medium',
		estimatedTime: '2分钟',
		imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
		parameters: {
			basePrompt: '温馨室内场景',
			variations: 4,
			seedRange: [1000, 2000],
			batchSize: 4
		},
		steps: [
			'设置基础提示词',
			'选择生成数量',
			'配置种子范围',
			'启动批量生成',
			'查看生成结果'
		]
	},
	{
		id: 'image-enhancement',
		title: '图片增强',
		description: '提升图片质量和细节表现',
		category: '优化工具',
		difficulty: 'easy',
		estimatedTime: '45秒',
		imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
		parameters: {
			upscaleFactor: 2,
			sharpen: true,
			noiseReduction: true,
			colorEnhancement: true
		},
		steps: [
			'上传需要增强的图片',
			'选择增强选项',
			'调整增强强度',
			'预览增强效果',
			'下载增强后的图片'
		]
	},
	{
		id: 'prompt-optimization',
		title: '提示词优化',
		description: 'AI智能优化提示词以获得更好效果',
		category: 'AI助手',
		difficulty: 'easy',
		estimatedTime: '20秒',
		imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
		parameters: {
			originalPrompt: '美丽的花',
			optimizedPrompt: '超现实主义的巨大花朵，花瓣如水晶般透明，露珠点缀，柔和光线，梦幻背景',
			improvements: ['细节丰富', '构图优化', '光影增强']
		},
		steps: [
			'输入基础提示词',
			'AI分析并优化',
			'查看优化建议',
			'应用优化结果',
			'生成最终图片'
		]
	},
	{
		id: 'template-library',
		title: '模板库',
		description: '使用预设模板快速生成专业级图片',
		category: '模板工具',
		difficulty: 'easy',
		estimatedTime: '15秒',
		imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
		parameters: {
			template: '商务人像',
			customization: {background: '现代办公室', lighting: '专业', style: '正式'},
			quickApply: true
		},
		steps: [
			'浏览模板库',
			'选择适合的模板',
			'自定义参数',
			'一键应用模板',
			'生成最终作品'
		]
	}
];

interface DemoSession {
	id: string;
	featureId: string;
	status: 'idle' | 'running' | 'completed' | 'error';
	progress: number;
	startTime: Date | null;
	result?: string;
}

export function AIDemoFeatures() {
	const [activeTab, setActiveTab] = useState('all');
	const [selectedFeature, setSelectedFeature] = useState<DemoFeature | null>(null);
	const [demoSessions, setDemoSessions] = useState<DemoSession[]>([]);

	const categories = [
		{value: 'all', label: '全部功能', count: demoFeatures.length},
		{value: '基础功能', label: '基础功能', count: 2},
		{value: '进阶功能', label: '进阶功能', count: 1},
		{value: '效率工具', label: '效率工具', count: 1},
		{value: '优化工具', label: '优化工具', count: 1},
		{value: 'AI助手', label: 'AI助手', count: 1},
		{value: '模板工具', label: '模板工具', count: 1}
	];

	const filteredFeatures = activeTab === 'all' 
		? demoFeatures 
		: demoFeatures.filter(f => f.category === activeTab);

	const handleStartDemo = (feature: DemoFeature) => {
		setSelectedFeature(feature);
		const newSession: DemoSession = {
			id: Date.now().toString(),
			featureId: feature.id,
			status: 'idle',
			progress: 0,
			startTime: null
		};
		setDemoSessions(prev => [...prev, newSession]);
	};

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
			case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
		}
	};

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case '基础功能': return <ImageIcon className="w-4 h-4" />;
			case '进阶功能': return <Layers className="w-4 h-4" />;
			case '效率工具': return <Zap className="w-4 h-4" />;
			case '优化工具': return <Palette className="w-4 h-4" />;
			case 'AI助手': return <Sparkles className="w-4 h-4" />;
			case '模板工具': return <FileText className="w-4 h-4" />;
			default: return <ImageIcon className="w-4 h-4" />;
		}
	};

	return (
		<div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 dark:from-slate-900 dark:via-purple-950/20 dark:to-blue-950/10 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
						AI功能演示中心
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						体验我们强大的AI图像生成功能，每个功能都有详细的演示和步骤说明
					</p>
				</div>

				{/* Category Tabs */}
				<Card className="mb-6 border-0 shadow-sm">
					<CardContent className="p-0">
						<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
							<TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
								{categories.map((category) => (
									<TabsTrigger
										key={category.value}
										value={category.value}
										className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
									>
										{getCategoryIcon(category.label)}
										{category.label}
										<Badge variant="secondary" className="ml-1">{category.count}</Badge>
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</CardContent>
				</Card>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredFeatures.map((feature) => {
						const session = demoSessions.find(s => s.featureId === feature.id);
						return (
							<Card key={feature.id} className="overflow-hidden hover:shadow-lg transition-shadow">
								<div className="relative">
									<img
										src={feature.imageUrl}
										alt={feature.title}
										className="w-full h-48 object-cover"
									/>
									<div className="absolute top-2 right-2 flex gap-1">
										<Badge className={getDifficultyColor(feature.difficulty)}>
											{feature.difficulty === 'easy' ? '简单' : feature.difficulty === 'medium' ? '中等' : '困难'}
										</Badge>
										<Badge variant="secondary">{feature.estimatedTime}</Badge>
									</div>
								</div>
								<CardHeader>
									<CardTitle className="text-lg">{feature.title}</CardTitle>
									<CardDescription>{feature.description}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Parameters Preview */}
									<div className="space-y-2">
										<h4 className="text-sm font-medium">关键参数</h4>
										<div className="flex flex-wrap gap-1">
											{Object.entries(feature.parameters).slice(0, 3).map(([key, value]) => (
												<Badge key={key} variant="outline" className="text-xs">
													{key}: {typeof value === 'boolean' ? (value ? '开启' : '关闭') : value}
												</Badge>
											))}
										</div>
									</div>

									{/* Demo Status */}
									{session && (
										<div className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span>进度</span>
												<span>{session.progress}%</span>
											</div>
											<Progress value={session.progress} className="h-2" />
										</div>
									)}

									{/* Action Buttons */}
									<div className="flex gap-2">
										<Button
											size="sm"
											onClick={() => handleStartDemo(feature)}
											disabled={session?.status === 'running'}
											className="flex-1"
										>
											{session ? (
												<>
													{session.status === 'idle' && <><Play className="w-4 h-4 mr-1" /> 开始演示</>}
													{session.status === 'running' && <><Pause className="w-4 h-4 mr-1" /> 运行中</>}
													{session.status === 'completed' && <><RotateCcw className="w-4 h-4 mr-1" /> 重新演示</>}
												</>
											) : (
				<><Eye className="w-4 h-4 mr-1" /> 查看演示</>
											)}
										</Button>
										<Button size="sm" variant="ghost">
											<Settings className="w-4 h-4" />
										</Button>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Selected Feature Details */}
				{selectedFeature && (
					<Card className="mt-8 border-0 shadow-lg">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-xl">{selectedFeature.title} - 详细演示</CardTitle>
									<CardDescription>{selectedFeature.description}</CardDescription>
								</div>
								<Button variant="ghost" size="sm" onClick={() => setSelectedFeature(null)}>
									<X className="w-4 h-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="grid md:grid-cols-2 gap-6">
							{/* Preview */}
							<div>
								<h3 className="text-lg font-semibold mb-3">效果预览</h3>
								<img
									src={selectedFeature.imageUrl}
									alt={selectedFeature.title}
									className="w-full rounded-lg shadow-md"
								/>
								<div className="mt-4 space-y-2">
									<h4 className="text-sm font-medium">参数设置</h4>
									<div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
										<pre className="text-xs overflow-x-auto">{JSON.stringify(selectedFeature.parameters, null, 2)}</pre>
									</div>
								</div>
							</div>

							{/* Steps */}
							<div>
								<h3 className="text-lg font-semibold mb-3">操作步骤</h3>
								<ScrollArea className="h-64">
									<ol className="space-y-3">
										{selectedFeature.steps.map((step, index) => (
											<li key={index} className="flex items-start gap-3">
												<div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-sm font-medium">
													{index + 1}
												</div>
												<span className="text-sm">{step}</span>
											</li>
										))}
									</ol>
								</ScrollArea>
								<div className="mt-4 flex gap-2">
									<Button className="flex-1">
										<Play className="w-4 h-4 mr-2" />开始演示
									</Button>
									<Button variant="outline">
										<Download className="w-4 h-4 mr-2" />下载示例
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}