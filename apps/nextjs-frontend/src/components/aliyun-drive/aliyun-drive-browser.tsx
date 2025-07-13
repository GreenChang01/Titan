'use client';

import React, {useState} from 'react';
import {
	Cloud,
	FolderIcon,
	FileIcon,
	ImageIcon,
	VideoIcon,
	AudioWaveform,
	FileTextIcon,
	Upload,
	Download,
	Trash2,
	MoreVertical,
	Search,
	Grid3X3,
	List,
	ArrowUpDown,
	Filter,
	Plus,
	Settings,
	Loader2,
	RefreshCw,
	Eye,
	CheckSquare,
	Square,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Separator} from '@/components/ui/separator';
import {Checkbox} from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {useAliyunDriveFiles, useAliyunDriveConfigs} from '@/hooks/api';
import {formatFileSize, getFileTypeIcon} from '@/lib/utils/file';
import type {DriveFile, FileListParams} from '@/lib/api';

// File type icon helper
function getFileTypeIcon(file: DriveFile, className?: string) {
	if (file.type === 'directory') {
		return <FolderIcon className={className} />;
	}

	const mimeType = file.mimeType || '';

	if (mimeType.startsWith('image/')) {
		return <ImageIcon className={className} />;
	}

	if (mimeType.startsWith('video/')) {
		return <VideoIcon className={className} />;
	}

	if (mimeType.startsWith('audio/')) {
		return <AudioWaveform className={className} />;
	}

	if (mimeType.includes('text') || mimeType.includes('document')) {
		return <FileTextIcon className={className} />;
	}

	return <FileIcon className={className} />;
}

// Format file size helper
function formatFileSize(bytes: number): string {
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(1)} ${units[unitIndex]}`;
}

type FileListProps = {
	readonly files: DriveFile[];
	readonly selectedFiles: string[];
	readonly onFileSelect: (path: string, selected: boolean) => void;
	readonly onFileDoubleClick: (file: DriveFile) => void;
	readonly viewMode: 'grid' | 'list';
};

function FileList({files, selectedFiles, onFileSelect, onFileDoubleClick, viewMode}: FileListProps) {
	if (viewMode === 'grid') {
		return (
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{files.map((file) => (
					<Card
						key={file.path}
						className={`cursor-pointer hover:bg-accent transition-colors ${
							selectedFiles.includes(file.path) ? 'ring-2 ring-primary' : ''
						}`}
						onClick={() => {
							onFileSelect(file.path, !selectedFiles.includes(file.path));
						}}
						onDoubleClick={() => {
							onFileDoubleClick(file);
						}}
					>
						<CardContent className="p-4 text-center">
							<div className="mb-2 flex justify-center">{getFileTypeIcon(file, 'h-8 w-8 text-muted-foreground')}</div>
							<div className="text-sm font-medium truncate" title={file.name}>
								{file.name}
							</div>
							{file.type === 'file' && (
								<div className="text-xs text-muted-foreground mt-1">{formatFileSize(file.size)}</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-1">
			{files.map((file) => (
				<div
					key={file.path}
					className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${
						selectedFiles.includes(file.path) ? 'bg-accent' : ''
					}`}
					onClick={() => {
						onFileSelect(file.path, !selectedFiles.includes(file.path));
					}}
					onDoubleClick={() => {
						onFileDoubleClick(file);
					}}
				>
					<Checkbox
						checked={selectedFiles.includes(file.path)}
						onCheckedChange={(checked) => {
							onFileSelect(file.path, checked as boolean);
						}}
						onClick={(e) => {
							e.stopPropagation();
						}}
					/>
					{getFileTypeIcon(file, 'h-4 w-4 text-muted-foreground')}
					<div className="flex-1 min-w-0">
						<div className="font-medium truncate">{file.name}</div>
						<div className="text-sm text-muted-foreground">
							{file.type === 'file' ? formatFileSize(file.size) : '文件夹'}
						</div>
					</div>
					<div className="text-sm text-muted-foreground">{new Date(file.modifiedAt).toLocaleDateString()}</div>
					<DropdownMenu>
						<DropdownMenuTrigger
							asChild
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							<Button variant="ghost" size="sm">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>
								<Eye className="h-4 w-4 mr-2" />
								预览
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Download className="h-4 w-4 mr-2" />
								下载
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-destructive">
								<Trash2 className="h-4 w-4 mr-2" />
								删除
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			))}
		</div>
	);
}

type PathBreadcrumbProps = {
	readonly currentPath: string;
	readonly onPathChange: (path: string) => void;
};

