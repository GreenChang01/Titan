'use client';

import {type JSX, useState, useCallback} from 'react';
import {
	Package, Upload, FileAudio, FileText, FileImage, FileVideo, X, Check, AlertCircle,
} from 'lucide-react';
import {Header} from '@/components/layout/header';
import {Main} from '@/components/layout/main';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {
	Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {useDropzone} from 'react-dropzone';

type UploadFile = {
	id: string;
	file: File;
	progress: number;
	status: 'uploading' | 'completed' | 'error';
	error?: string;
	category?: string;
	description?: string;
};

export default function AssetsUploadPage(): JSX.Element {
	const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
	const [uploadMode, setUploadMode] = useState<'local' | 'webdav'>('local');
	const [isUploading, setIsUploading] = useState(false);

	const getFileIcon = (file: File) => {
		if (file.type.startsWith('audio/')) {
			return <FileAudio className='h-8 w-8 text-blue-500'/>;
		}

		if (file.type.startsWith('image/')) {
			return <FileImage className='h-8 w-8 text-green-500'/>;
		}

		if (file.type.startsWith('video/')) {
			return <FileVideo className='h-8 w-8 text-purple-500'/>;
		}

		return <FileText className='h-8 w-8 text-gray-500'/>;
	};

	const getFileCategory = (file: File) => {
		if (file.type.startsWith('audio/')) {
			return '音频';
		}

		if (file.type.startsWith('image/')) {
			return '图片';
		}

		if (file.type.startsWith('video/')) {
			return '视频';
		}

		return '文档';
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) {
			return '0 Bytes';
		}

		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / k ** i).toFixed(2)) + ' ' + sizes[i];
	};

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const newFiles: UploadFile[] = acceptedFiles.map(file => ({
			id: Math.random().toString(36).slice(7),
			file,
			progress: 0,
			status: 'uploading',
			category: getFileCategory(file),
		}));
		setUploadFiles(prev => [...prev, ...newFiles]);
		startUpload(newFiles);
	}, []);

	const {getRootProps, getInputProps, isDragActive} = useDropzone({
		onDrop,
		accept: {
			'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
			'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
			'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
			'text/*': ['.txt', '.md', '.doc', '.docx', '.pdf'],
		},
		maxSize: 100 * 1024 * 1024, // 100MB
	});

	const startUpload = async (files: UploadFile[]) => {
		setIsUploading(true);

		// Simulate upload process
		for (const fileItem of files) {
			const interval = setInterval(() => {
				setUploadFiles(prev => prev.map(f =>
					f.id === fileItem.id
						? {...f, progress: Math.min(f.progress + Math.random() * 15, 100)}
						: f));
			}, 200);

			// Complete after 3 seconds
			setTimeout(() => {
				clearInterval(interval);
				setUploadFiles(prev => prev.map(f =>
					f.id === fileItem.id
						? {...f, progress: 100, status: 'completed'}
						: f));
			}, 3000);
		}

		setTimeout(() => {
			setIsUploading(false);
		}, 3000);
	};

	const removeFile = (id: string) => {
		setUploadFiles(prev => prev.filter(f => f.id !== id));
	};

	const updateFileInfo = (id: string, field: string, value: string) => {
		setUploadFiles(prev => prev.map(f =>
			f.id === id ? {...f, [field]: value} : f));
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'completed': {
				return <Check className='h-4 w-4 text-green-500'/>;
			}

			case 'error': {
				return <AlertCircle className='h-4 w-4 text-red-500'/>;
			}

			default: {
				return <div className='h-4 w-4 rounded-full bg-blue-500 animate-pulse'/>;
			}
		}
	};

	return (
		<>
			<Header>
				<div>
					<h1 className='text-lg font-medium flex items-center gap-2'>
						<Package className='h-5 w-5 text-primary'/>
						素材上传
					</h1>
					<p className='text-sm text-muted-foreground'>
						上传音频、图片、视频等素材文件
					</p>
				</div>
			</Header>

			<Main>
				<div className='max-w-4xl mx-auto space-y-6'>
					{/* Upload Mode Selection */}
					<Card>
						<CardHeader>
							<CardTitle>上传模式</CardTitle>
							<CardDescription>选择素材的存储方式</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs
								value={uploadMode} onValueChange={(value: any) => {
									setUploadMode(value);
								}}
							>
								<TabsList className='grid w-full grid-cols-2'>
									<TabsTrigger value='local'>本地存储</TabsTrigger>
									<TabsTrigger value='webdav'>WebDAV云存储</TabsTrigger>
								</TabsList>
								<TabsContent value='local' className='space-y-2'>
									<p className='text-sm text-muted-foreground'>
										文件将上传到本地服务器存储，适合快速访问和处理
									</p>
								</TabsContent>
								<TabsContent value='webdav' className='space-y-2'>
									<p className='text-sm text-muted-foreground'>
										文件将上传到已配置的WebDAV服务（如阿里云盘），适合大容量存储
									</p>
									<div className='flex items-center gap-2'>
										<span className='text-sm'>当前连接:</span>
										<Badge variant='outline'>阿里云盘</Badge>
										<Button variant='link' size='sm'>
											配置设置
										</Button>
									</div>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>

					{/* File Upload Area */}
					<Card>
						<CardHeader>
							<CardTitle>上传文件</CardTitle>
							<CardDescription>
								支持拖拽上传，或点击选择文件（最大100MB）
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div
								{...getRootProps()}
								className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
									isDragActive
										? 'border-primary bg-primary/5'
										: 'border-muted-foreground/25 hover:border-primary/50'
								}`}
							>
								<input {...getInputProps()}/>
								<Upload className='h-12 w-12 text-muted-foreground mx-auto mb-4'/>
								{isDragActive ? (
									<p className='text-lg font-medium'>释放文件开始上传</p>
								) : (
									<div className='space-y-2'>
										<p className='text-lg font-medium'>拖拽文件到这里，或点击选择</p>
										<p className='text-sm text-muted-foreground'>
											支持音频、图片、视频、文档等格式
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Upload Queue */}
					{uploadFiles.length > 0 && (
						<Card>
							<CardHeader>
								<div className='flex items-center justify-between'>
									<div>
										<CardTitle>上传队列</CardTitle>
										<CardDescription>
											{uploadFiles.filter(f => f.status === 'completed').length} / {uploadFiles.length} 个文件已完成
										</CardDescription>
									</div>
									<Button
										variant='outline'
										size='sm'
										disabled={isUploading}
										onClick={() => {
											setUploadFiles([]);
										}}
									>
										清空队列
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{uploadFiles.map(fileItem => (
										<Card key={fileItem.id} className='p-4'>
											<div className='flex items-start gap-4'>
												<div className='flex-shrink-0'>
													{getFileIcon(fileItem.file)}
												</div>
												<div className='flex-1 min-w-0'>
													<div className='flex items-center justify-between mb-2'>
														<div>
															<h4 className='font-medium truncate'>{fileItem.file.name}</h4>
															<p className='text-sm text-muted-foreground'>
																{formatFileSize(fileItem.file.size)} • {fileItem.category}
															</p>
														</div>
														<div className='flex items-center gap-2'>
															{getStatusIcon(fileItem.status)}
															<Button
																variant='ghost'
																size='sm'
																disabled={fileItem.status === 'uploading'}
																onClick={() => {
																	removeFile(fileItem.id);
																}}
															>
																<X className='h-4 w-4'/>
															</Button>
														</div>
													</div>

													{fileItem.status === 'uploading' && (
														<div className='space-y-2'>
															<Progress value={fileItem.progress} className='h-2'/>
															<p className='text-xs text-muted-foreground'>
																{fileItem.progress.toFixed(0)}% 已上传
															</p>
														</div>
													)}

													{fileItem.status === 'completed' && (
														<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-3'>
															<div className='space-y-2'>
																<Label htmlFor={`category-${fileItem.id}`} className='text-sm'>
																	分类
																</Label>
																<Select
																	value={fileItem.category}
																	onValueChange={value => {
																		updateFileInfo(fileItem.id, 'category', value);
																	}}
																>
																	<SelectTrigger id={`category-${fileItem.id}`}>
																		<SelectValue/>
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value='音频'>音频</SelectItem>
																		<SelectItem value='图片'>图片</SelectItem>
																		<SelectItem value='视频'>视频</SelectItem>
																		<SelectItem value='文档'>文档</SelectItem>
																		<SelectItem value='其他'>其他</SelectItem>
																	</SelectContent>
																</Select>
															</div>
															<div className='space-y-2'>
																<Label htmlFor={`description-${fileItem.id}`} className='text-sm'>
																	描述（可选）
																</Label>
																<Input
																	id={`description-${fileItem.id}`}
																	placeholder='为这个文件添加描述...'
																	value={fileItem.description || ''}
																	onChange={e => {
																		updateFileInfo(fileItem.id, 'description', e.target.value);
																	}}
																/>
															</div>
														</div>
													)}

													{fileItem.status === 'error' && (
														<div className='mt-2 p-2 bg-red-50 border border-red-200 rounded'>
															<p className='text-sm text-red-600'>
																上传失败: {fileItem.error}
															</p>
														</div>
													)}
												</div>
											</div>
										</Card>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Upload Guidelines */}
					<Card>
						<CardHeader>
							<CardTitle>上传须知</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div>
									<h4 className='font-medium mb-2'>支持格式</h4>
									<ul className='text-sm text-muted-foreground space-y-1'>
										<li>• 音频: MP3, WAV, OGG, M4A</li>
										<li>• 图片: JPG, PNG, GIF, WebP</li>
										<li>• 视频: MP4, MOV, AVI, MKV</li>
										<li>• 文档: TXT, MD, DOC, PDF</li>
									</ul>
								</div>
								<div>
									<h4 className='font-medium mb-2'>使用建议</h4>
									<ul className='text-sm text-muted-foreground space-y-1'>
										<li>• 单文件大小不超过 100MB</li>
										<li>• 建议使用有意义的文件名</li>
										<li>• 为文件添加分类和描述</li>
										<li>• 定期清理不需要的文件</li>
									</ul>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</Main>
		</>
	);
}
