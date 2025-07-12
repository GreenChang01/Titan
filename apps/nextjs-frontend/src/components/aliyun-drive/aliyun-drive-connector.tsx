'use client';

import React, {useState} from 'react';
import {
	Plus,
	Settings,
	Trash2,
	TestTube,
	MoreVertical,
	CheckCircle,
	XCircle,
	Clock,
	Loader2,
	Cloud,
	HardDrive,
	RefreshCw,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
	Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
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
import {Badge} from '@/components/ui/badge';
import {Switch} from '@/components/ui/switch';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
	useAliyunDriveConfigs,
	useCreateAliyunDriveConfig,
	useUpdateAliyunDriveConfig,
	useDeleteAliyunDriveConfig,
	useTestConnection,
} from '@/hooks/api';
import type {CreateConfigRequest, UpdateConfigRequest, AliyunDriveConfig} from '@/lib/api';

type ConfigFormData = {
	name: string;
	webdavUrl: string;
	username: string;
	password: string;
};

type ConfigFormProps = {
	readonly config?: AliyunDriveConfig;
	readonly onSuccess?: () => void;
	readonly trigger?: React.ReactNode;
};

function ConfigForm({config, onSuccess, trigger}: ConfigFormProps) {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState<ConfigFormData>({
		name: config?.name || '',
		webdavUrl: config?.webdavUrl || '',
		username: config?.username || '',
		password: '',
	});

	const createMutation = useCreateAliyunDriveConfig();
	const updateMutation = useUpdateAliyunDriveConfig();
	const testMutation = useTestConnection();

	const isEditing = Boolean(config);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (isEditing) {
				const updates: UpdateConfigRequest = {
					name: formData.name,
					webdavUrl: formData.webdavUrl,
					username: formData.username,
				};

				if (formData.password) {
					updates.password = formData.password;
				}

				await updateMutation.mutateAsync({
					configId: config.id,
					updates,
				});
			} else {
				await createMutation.mutateAsync({
					name: formData.name,
					webdavUrl: formData.webdavUrl,
					username: formData.username,
					password: formData.password,
				});
			}

			setOpen(false);
			onSuccess?.();

			// Reset form for create mode
			if (!isEditing) {
				setFormData({
					name: '',
					webdavUrl: '',
					username: '',
					password: '',
				});
			}
		} catch {
			// Error is handled by the mutation's onError
		}
	};

	const handleTestConnection = async () => {
		if (!formData.webdavUrl || !formData.username || !formData.password) {
			return;
		}

		await testMutation.mutateAsync({
			name: formData.name || '测试连接',
			webdavUrl: formData.webdavUrl,
			username: formData.username,
			password: formData.password,
		});
	};

	const isLoading = createMutation.isPending || updateMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button>
						<Plus className='h-4 w-4 mr-2' />
						{isEditing ? '编辑配置' : '添加配置'}
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>
						{isEditing ? '编辑阿里云盘配置' : '添加阿里云盘配置'}
					</DialogTitle>
					<DialogDescription>
						配置WebDAV连接信息以访问您的阿里云盘
					</DialogDescription>
				</DialogHeader>

				<form className='space-y-4' onSubmit={handleSubmit}>
					<div className='space-y-2'>
						<Label htmlFor='name'>配置名称</Label>
						<Input
							required
							id='name'
							placeholder='例如：我的阿里云盘'
							value={formData.name}
							onChange={e => {
								setFormData(previous => ({...previous, name: e.target.value}));
							}}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='webdavUrl'>WebDAV URL</Label>
						<Input
							required
							id='webdavUrl'
							placeholder='https://webdav.aliyundrive.com/dav'
							value={formData.webdavUrl}
							onChange={e => {
								setFormData(previous => ({...previous, webdavUrl: e.target.value}));
							}}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='username'>用户名</Label>
						<Input
							required
							id='username'
							placeholder='阿里云盘用户名或邮箱'
							value={formData.username}
							onChange={e => {
								setFormData(previous => ({...previous, username: e.target.value}));
							}}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='password'>
							{isEditing ? '密码 (留空保持不变)' : '密码'}
						</Label>
						<Input
							id='password'
							type='password'
							placeholder='WebDAV应用密码'
							value={formData.password}
							required={!isEditing}
							onChange={e => {
								setFormData(previous => ({...previous, password: e.target.value}));
							}}
						/>
					</div>

					<div className='flex items-center gap-2'>
						<Button
							type='button'
							variant='outline'
							disabled={testMutation.isPending || !formData.webdavUrl || !formData.username || !formData.password}
							onClick={handleTestConnection}
						>
							{testMutation.isPending
								? (
									<Loader2 className='h-4 w-4 animate-spin mr-2' />
								)
								: (
									<TestTube className='h-4 w-4 mr-2' />
								)}
							测试连接
						</Button>

						{testMutation.data
							? <div className='flex items-center gap-1 text-sm'>
								{testMutation.data.success
									? (
										<>
											<CheckCircle className='h-4 w-4 text-green-600' />
											<span className='text-green-600'>连接成功</span>
										</>
									)
									: (
										<>
											<XCircle className='h-4 w-4 text-red-600' />
											<span className='text-red-600'>连接失败</span>
										</>
									)}
							</div>
							: null}
					</div>

					<div className='flex justify-end gap-2 pt-4 border-t'>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								setOpen(false);
							}}
						>
							取消
						</Button>
						<Button type='submit' disabled={isLoading}>
							{isLoading
								? (
									<Loader2 className='h-4 w-4 animate-spin mr-2' />
								)
								: null}
							{isEditing ? '更新' : '创建'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

type ConfigCardProps = {
	readonly config: AliyunDriveConfig;
};

function ConfigCard({config}: ConfigCardProps) {
	const updateMutation = useUpdateAliyunDriveConfig();
	const deleteMutation = useDeleteAliyunDriveConfig();

	const handleToggleActive = async () => {
		await updateMutation.mutateAsync({
			configId: config.id,
			updates: {isActive: !config.isActive},
		});
	};

	const handleDelete = async () => {
		await deleteMutation.mutateAsync(config.id);
	};

	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between pb-2'>
				<div className='flex items-center gap-2'>
					<Cloud className='h-5 w-5 text-blue-600' />
					<CardTitle className='text-base'>{config.name}</CardTitle>
					<Badge variant={config.isActive ? 'default' : 'secondary'}>
						{config.isActive ? '活跃' : '停用'}
					</Badge>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='ghost' size='sm'>
							<MoreVertical className='h-4 w-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<DropdownMenuLabel>操作</DropdownMenuLabel>
						<ConfigForm
							config={config}
							trigger={
								<DropdownMenuItem onSelect={e => {
									e.preventDefault();
								}}>
									<Settings className='h-4 w-4 mr-2' />
									编辑配置
								</DropdownMenuItem>
							}
						/>
						<DropdownMenuItem onClick={handleToggleActive}>
							{config.isActive
								? (
									<>
										<XCircle className='h-4 w-4 mr-2' />
										停用
									</>
								)
								: (
									<>
										<CheckCircle className='h-4 w-4 mr-2' />
										启用
									</>
								)}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<DropdownMenuItem
									className='text-destructive'
									onSelect={e => {
										e.preventDefault();
									}}
								>
									<Trash2 className='h-4 w-4 mr-2' />
									删除配置
								</DropdownMenuItem>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>确认删除</AlertDialogTitle>
									<AlertDialogDescription>
										您确定要删除配置 "{config.name}" 吗？此操作无法撤销。
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>取消</AlertDialogCancel>
									<AlertDialogAction onClick={handleDelete}>
										删除
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</DropdownMenuContent>
				</DropdownMenu>
			</CardHeader>

			<CardContent>
				<div className='space-y-2 text-sm'>
					<div className='flex items-center gap-2'>
						<HardDrive className='h-4 w-4 text-muted-foreground' />
						<span className='text-muted-foreground'>URL:</span>
						<span className='font-mono text-xs truncate'>{config.webdavUrl}</span>
					</div>
					<div className='flex items-center gap-2'>
						<span className='text-muted-foreground'>用户:</span>
						<span>{config.username}</span>
					</div>
					{config.lastSyncAt
						? <div className='flex items-center gap-2'>
							<Clock className='h-4 w-4 text-muted-foreground' />
							<span className='text-muted-foreground'>上次同步:</span>
							<span>{new Date(config.lastSyncAt).toLocaleString()}</span>
						</div>
						: null}
				</div>
			</CardContent>
		</Card>
	);
}

export function AliyunDriveConnector() {
	const {data: configs, isLoading, refetch} = useAliyunDriveConfigs();

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>阿里云盘配置</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex items-center justify-center py-8'>
						<Loader2 className='h-6 w-6 animate-spin mr-2' />
						<span>加载配置...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle>阿里云盘配置</CardTitle>
						<p className='text-sm text-muted-foreground mt-1'>
							管理您的阿里云盘WebDAV连接配置
						</p>
					</div>
					<div className='flex items-center gap-2'>
						<Button variant='outline' size='sm' onClick={async () => refetch()}>
							<RefreshCw className='h-4 w-4' />
						</Button>
						<ConfigForm />
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{configs && configs.length > 0
					? (
						<div className='grid gap-4 md:grid-cols-2'>
							{configs.map(config => (
								<ConfigCard key={config.id} config={config} />
							))}
						</div>
					)
					: (
						<div className='text-center py-8'>
							<Cloud className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
							<h3 className='text-lg font-semibold mb-2'>暂无配置</h3>
							<p className='text-muted-foreground mb-4'>
								添加您的第一个阿里云盘配置以开始使用文件浏览功能
							</p>
							<ConfigForm />
						</div>
					)}
			</CardContent>
		</Card>
	);
}
