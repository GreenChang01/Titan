'use client';

import {type JSX, useState} from 'react';
import {Library, Play, Download, Clock, FileAudio, Search, Filter, Grid, List, MoreVertical} from 'lucide-react';
import {Header} from '@/components/layout/header';
import {Main} from '@/components/layout/main';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
	DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';

interface AudioContent {
	id: string;
	title: string;
	description: string;
	duration: string;
	fileSize: string;
	createdAt: string;
	category: string;
	voiceType: string;
	soundscape: string;
	status: 'completed' | 'processing' | 'failed';
	audioUrl?: string;
}

// Mock data for demonstration
const mockAudioContent: AudioContent[] = [
	{
		id: '1',
		title: '睡前放松音频',
		description: '闭上眼睛，让身体完全放松下来。感受每一次呼吸带来的宁静...',
		duration: '5:32',
		fileSize: '7.2MB',
		createdAt: '2024-01-15T10:30:00Z',
		category: '睡眠引导',
		voiceType: '温柔女声',
		soundscape: '雨声',
		status: 'completed',
		audioUrl: '/audio/sample1.mp3',
	},
	{
		id: '2',
		title: '自然冥想',
		description: '想象自己置身于宁静的森林中，微风轻抚过树叶...',
		duration: '8:15',
		fileSize: '10.8MB',
		createdAt: '2024-01-14T15:45:00Z',
		category: '冥想引导',
		voiceType: '沉稳男声',
		soundscape: '森林',
		status: 'completed',
		audioUrl: '/audio/sample2.mp3',
	},
	{
		id: '3',
		title: '正念练习',
		description: '将注意力集中在当下的感受。感受空气进入肺部的温度...',
		duration: '12:08',
		fileSize: '15.6MB',
		createdAt: '2024-01-13T09:20:00Z',
		category: '正念练习',
		voiceType: '成熟女声',
		soundscape: '海洋',
		status: 'completed',
		audioUrl: '/audio/sample3.mp3',
	},
	{
		id: '4',
		title: '深度放松引导',
		description: '让我们一起进入深度放松状态，释放身心的紧张...',
		duration: '0:00',
		fileSize: '0MB',
		createdAt: '2024-01-16T14:10:00Z',
		category: '放松引导',
		voiceType: '温柔女声',
		soundscape: '壁炉',
		status: 'processing',
	},
];

