'use client';

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Search,
	Grid3X3,
	List,
	Download,
	Eye,
	Trash2,
	RefreshCw,
	BarChart3,
} from 'lucide-react';
import {
	useAIImages, useDeleteAIImage, useGenerateAIImage, type AIImage,
} from '@/hooks/use-ai-images';

type AIImageManagerProps = {
	readonly onSelect?: (image: AIImage) => void;
	readonly selectionMode?: boolean;
};

type AIImageStats = {
	totalCount: number;
	todayCount: number;
	weekCount: number;
	monthCount: number;
	topTags: Array<{tag: string; count: number}>;
};

export const AIImageManager: React.FC<AIImageManagerProps> = ({
	onSelect,
	selectionMode = false,
}) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [selectedImage, setSelectedImage] = useState<AIImage | undefined>(undefined);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [stats] = useState<AIImageStats | undefined>(undefined);

	// React Query hooks
	const {data: images = [], isLoading, refetch} = useAIImages();
	const deleteMutation = useDeleteAIImage();
	const regenerateMutation = useGenerateAIImage();

	// Filter images based on search term
	const filteredImages = images.filter(image =>
		image.prompt.toLowerCase().includes(searchTerm.toLowerCase()));

	const handleSearch = (term: string) => {
		setSearchTerm(term);
	};

	const handleImageClick = (image: AIImage) => {
		if (selectionMode && onSelect) {
			onSelect(image);
		} else {
			setSelectedImage(image);
			setIsPreviewOpen(true);
		}
	};

	const handleDownload = (image: AIImage) => {
		const link = document.createElement('a');
		link.href = image.imageUrl;
		link.download = `ai-image-${image.id}.jpg`;
		document.body.append(link);
		link.click();
		link.remove();
	};

	const handleRegenerate = async (image: AIImage) => {
		try {
			await regenerateMutation.mutateAsync({
				prompt: image.prompt,
				model: image.model,
				width: image.width,
				height: image.height,
				enhance: image.enhance,
				nologo: image.nologo,
				private: image.private,
				nofeed: image.nofeed,
			});

			refetch(); // Refresh the images list
		} catch (error) {
			console.error('重新生成失败:', error);
		}
	};

	const handleDelete = async (image: AIImage) => {
		if (!confirm('确定要删除这张图片吗？')) {
			return;
		}

		try {
			await deleteMutation.mutateAsync(image.id);
			setIsPreviewOpen(false);
		} catch (error) {
			console.error('删除失败:', error);
		}
	};

	const formatDate = (dateString: string) => new Date(dateString).toLocaleString('zh-CN');

	return (
		<div className='space-y-6'>
			{/* 统计信息 */}
			{stats ? <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-muted-foreground'>总数量</p>
								<p className='text-2xl font-bold'>{filteredImages.length}</p>
							</div>
							<BarChart3 className='w-8 h-8 text-muted-foreground'/>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-muted-foreground'>已加载</p>
								<p className='text-2xl font-bold'>{images.length}</p>
							</div>
							<div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center'>
								<span className='text-green-600 text-sm font-bold'>载</span>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-muted-foreground'>筛选结果</p>
								<p className='text-2xl font-bold'>{filteredImages.length}</p>
							</div>
							<div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center'>
								<span className='text-blue-600 text-sm font-bold'>筛</span>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-muted-foreground'>状态</p>
								<p className='text-2xl font-bold'>{isLoading ? '加载中' : '就绪'}</p>
							</div>
							<div className='w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center'>
								<span className='text-purple-600 text-sm font-bold'>态</span>
							</div>
						</div>
					</CardContent>
				</Card>
            </div> : null}

			{/* 搜索和工具栏 */}
			<Card>
				<CardHeader>
					<CardTitle>AI生成图片管理</CardTitle>
					<CardDescription>
						管理和浏览AI生成的图片素材
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='flex items-center justify-between space-x-4'>
						<div className='flex items-center space-x-2 flex-1'>
							<div className='relative flex-1 max-w-md'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground'/>
								<Input
									placeholder='搜索提示词...'
									value={searchTerm}
									className='pl-10'
									onChange={e => {
										handleSearch(e.target.value);
									}}
								/>
							</div>
						</div>

						<div className='flex items-center space-x-2'>
							<Button
								variant='outline'
								size='sm'
								onClick={() => {
									setViewMode(viewMode === 'grid' ? 'list' : 'grid');
								}}
							>
								{viewMode === 'grid' ? (
									<List className='w-4 h-4'/>
								) : (
									<Grid3X3 className='w-4 h-4'/>
								)}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 图片列表 */}
			<Card>
				<CardContent className='p-6'>
					{isLoading ? (
						<div className='flex items-center justify-center py-12'>
							<div className='text-center'>
								<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2'/>
								<p className='text-sm text-muted-foreground'>加载中...</p>
							</div>
						</div>
					) : filteredImages.length === 0 ? (
						<div className='text-center py-12'>
							<p className='text-muted-foreground'>
								{searchTerm ? '没有找到匹配的图片' : '暂无AI生成的图片'}
							</p>
						</div>
					) : (
						<>
							{viewMode === 'grid' ? (
								<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
									{filteredImages.map(image => (
										<div
											key={image.id}
											className={`group cursor-pointer transition-all hover:scale-105 ${
												selectionMode ? 'hover:ring-2 hover:ring-primary' : ''
											}`}
											onClick={() => {
												handleImageClick(image);
											}}
										>
											<div className='relative aspect-square rounded-lg overflow-hidden bg-muted'>
												<img
													src={image.imageUrl}
													alt={image.prompt}
													className='w-full h-full object-cover'
												/>
												<div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100'>
													<Button size='sm' variant='secondary'>
														<Eye className='w-4 h-4 mr-1'/>
														预览
													</Button>
												</div>
											</div>
											<div className='mt-2 space-y-1'>
												<p className='text-sm font-medium truncate'>
													AI图片 #{image.id.slice(-6)}
												</p>
												<p className='text-xs text-muted-foreground truncate'>
													{image.prompt}
												</p>
												<div className='flex flex-wrap gap-1'>
													<Badge variant='secondary' className='text-xs'>
														{image.model}
													</Badge>
													<Badge variant='outline' className='text-xs'>
														{image.width}x{image.height}
													</Badge>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className='space-y-2'>
									{filteredImages.map(image => (
										<div
											key={image.id}
											className={`flex items-center space-x-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 ${
												selectionMode ? 'hover:border-primary' : ''
											}`}
											onClick={() => {
												handleImageClick(image);
											}}
										>
											<img
												src={image.imageUrl}
												alt={image.prompt}
												className='w-16 h-16 rounded object-cover'
											/>
											<div className='flex-1 min-w-0'>
												<h4 className='font-medium truncate'>AI图片 #{image.id.slice(-6)}</h4>
												<p className='text-sm text-muted-foreground truncate'>
													{image.prompt}
												</p>
												<div className='flex items-center gap-2 mt-1'>
													<span className='text-xs text-muted-foreground'>
														{formatDate(image.createdAt)}
													</span>
													<Badge variant='outline' className='text-xs'>
														{image.model}
													</Badge>
												</div>
											</div>
											<div className='flex flex-wrap gap-1'>
												<Badge variant='secondary' className='text-xs'>
													{image.width}x{image.height}
												</Badge>
												{image.enhance ? <Badge variant='outline' className='text-xs'>
													增强
												</Badge> : null}
											</div>
										</div>
									))}
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* 图片预览对话框 */}
			<Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
				<DialogContent className='max-w-4xl'>
					{selectedImage ? <>
						<DialogHeader>
							<DialogTitle>AI图片 #{selectedImage.id.slice(-6)}</DialogTitle>
							<DialogDescription>
								生成时间: {formatDate(selectedImage.createdAt)}
							</DialogDescription>
						</DialogHeader>

						<div className='space-y-4'>
							<div className='flex items-center justify-center'>
								<img
									src={selectedImage.imageUrl}
									alt={selectedImage.prompt}
									className='max-w-full max-h-96 rounded-lg'
								/>
							</div>

							<div className='space-y-3'>
								<div>
									<h4 className='font-medium mb-1'>提示词</h4>
									<p className='text-sm text-muted-foreground bg-muted p-2 rounded'>
										{selectedImage.prompt}
									</p>
								</div>

								<div className='grid grid-cols-2 gap-4'>
									<div>
										<h4 className='font-medium mb-1'>生成参数</h4>
										<div className='text-sm space-y-1'>
											<p>模型: {selectedImage.model}</p>
											<p>尺寸: {selectedImage.width} × {selectedImage.height}</p>
											<p>增强: {selectedImage.enhance ? '是' : '否'}</p>
											<p>无Logo: {selectedImage.nologo ? '是' : '否'}</p>
										</div>
									</div>

									<div>
										<h4 className='font-medium mb-1'>设置</h4>
										<div className='flex flex-wrap gap-1'>
											<Badge variant='secondary' className='text-xs'>
												{selectedImage.model}
											</Badge>
											<Badge variant='outline' className='text-xs'>
												{selectedImage.width}×{selectedImage.height}
											</Badge>
											{selectedImage.enhance ? <Badge variant='outline' className='text-xs'>
												增强
                                    </Badge> : null}
										</div>
									</div>
								</div>
							</div>

							<div className='flex items-center justify-end space-x-2 pt-4 border-t'>
								<Button
									variant='outline'
									onClick={() => {
										handleDownload(selectedImage);
									}}
								>
									<Download className='w-4 h-4 mr-1'/>
									下载
								</Button>
								<Button
									variant='outline'
									disabled={regenerateMutation.isPending}
									onClick={async () => handleRegenerate(selectedImage)}
								>
									<RefreshCw className='w-4 h-4 mr-1'/>
									重新生成
								</Button>
								<Button
									variant='destructive'
									disabled={deleteMutation.isPending}
									onClick={async () => handleDelete(selectedImage)}
								>
									<Trash2 className='w-4 h-4 mr-1'/>
									删除
								</Button>
							</div>
						</div>
                      </> : null}
				</DialogContent>
			</Dialog>
		</div>
	);
};
