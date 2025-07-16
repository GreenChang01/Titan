'use client';

import React, {useState, useMemo} from 'react';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
	Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
	Search, Filter, Grid3X3, List, Download, Share2, Trash2, Star, Eye, EyeOff, Folder, Plus, Edit3, Tag, Calendar, Image as ImageIcon, Move, Copy, Check, X
} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {ScrollArea} from '@/components/ui/scroll-area';
import {cn} from '@/lib/utils';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

interface AIImageAsset {
	id: string;
	url: string;
	prompt: string;
	thumbnail: string;
	createdAt: Date;
	collection: string;
	tags: string[];
	metadata: {
		width: number;
		height: number;
		size: string;
		format: string;
		model: string;
		seed: number;
	};
	isFavorite: boolean;
	isPrivate: boolean;
	views: number;
	downloads: number;
}

interface Collection {
	id: string;
	name: string;
	count: number;
	color: string;
	icon: React.ReactNode;
	isDefault?: boolean;
}

interface FilterState {
	collection: string;
	tags: string[];
	dateRange: string;
	isPrivate: boolean;
	sortBy: string;
}

const mockAssets: AIImageAsset[] = [
	{
		id: '1',
		url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
		prompt: 'peaceful forest stream with soft sunlight filtering through green leaves, crystal clear water',
		thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
		createdAt: new Date('2024-01-15'),
		collection: 'nature',
		tags: ['nature', 'forest', 'stream', 'peaceful'],
		metadata: {width: 1024, height: 1024, size: '2.1MB', format: 'JPG', model: 'pollinations', seed: 12345},
		isFavorite: true,
		isPrivate: false,
		views: 156,
		downloads: 23
	},
	{
		id: '2',
		url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop',
		prompt: 'warm fireplace with soft candlelight in a cozy living room, comfortable armchair',
		thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop',
		createdAt: new Date('2024-01-14'),
		collection: 'cozy',
		tags: ['cozy', 'fireplace', 'warm', 'comfortable'],
		metadata: {width: 1024, height: 1024, size: '1.8MB', format: 'JPG', model: 'pollinations', seed: 67890},
		isFavorite: false,
		isPrivate: false,
		views: 89,
		downloads: 12
	},
	{
		id: '3',
		url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=800&fit=crop',
		prompt: 'minimalist zen garden with carefully arranged stones and sand, morning light',
		thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop',
		createdAt: new Date('2024-01-13'),
		collection: 'zen',
		tags: ['zen', 'minimalist', 'garden', 'peaceful'],
		metadata: {width: 1024, height: 1024, size: '2.3MB', format: 'JPG', model: 'pollinations', seed: 11111},
		isFavorite: true,
		isPrivate: true,
		views: 234,
		downloads: 45
	},
	{
		id: '4',
		url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
		prompt: 'soft flowing waves in calming blue and lavender tones, ethereal dreamscape',
		thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
		createdAt: new Date('2024-01-12'),
		collection: 'abstract',
		tags: ['abstract', 'blue', 'lavender', 'ethereal'],
		metadata: {width: 1024, height: 1024, size: '1.9MB', format: 'JPG', model: 'pollinations', seed: 22222},
		isFavorite: false,
		isPrivate: false,
		views: 67,
		downloads: 8
	}
];

const collections: Collection[] = [
	{id: 'all', name: '全部素材', count: 4, color: 'bg-gray-500', icon: <Grid3X3 className="w-4 h-4" />},
	{id: 'nature', name: '自然风光', count: 1, color: 'bg-green-500', icon: <ImageIcon className="w-4 h-4" />},
	{id: 'cozy', name: '温馨场景', count: 1, color: 'bg-orange-500', icon: <Folder className="w-4 h-4" />},
	{id: 'zen', name: '禅意空间', count: 1, color: 'bg-blue-500', icon: <Folder className="w-4 h-4" />},
	{id: 'abstract', name: '抽象艺术', count: 1, color: 'bg-purple-500', icon: <Folder className="w-4 h-4" />},
	{id: 'favorites', name: '收藏夹', count: 2, color: 'bg-pink-500', icon: <Star className="w-4 h-4" />},
	{id: 'private', name: '私密素材', count: 1, color: 'bg-red-500', icon: <EyeOff className="w-4 h-4" />}
];

