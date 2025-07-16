'use client';

import {type JSX, useState} from 'react';
import {FileText, Plus, Edit2, Trash2, Search, Filter, Tags, Star, Copy, Clock} from 'lucide-react';
import {Header} from '@/components/layout/header';
import {Main} from '@/components/layout/main';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
	Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
	DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';

interface Prompt {
	id: string;
	title: string;
	content: string;
	description: string;
	category: string;
	tags: string[];
	isFavorite: boolean;
	usageCount: number;
	createdAt: string;
	updatedAt: string;
}

// Mock data for demonstration
const mockPrompts: Prompt[] = [
	{
		id: '1',
		title: '睡前放松引导',
		content: '请帮我生成一段温柔的睡前引导词，包含深呼吸练习和身体放松技巧。语言要温暖亲切，节奏缓慢，适合中老年人群。',
		description: '专为睡前放松设计的引导词模板',
		category: '睡眠引导',
		tags: ['睡眠', '放松', '呼吸'],
		isFavorite: true,
		usageCount: 12,
		createdAt: '2024-01-15T10:30:00Z',
		updatedAt: '2024-01-15T10:30:00Z',
	},
	{
		id: '2',
		title: '自然冥想场景',
		content: '创建一个自然环境的冥想场景，包含森林、溪流、鸟鸣等元素。用第二人称描述，帮助听众想象身临其境。',
		description: '自然场景的冥想引导模板',
		category: '冥想引导',
		tags: ['冥想', '自然', '想象'],
		isFavorite: false,
		usageCount: 8,
		createdAt: '2024-01-14T15:45:00Z',
		updatedAt: '2024-01-14T15:45:00Z',
	},
	{
		id: '3',
		title: '正念练习指导',
		content: '设计一段正念练习的指导语，引导听众关注当下感受，包含身体扫描和注意力集中练习。',
		description: '正念练习的基础指导模板',
		category: '正念练习',
		tags: ['正念', '专注', '当下'],
		isFavorite: true,
		usageCount: 15,
		createdAt: '2024-01-13T09:20:00Z',
		updatedAt: '2024-01-13T09:20:00Z',
	},
	{
		id: '4',
		title: '渐进式肌肉放松',
		content: '创建渐进式肌肉放松的指导内容，从脚部开始逐步向上，每个部位包含紧张和放松的指导。',
		description: '系统的肌肉放松练习模板',
		category: '身体放松',
		tags: ['肌肉', '放松', '渐进'],
		isFavorite: false,
		usageCount: 6,
		createdAt: '2024-01-12T14:15:00Z',
		updatedAt: '2024-01-12T14:15:00Z',
	},
];