function PathBreadcrumb({currentPath, onPathChange}: PathBreadcrumbProps) {
	const pathSegments = currentPath.split('/').filter(Boolean);

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink
						href="#"
						onClick={(e) => {
							e.preventDefault();
							onPathChange('/');
						}}
					>
						根目录
					</BreadcrumbLink>
				</BreadcrumbItem>
				{pathSegments.map((segment, index) => (
					<React.Fragment key={index}>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							{index === pathSegments.length - 1 ? (
								<BreadcrumbPage>{segment}</BreadcrumbPage>
							) : (
								<BreadcrumbLink
									href="#"
									onClick={(e) => {
										e.preventDefault();
										const newPath = '/' + pathSegments.slice(0, index + 1).join('/');
										onPathChange(newPath);
									}}
								>
									{segment}
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
					</React.Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}

type AliyunDriveBrowserProps = {
	readonly projectId?: string;
	readonly onFilesSelected?: (files: DriveFile[]) => void;
	readonly selectionMode?: 'single' | 'multiple';
	readonly allowedTypes?: Array<'image' | 'video' | 'audio' | 'document'>;
};

export function AliyunDriveBrowser({
	projectId,
	onFilesSelected,
	selectionMode = 'multiple',
	allowedTypes,
}: AliyunDriveBrowserProps) {
	const [currentPath, setCurrentPath] = useState('/');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
	const [sortBy, setSortBy] = useState<'name' | 'size' | 'modifiedAt' | 'type'>('name');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');

	const parameters: FileListParams = {
		path: currentPath,
		search: searchQuery || undefined,
		fileType: fileTypeFilter === 'all' ? undefined : fileTypeFilter,
		sortBy,
		sortOrder,
	};

	const {data: configs} = useAliyunDriveConfigs();
	const {data: fileData, isLoading, error, refetch} = useAliyunDriveFiles(parameters);

	const files = fileData ? [...fileData.directories, ...fileData.files] : [];

	const handleFileSelect = (path: string, selected: boolean) => {
		if (selectionMode === 'single') {
			setSelectedFiles(selected ? [path] : []);
		} else {
			setSelectedFiles((previous) => (selected ? [...previous, path] : previous.filter((p) => p !== path)));
		}
	};

	const handleSelectAll = () => {
		if (selectedFiles.length === files.length) {
			setSelectedFiles([]);
		} else {
			setSelectedFiles(files.map((f) => f.path));
		}
	};

	const handleFileDoubleClick = (file: DriveFile) => {
		if (file.type === 'directory') {
			setCurrentPath(file.path);
		} else {
			// Handle file preview or selection
			if (onFilesSelected) {
				onFilesSelected([file]);
			}
		}
	};

	const selectedFileObjects = files.filter((f) => selectedFiles.includes(f.path));

	if (!configs || configs.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>阿里云盘文件浏览器</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<Cloud className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">未配置阿里云盘</h3>
						<p className="text-muted-foreground mb-4">请先配置阿里云盘连接以浏览文件</p>
						<Button>
							<Settings className="h-4 w-4 mr-2" />
							配置阿里云盘
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Cloud className="h-5 w-5" />
					阿里云盘文件浏览器
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Toolbar */}
				<div className="flex items-center gap-2 flex-wrap">
					<div className="flex-1 min-w-[200px]">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="搜索文件..."
								value={searchQuery}
								className="pl-10"
								onChange={(e) => {
									setSearchQuery(e.target.value);
								}}
							/>
						</div>
					</div>

					<Select
						value={fileTypeFilter}
						onValueChange={(value: any) => {
							setFileTypeFilter(value);
						}}
					>
						<SelectTrigger className="w-[120px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">所有文件</SelectItem>
							<SelectItem value="image">图片</SelectItem>
							<SelectItem value="video">视频</SelectItem>
							<SelectItem value="audio">音频</SelectItem>
							<SelectItem value="document">文档</SelectItem>
						</SelectContent>
					</Select>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<ArrowUpDown className="h-4 w-4 mr-2" />
								排序
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>排序方式</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => {
									setSortBy('name');
								}}
							>
								名称 {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									setSortBy('size');
								}}
							>
								大小 {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									setSortBy('modifiedAt');
								}}
							>
								修改时间 {sortBy === 'modifiedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => {
									setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
								}}
							>
								{sortOrder === 'asc' ? '降序' : '升序'}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<div className="flex items-center gap-1">
						<Button
							variant={viewMode === 'list' ? 'default' : 'outline'}
							size="sm"
							onClick={() => {
								setViewMode('list');
							}}
						>
							<List className="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === 'grid' ? 'default' : 'outline'}
							size="sm"
							onClick={() => {
								setViewMode('grid');
							}}
						>
							<Grid3X3 className="h-4 w-4" />
						</Button>
					</div>

					<Button variant="outline" size="sm" onClick={async () => refetch()}>
						<RefreshCw className="h-4 w-4" />
					</Button>
				</div>

				{/* Path Breadcrumb */}
				<PathBreadcrumb currentPath={currentPath} onPathChange={setCurrentPath} />

				{/* Selection Info */}
				{selectedFiles.length > 0 && (
					<div className="flex items-center gap-2 p-2 bg-accent rounded-md">
						<Badge variant="secondary">{selectedFiles.length} 个文件已选择</Badge>
						{onFilesSelected ? (
							<Button
								size="sm"
								onClick={() => {
									onFilesSelected(selectedFileObjects);
								}}
							>
								添加到项目
							</Button>
						) : null}
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setSelectedFiles([]);
							}}
						>
							清除选择
						</Button>
					</div>
				)}

				{/* File List */}
				<div className="border rounded-md">
					<div className="p-4 border-b bg-muted/50">
						<div className="flex items-center gap-2">
							<Checkbox
								checked={selectedFiles.length === files.length && files.length > 0}
								indeterminate={selectedFiles.length > 0 && selectedFiles.length < files.length}
								onCheckedChange={handleSelectAll}
							/>
							<span className="text-sm font-medium">{files.length} 个项目</span>
						</div>
					</div>

					<ScrollArea className="h-[400px]">
						<div className="p-4">
							{isLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin" />
									<span className="ml-2">加载中...</span>
								</div>
							) : error ? (
								<div className="text-center py-8">
									<p className="text-destructive">加载失败</p>
									<Button variant="outline" className="mt-2" onClick={async () => refetch()}>
										重试
									</Button>
								</div>
							) : files.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<FolderIcon className="h-12 w-12 mx-auto mb-4" />
									<p>此文件夹为空</p>
								</div>
							) : (
								<FileList
									files={files}
									selectedFiles={selectedFiles}
									viewMode={viewMode}
									onFileSelect={handleFileSelect}
									onFileDoubleClick={handleFileDoubleClick}
								/>
							)}
						</div>
					</ScrollArea>
				</div>
			</CardContent>
		</Card>
	);
}