export function MaterialManagementCenter() {
	const [assets] = useState<AIImageAsset[]>(mockAssets);
	const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [searchQuery, setSearchQuery] = useState('');
	const [activeCollection, setActiveCollection] = useState('history');
	const [filters, setFilters] = useState<FilterState>({
		collection: 'all',
		tags: [],
		dateRange: 'all',
		isPrivate: false,
		sortBy: 'newest'
	});
	const [showFilters, setShowFilters] = useState(false);

	const filteredAssets = useMemo(() => {
		return assets.filter(asset => {
			const matchesSearch = asset.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
				asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
			
			const matchesCollection = activeCollection === 'all' || asset.collection === activeCollection ||
				(activeCollection === 'favorites' && asset.isFavorite) ||
				(activeCollection === 'private' && asset.isPrivate) ||
				(activeCollection === 'history') ||
				(activeCollection === 'uploads');
			
			const matchesPrivate = !filters.isPrivate || asset.isPrivate;
			
			return matchesSearch && matchesCollection && matchesPrivate;
		}).sort((a, b) => {
			switch (filters.sortBy) {
				case 'newest': return b.createdAt.getTime() - a.createdAt.getTime();
				case 'oldest': return a.createdAt.getTime() - b.createdAt.getTime();
				case 'most-viewed': return b.views - a.views;
				case 'most-downloaded': return b.downloads - a.downloads;
				default: return 0;
			}
		});
	}, [assets, searchQuery, activeCollection, filters]);

	const handleSelectAsset = (assetId: string) => {
		setSelectedAssets(prev => 
			prev.includes(assetId) 
				? prev.filter(id => id !== assetId)
				: [...prev, assetId]
		);
	};

	const handleSelectAll = () => {
		if (selectedAssets.length === filteredAssets.length) {
			setSelectedAssets([]);
		} else {
			setSelectedAssets(filteredAssets.map(asset => asset.id));
		}
	};

	const handleBulkAction = (action: string) => {
		switch (action) {
			case 'download':
				console.log('Downloading selected:', selectedAssets);
				break;
			case 'delete':
				// Handle bulk delete
				break;
			case 'move':
				// Handle bulk move
				break;
		}
	};

	const toggleFavorite = (assetId: string) => {
		// Handle favorite toggle
	};

	const togglePrivate = (assetId: string) => {
		// Handle private toggle
	};

	return (
		<div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 dark:from-slate-900 dark:via-purple-950/20 dark:to-blue-950/10">
			<div className="flex h-full">
				{/* Sidebar */}
				<div className="w-64 border-r bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
					<div className="p-4 space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold">素材中心</h2>
							<Button size="sm" variant="ghost">
								<Plus className="w-4 h-4" />
							</Button>
						</div>
						
						<div className="space-y-1">
							{/* AI 图片生成 */}
							<div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">
								AI 图片生成
							</div>
							
							{/* 历史记录 */}
							<button
								onClick={() => setActiveCollection('history')}
								className={cn(
									"w-full text-left p-3 rounded-lg flex items-center justify-between transition-all",
									activeCollection === 'history'
										? "bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700"
										: "hover:bg-gray-100 dark:hover:bg-gray-800"
								)}
							>
								<div className="flex items-center gap-3">
									<div className="w-2 h-2 rounded-full bg-blue-500" />
									<span className="text-sm font-medium">历史记录</span>
								</div>
								<span className="text-xs text-gray-500">24</span>
							</button>

							{/* 收藏夹 */}
							<div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2 mt-4">
								收藏夹
							</div>
							
							{collections.map((collection) => (
								<button
									key={collection.id}
									onClick={() => setActiveCollection(collection.id)}
									className={cn(
										"w-full text-left p-3 rounded-lg flex items-center justify-between transition-all",
										activeCollection === collection.id
											? "bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700"
											: "hover:bg-gray-100 dark:hover:bg-gray-800"
									)}
								>
									<div className="flex items-center gap-3">
										<div className={cn("w-2 h-2 rounded-full", collection.color)} />
										<span className="text-sm font-medium">{collection.name}</span>
									</div>
									<span className="text-xs text-gray-500">{collection.count}</span>
								</button>
							))}

							{/* 其他上传 */}
							<div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2 mt-4">
								其他上传
							</div>
							
							<button
								onClick={() => setActiveCollection('uploads')}
								className={cn(
									"w-full text-left p-3 rounded-lg flex items-center justify-between transition-all",
									activeCollection === 'uploads'
										? "bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700"
										: "hover:bg-gray-100 dark:hover:bg-gray-800"
								)}
							>
								<div className="flex items-center gap-3">
									<div className="w-2 h-2 rounded-full bg-emerald-500" />
									<span className="text-sm font-medium">本地上传</span>
								</div>
								<span className="text-xs text-gray-500">8</span>
							</button>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex-1 overflow-hidden">
					{/* Header */}
					<div className="border-b bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4 flex-1">
								<div className="relative flex-1 max-w-md">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
									<Input
										placeholder="搜索素材..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-9 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
									/>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowFilters(!showFilters)}
									className={cn(showFilters && "bg-purple-100 dark:bg-purple-900/50")}
								>
									<Filter className="w-4 h-4 mr-1" />
									筛选
								</Button>
							</div>
							
							<div className="flex items-center gap-2">
								{selectedAssets.length > 0 && (
									<div className="flex items-center gap-2">
										<span className="text-sm text-gray-600 dark:text-gray-400">
											已选择 {selectedAssets.length} 项
										</span>
										<Button size="sm" variant="ghost" onClick={() => handleBulkAction('download')}>
											<Download className="w-4 h-4" />
										</Button>
										<Button size="sm" variant="ghost" onClick={() => handleBulkAction('delete')}>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								)}
								
								<Button size="sm" variant="ghost" onClick={handleSelectAll}>
									{selectedAssets.length === filteredAssets.length ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
								</Button>
								
								<Button size="sm" variant="ghost" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
									{viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
								</Button>
							</div>
						</div>

						{/* Filters */}
						{showFilters && (
							<div className="border-t p-4 bg-gray-50/50 dark:bg-gray-800/50">
								<div className="grid grid-cols-4 gap-4">
									<div>
										<Label className="text-sm mb-2">排序方式</Label>
										<Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({...prev, sortBy: value}))}>
											<SelectItem value="newest">最新</SelectItem>
											<SelectItem value="oldest">最早</SelectItem>
											<SelectItem value="most-viewed">最多查看</SelectItem>
											<SelectItem value="most-downloaded">最多下载</SelectItem>
										</Select>
									</div>
									<div>
										<Label className="text-sm mb-2">时间范围</Label>
										<Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({...prev, dateRange: value}))}>
											<SelectItem value="all">全部</SelectItem>
											<SelectItem value="today">今天</SelectItem>
											<SelectItem value="week">本周</SelectItem>
											<SelectItem value="month">本月</SelectItem>
										</Select>
									</div>
									<div>
										<Label className="text-sm mb-2">隐私筛选</Label>
										<Select value={filters.isPrivate ? 'private' : 'all'} onValueChange={(value) => setFilters(prev => ({...prev, isPrivate: value === 'private'}))}>
											<SelectItem value="all">全部可见</SelectItem>
											<SelectItem value="private">仅私密</SelectItem>
										</Select>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Asset Grid */}
					<ScrollArea className="flex-1 p-4">
						<div className={cn(
							viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-2'
						)}>
							{filteredAssets.map((asset) => (
								<Card
									key={asset.id}
									className={cn(
										"overflow-hidden transition-all",
										viewMode === 'grid' ? "" : "flex items-center",
										selectedAssets.includes(asset.id) && "ring-2 ring-purple-500"
									)}
									onClick={() => viewMode === 'grid' && handleSelectAsset(asset.id)}
								>
									{viewMode === 'grid' ? (
										<>
											<div className="relative group">
												<img
													src={asset.thumbnail}
													alt={asset.prompt}
													className="w-full h-48 object-cover"
												/>
												<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
												<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
													<Button size="sm" variant="ghost" className="bg-white/80 dark:bg-gray-800/80">
														<Star className={cn("w-4 h-4", asset.isFavorite && "fill-yellow-500 text-yellow-500")} />
													</Button>
												</div>
											</div>
											<CardContent className="p-3 space-y-2">
												<p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{asset.prompt}</p>
												<div className="flex items-center justify-between text-xs text-gray-500">
													<span>{asset.metadata.width}×{asset.metadata.height}</span>
													<span>{asset.downloads}下载</span>
												</div>
												<div className="flex gap-1 flex-wrap">
													{asset.tags.slice(0, 3).map(tag => (
														<Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
													))}
												</div>
											</CardContent>
										</>
									) : (
										<div className="flex items-center p-4 space-x-4">
											<img
												src={asset.thumbnail}
												alt={asset.prompt}
												className="w-16 h-16 object-cover rounded"
											/>
											<div className="flex-1">
												<p className="text-sm font-medium line-clamp-1">{asset.prompt}</p>
												<div className="flex items-center gap-4 text-xs text-gray-500">
													<span>{asset.metadata.width}×{asset.metadata.height}</span>
													<span>{asset.metadata.size}</span>
													<span>{asset.createdAt.toLocaleDateString()}</span>
												</div>
												<div className="flex gap-1 mt-1">
													{asset.tags.slice(0, 3).map(tag => (
															<Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
														))}
												</div>
											</div>
											<div className="flex items-center gap-1">
												<Button size="sm" variant="ghost">
													<Download className="w-4 h-4" />
												</Button>
												<Button size="sm" variant="ghost">
													<Share2 className="w-4 h-4" />
												</Button>
												<Button size="sm" variant="ghost">
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</div>
									)}
								</Card>
							))}
						</div>
					</ScrollArea>
				</div>
			</div>
		</div>
	);
}