export default function LibraryPage(): JSX.Element {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration'>('newest');

	// Filter and sort content
	const filteredContent = mockAudioContent
		.filter(item => {
			const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.description.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
			return matchesSearch && matchesCategory;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case 'newest':
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				case 'oldest':
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				case 'duration':
					return a.duration.localeCompare(b.duration);
				default:
					return 0;
			}
		});

	const categories = ['all', ...Array.from(new Set(mockAudioContent.map(item => item.category)))];

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800';
			case 'processing':
				return 'bg-yellow-100 text-yellow-800';
			case 'failed':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'completed':
				return '已完成';
			case 'processing':
				return '生成中';
			case 'failed':
				return '失败';
			default:
				return '未知';
		}
	};

	const AudioCard = ({content}: {content: AudioContent}) => (
		<Card className="group hover:shadow-md transition-shadow">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<CardTitle className="text-lg mb-1">{content.title}</CardTitle>
						<CardDescription className="line-clamp-2 text-sm">
							{content.description}
						</CardDescription>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
								<MoreVertical className="h-4 w-4"/>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>
								<Play className="h-4 w-4 mr-2"/>
								播放
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Download className="h-4 w-4 mr-2"/>
								下载
							</DropdownMenuItem>
							<DropdownMenuItem className="text-destructive">
								删除
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-2">
					<Badge variant="secondary">{content.category}</Badge>
					<Badge variant="outline">{content.voiceType}</Badge>
					<Badge variant="outline">{content.soundscape}</Badge>
				</div>

				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					<span className="flex items-center gap-1">
						<Clock className="h-3 w-3"/>
						{content.duration}
					</span>
					<span className="flex items-center gap-1">
						<FileAudio className="h-3 w-3"/>
						{content.fileSize}
					</span>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
							{getStatusText(content.status)}
						</span>
						<span className="text-xs text-muted-foreground">
							{formatDate(content.createdAt)}
						</span>
					</div>
					{content.status === 'completed' && (
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								<Play className="h-4 w-4 mr-1"/>
								播放
							</Button>
							<Button variant="outline" size="sm">
								<Download className="h-4 w-4 mr-1"/>
								下载
							</Button>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);

	const AudioListItem = ({content}: {content: AudioContent}) => (
		<Card className="group hover:shadow-sm transition-shadow">
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-3">
							<div className="flex-1">
								<h3 className="font-medium truncate">{content.title}</h3>
								<p className="text-sm text-muted-foreground truncate">{content.description}</p>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="secondary">{content.category}</Badge>
								<Badge variant="outline">{content.voiceType}</Badge>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-4 ml-4">
						<div className="text-sm text-muted-foreground">
							{content.duration} • {content.fileSize}
						</div>
						<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
							{getStatusText(content.status)}
						</span>
						<div className="text-xs text-muted-foreground">
							{formatDate(content.createdAt)}
						</div>
						{content.status === 'completed' && (
							<div className="flex items-center gap-2">
								<Button variant="outline" size="sm">
									<Play className="h-4 w-4"/>
								</Button>
								<Button variant="outline" size="sm">
									<Download className="h-4 w-4"/>
								</Button>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<>
			<Header>
				<div className="flex items-center justify-between w-full">
					<div>
						<h1 className='text-lg font-medium flex items-center gap-2'>
							<Library className='h-5 w-5 text-primary'/>
							内容库
						</h1>
						<p className='text-sm text-muted-foreground'>
							管理您生成的ASMR音频内容
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-muted' : ''}>
							<Grid className="h-4 w-4"/>
						</Button>
						<Button variant="outline" size="sm" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-muted' : ''}>
							<List className="h-4 w-4"/>
						</Button>
					</div>
				</div>
			</Header>

			<Main>
				<div className='max-w-7xl mx-auto space-y-6'>
					{/* 筛选和搜索 */}
					<Card>
						<CardContent className="pt-6">
							<div className="flex flex-col md:flex-row gap-4">
								<div className="flex-1">
									<div className="relative">
										<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
										<Input
											placeholder="搜索音频内容..."
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
									<Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
										<SelectTrigger className="w-32">
											<SelectValue/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="newest">最新</SelectItem>
											<SelectItem value="oldest">最旧</SelectItem>
											<SelectItem value="duration">时长</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* 内容统计 */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-primary">{mockAudioContent.length}</div>
									<div className="text-sm text-muted-foreground">总内容数</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-green-600">
										{mockAudioContent.filter(c => c.status === 'completed').length}
									</div>
									<div className="text-sm text-muted-foreground">已完成</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-yellow-600">
										{mockAudioContent.filter(c => c.status === 'processing').length}
									</div>
									<div className="text-sm text-muted-foreground">生成中</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-600">
										{mockAudioContent.reduce((acc, c) => acc + (c.status === 'completed' ? parseFloat(c.duration.split(':')[0]) : 0), 0).toFixed(0)}
									</div>
									<div className="text-sm text-muted-foreground">总时长(分钟)</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* 内容列表 */}
					<div className="space-y-4">
						{filteredContent.length === 0 ? (
							<Card>
								<CardContent className="pt-6 text-center py-12">
									<FileAudio className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
									<h3 className="text-lg font-medium">暂无内容</h3>
									<p className="text-muted-foreground mb-4">您还没有生成任何音频内容</p>
									<Button>
										<Sparkles className="h-4 w-4 mr-2"/>
										开始创作
									</Button>
								</CardContent>
							</Card>
						) : (
							<>
								{viewMode === 'grid' ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{filteredContent.map(content => (
											<AudioCard key={content.id} content={content}/>
										))}
									</div>
								) : (
									<div className="space-y-3">
										{filteredContent.map(content => (
											<AudioListItem key={content.id} content={content}/>
										))}
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</Main>
		</>
	);
}