export default function PromptsPage(): JSX.Element {
	const [prompts, setPrompts] = useState<Prompt[]>(mockPrompts);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [filterFavorites, setFilterFavorites] = useState(false);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

	// Form state
	const [formData, setFormData] = useState({
		title: '',
		content: '',
		description: '',
		category: '',
		tags: '',
	});

	// Filter and sort prompts
	const filteredPrompts = prompts
		.filter(prompt => {
			const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
				prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
			const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
			const matchesFavorites = !filterFavorites || prompt.isFavorite;
			return matchesSearch && matchesCategory && matchesFavorites;
		})
		.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

	const categories = ['all', ...Array.from(new Set(prompts.map(p => p.category)))];

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const handleCreatePrompt = () => {
		if (!formData.title || !formData.content) return;

		const newPrompt: Prompt = {
			id: Date.now().toString(),
			title: formData.title,
			content: formData.content,
			description: formData.description,
			category: formData.category,
			tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
			isFavorite: false,
			usageCount: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		setPrompts([newPrompt, ...prompts]);
		setFormData({title: '', content: '', description: '', category: '', tags: ''});
		setIsCreateDialogOpen(false);
	};

	const handleUpdatePrompt = () => {
		if (!editingPrompt || !formData.title || !formData.content) return;

		const updatedPrompt: Prompt = {
			...editingPrompt,
			title: formData.title,
			content: formData.content,
			description: formData.description,
			category: formData.category,
			tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
			updatedAt: new Date().toISOString(),
		};

		setPrompts(prompts.map(p => p.id === editingPrompt.id ? updatedPrompt : p));
		setEditingPrompt(null);
		setFormData({title: '', content: '', description: '', category: '', tags: ''});
	};

	const handleDeletePrompt = (id: string) => {
		setPrompts(prompts.filter(p => p.id !== id));
	};

	const handleToggleFavorite = (id: string) => {
		setPrompts(prompts.map(p => 
			p.id === id ? {...p, isFavorite: !p.isFavorite} : p
		));
	};

	const handleCopyPrompt = (content: string) => {
		navigator.clipboard.writeText(content);
		// You could add a toast notification here
	};

	const handleEditPrompt = (prompt: Prompt) => {
		setEditingPrompt(prompt);
		setFormData({
			title: prompt.title,
			content: prompt.content,
			description: prompt.description,
			category: prompt.category,
			tags: prompt.tags.join(', '),
		});
	};

	const resetForm = () => {
		setFormData({title: '', content: '', description: '', category: '', tags: ''});
		setEditingPrompt(null);
	};

	const PromptCard = ({prompt}: {prompt: Prompt}) => (
		<Card className="group hover:shadow-md transition-shadow">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2">
							<CardTitle className="text-lg">{prompt.title}</CardTitle>
							{prompt.isFavorite && (
								<Star className="h-4 w-4 text-yellow-500 fill-current"/>
							)}
						</div>
						<CardDescription className="line-clamp-2">
							{prompt.description}
						</CardDescription>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
								<Edit2 className="h-4 w-4"/>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => handleEditPrompt(prompt)}>
								<Edit2 className="h-4 w-4 mr-2"/>
								编辑
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleCopyPrompt(prompt.content)}>
								<Copy className="h-4 w-4 mr-2"/>
								复制内容
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleToggleFavorite(prompt.id)}>
								<Star className="h-4 w-4 mr-2"/>
								{prompt.isFavorite ? '取消收藏' : '添加收藏'}
							</DropdownMenuItem>
							<DropdownMenuItem 
								onClick={() => handleDeletePrompt(prompt.id)}
								className="text-destructive"
							>
								<Trash2 className="h-4 w-4 mr-2"/>
								删除
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="bg-muted/30 p-3 rounded-lg">
						<p className="text-sm line-clamp-3">{prompt.content}</p>
					</div>
					
					<div className="flex items-center gap-2 flex-wrap">
						<Badge variant="secondary">{prompt.category}</Badge>
						{prompt.tags.map(tag => (
							<Badge key={tag} variant="outline" className="text-xs">
								{tag}
							</Badge>
						))}
					</div>

					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<div className="flex items-center gap-4">
							<span className="flex items-center gap-1">
								<Clock className="h-3 w-3"/>
								{formatDate(prompt.updatedAt)}
							</span>
							<span>使用 {prompt.usageCount} 次</span>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleCopyPrompt(prompt.content)}
						>
							<Copy className="h-4 w-4 mr-1"/>
							使用
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	const PromptFormDialog = ({
		open, 
		onOpenChange, 
		title, 
		onSubmit
	}: {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		title: string;
		onSubmit: () => void;
	}) => (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						{editingPrompt ? '编辑提示词内容' : '创建新的提示词模板'}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="title">标题</Label>
							<Input
								id="title"
								value={formData.title}
								onChange={(e) => setFormData({...formData, title: e.target.value})}
								placeholder="提示词标题"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="category">分类</Label>
							<Input
								id="category"
								value={formData.category}
								onChange={(e) => setFormData({...formData, category: e.target.value})}
								placeholder="如：睡眠引导、冥想练习"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">描述</Label>
						<Input
							id="description"
							value={formData.description}
							onChange={(e) => setFormData({...formData, description: e.target.value})}
							placeholder="简短描述这个提示词的用途"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="content">提示词内容</Label>
						<Textarea
							id="content"
							value={formData.content}
							onChange={(e) => setFormData({...formData, content: e.target.value})}
							placeholder="输入提示词的具体内容..."
							className="min-h-[200px]"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="tags">标签</Label>
						<Input
							id="tags"
							value={formData.tags}
							onChange={(e) => setFormData({...formData, tags: e.target.value})}
							placeholder="用逗号分隔多个标签，如：睡眠, 放松, 呼吸"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => {
						onOpenChange(false);
						resetForm();
					}}>
						取消
					</Button>
					<Button 
						onClick={onSubmit}
						disabled={!formData.title || !formData.content}
					>
						{editingPrompt ? '保存' : '创建'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);

	return (
		<>
			<Header>
				<div className="flex items-center justify-between w-full">
					<div>
						<h1 className='text-lg font-medium flex items-center gap-2'>
							<FileText className='h-5 w-5 text-primary'/>
							提示词库
						</h1>
						<p className='text-sm text-muted-foreground'>
							管理您的ASMR生成提示词模板
						</p>
					</div>
					<Button onClick={() => setIsCreateDialogOpen(true)}>
						<Plus className="h-4 w-4 mr-2"/>
						新建提示词
					</Button>
				</div>
			</Header>

			<Main>
				<div className='max-w-7xl mx-auto space-y-6'>
					{/* Search and Filters */}
					<Card>
						<CardContent className="pt-6">
							<div className="flex flex-col md:flex-row gap-4">
								<div className="flex-1">
									<div className="relative">
										<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
										<Input
											placeholder="搜索提示词..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-10"
										/>
									</div>
								</div>
								<div className="flex gap-2">
									<Select value={selectedCategory} onValueChange={setSelectedCategory}>
										<SelectTrigger className="w-40">
											<SelectValue placeholder="分类"/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">全部分类</SelectItem>
											{categories.filter(cat => cat !== 'all').map(category => (
												<SelectItem key={category} value={category}>{category}</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										variant={filterFavorites ? "default" : "outline"}
										onClick={() => setFilterFavorites(!filterFavorites)}
									>
										<Star className="h-4 w-4 mr-1"/>
										收藏
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Statistics */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-primary">{prompts.length}</div>
									<div className="text-sm text-muted-foreground">总提示词</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-green-600">
										{prompts.filter(p => p.isFavorite).length}
									</div>
									<div className="text-sm text-muted-foreground">收藏</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-600">
										{categories.length - 1}
									</div>
									<div className="text-sm text-muted-foreground">分类</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-purple-600">
										{prompts.reduce((acc, p) => acc + p.usageCount, 0)}
									</div>
									<div className="text-sm text-muted-foreground">总使用次数</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Prompts List */}
					<div className="space-y-4">
						{filteredPrompts.length === 0 ? (
							<Card>
								<CardContent className="pt-6 text-center py-12">
									<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
									<h3 className="text-lg font-medium">
										{searchTerm || selectedCategory !== 'all' || filterFavorites ? 
											'没有找到匹配的提示词' : 
											'还没有提示词'
										}
									</h3>
									<p className="text-muted-foreground mb-4">
										{searchTerm || selectedCategory !== 'all' || filterFavorites ? 
											'尝试调整搜索条件或筛选器' : 
											'创建您的第一个提示词模板'
										}
									</p>
									{!searchTerm && selectedCategory === 'all' && !filterFavorites && (
										<Button onClick={() => setIsCreateDialogOpen(true)}>
											<Plus className="h-4 w-4 mr-2"/>
											新建提示词
										</Button>
									)}
								</CardContent>
							</Card>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredPrompts.map(prompt => (
									<PromptCard key={prompt.id} prompt={prompt}/>
								))}
							</div>
						)}
					</div>

					{/* Create/Edit Dialog */}
					<PromptFormDialog
						open={isCreateDialogOpen}
						onOpenChange={setIsCreateDialogOpen}
						title="新建提示词"
						onSubmit={handleCreatePrompt}
					/>
					
					<PromptFormDialog
						open={!!editingPrompt}
						onOpenChange={(open) => {
							if (!open) {
								setEditingPrompt(null);
								resetForm();
							}
						}}
						title="编辑提示词"
						onSubmit={handleUpdatePrompt}
					/>
				</div>
			</Main>
		</>
	);
}