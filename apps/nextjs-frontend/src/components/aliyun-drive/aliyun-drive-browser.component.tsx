'use client';

import {
	useState, useEffect, useCallback, type JSX,
} from 'react';
import {Dialog} from 'primereact/dialog';
import {Button} from 'primereact/button';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Checkbox} from 'primereact/checkbox';
import {ProgressSpinner} from 'primereact/progressspinner';
import {InputText} from 'primereact/inputtext';
import {BreadCrumb} from 'primereact/breadcrumb';
import {type MenuItem} from 'primereact/menuitem';
import {useTranslations} from 'next-intl';

type FileItem = {
	id: string;
	name: string;
	type: 'file' | 'folder';
	size?: number;
	modifiedAt?: string;
	downloadUrl?: string;
	thumbnailUrl?: string;
};

type AliyunDriveBrowserProps = {
	readonly isVisible: boolean;
	readonly onHide: () => void;
	readonly onFilesSelected?: (files: FileItem[]) => void;
	readonly hasMultiSelect?: boolean;
	readonly maxSelections?: number;
};

export function AliyunDriveBrowser({
	isVisible,
	onHide,
	onFilesSelected,
	hasMultiSelect = true,
	maxSelections,
}: AliyunDriveBrowserProps): JSX.Element {
	const t = useTranslations('Component-AliyunDriveBrowser');

	const [files, setFiles] = useState<FileItem[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
	const [currentPath, setCurrentPath] = useState('/');
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	const loadFiles = useCallback(async (): Promise<void> => {
		// 模拟的文件数据
		const mockFiles: FileItem[] = [
			{
				id: '1',
				name: '项目文档',
				type: 'folder',
				modifiedAt: '2024-01-15',
			},
			{
				id: '2',
				name: '设计素材',
				type: 'folder',
				modifiedAt: '2024-01-14',
			},
			{
				id: '3',
				name: 'logo.png',
				type: 'file',
				size: 1_024_000,
				modifiedAt: '2024-01-13',
			},
			{
				id: '4',
				name: '产品介绍.pdf',
				type: 'file',
				size: 5_120_000,
				modifiedAt: '2024-01-12',
			},
			{
				id: '5',
				name: '演示视频.mp4',
				type: 'file',
				size: 102_400_000,
				modifiedAt: '2024-01-11',
			},
		];

		setLoading(true);
		try {
			// 模拟API调用
			await new Promise<void>(resolve => {
				setTimeout(resolve, 1000);
			});
			setFiles(mockFiles);
		} catch {
			// Handle error silently or use proper error handling
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (isVisible) {
			void loadFiles();
		}
	}, [isVisible, currentPath, loadFiles]);

	const handleFileSelect = (file: FileItem): void => {
		if (file.type === 'folder') {
			// 进入文件夹
			setCurrentPath(`${currentPath}${file.name}/`);
			return;
		}

		if (!hasMultiSelect) {
			setSelectedFiles([file]);
			return;
		}

		const isSelected = selectedFiles.some(f => f.id === file.id);
		if (isSelected) {
			setSelectedFiles(previous => previous.filter(f => f.id !== file.id));
		} else {
			if (maxSelections && selectedFiles.length >= maxSelections) {
				return;
			}

			setSelectedFiles(previous => [...previous, file]);
		}
	};

	const handleConfirmSelection = (): void => {
		onFilesSelected?.(selectedFiles);
		setSelectedFiles([]);
		onHide();
	};

	const formatFileSize = (bytes?: number): string => {
		if (!bytes || bytes === 0) {
			return '-';
		}

		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	const getFileIcon = (file: FileItem): string => {
		if (file.type === 'folder') {
			return 'pi pi-folder text-blue-500';
		}

		const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
		switch (extension) {
			case 'pdf': {
				return 'pi pi-file-pdf text-red-500';
			}

			case 'doc':
			case 'docx': {
				return 'pi pi-file-word text-blue-500';
			}

			case 'xls':
			case 'xlsx': {
				return 'pi pi-file-excel text-green-500';
			}

			case 'ppt':
			case 'pptx': {
				return 'pi pi-file text-orange-500';
			}

			case 'jpg':
			case 'jpeg':
			case 'png':
			case 'gif': {
				return 'pi pi-image text-purple-500';
			}

			case 'mp4':
			case 'avi':
			case 'mov': {
				return 'pi pi-video text-pink-500';
			}

			case 'mp3':
			case 'wav': {
				return 'pi pi-volume-up text-yellow-500';
			}

			default: {
				return 'pi pi-file text-gray-500';
			}
		}
	};

	const fileIconTemplate = (file: FileItem): JSX.Element => <i className={`${getFileIcon(file)} text-xl`} />;

	const fileNameTemplate = (file: FileItem): JSX.Element => (
		<div className='flex items-center gap-2'>
			{hasMultiSelect && file.type === 'file'
				? (
					<Checkbox
						checked={selectedFiles.some(f => f.id === file.id)}
						onChange={() => {
							handleFileSelect(file);
						}}
					/>
				)
				: null}
			<span
				className={file.type === 'folder' ? 'cursor-pointer text-blue-600 hover:underline' : ''}
				onClick={() => {
					if (file.type === 'folder') {
						handleFileSelect(file);
					}
				}}
			>
				{file.name}
			</span>
		</div>
	);

	const fileSizeTemplate = (file: FileItem): string => formatFileSize(file.size);

	const actionTemplate = (file: FileItem): JSX.Element => (
		<div className='flex gap-1'>
			{file.type === 'file' && (
				<Button
					icon='pi pi-plus'
					size='small'
					severity='secondary'
					tooltip={t('select-file', {defaultMessage: '选择文件'})}
					onClick={() => {
						handleFileSelect(file);
					}}
				/>
			)}
			{file.type === 'folder' && (
				<Button
					icon='pi pi-folder-open'
					size='small'
					severity='info'
					tooltip={t('open-folder', {defaultMessage: '打开文件夹'})}
					onClick={() => {
						handleFileSelect(file);
					}}
				/>
			)}
		</div>
	);

	const breadcrumbItems: MenuItem[] = currentPath
		.split('/')
		.filter(Boolean)
		.map((segment, index, array) => ({
			label: segment,
			command(): void {
				const newPath = `/${array.slice(0, index + 1).join('/')}/`;
				setCurrentPath(newPath);
			},
		}));

	const breadcrumbHome: MenuItem = {
		icon: 'pi pi-home',
		command(): void {
			setCurrentPath('/');
		},
	};

	const filteredFiles = files.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));

	const dialogFooter = (
		<div className='flex justify-between items-center'>
			<span className='text-sm text-gray-600'>
				{t('selected-count', {
					count: selectedFiles.length,
					defaultMessage: `已选择 ${selectedFiles.length} 个文件`,
				})}
			</span>
			<div className='flex gap-2'>
				<Button label={t('cancel', {defaultMessage: '取消'})} severity='secondary' onClick={onHide} />
				<Button
					label={t('confirm-selection', {defaultMessage: '确认选择'})}
					disabled={selectedFiles.length === 0}
					onClick={handleConfirmSelection}
				/>
			</div>
		</div>
	);

	return (
		<Dialog
			maximizable
			header={t('title', {defaultMessage: '浏览阿里云盘'})}
			visible={isVisible}
			style={{width: '80vw', maxWidth: '1000px'}}
			footer={dialogFooter}
			onHide={onHide}
		>
			<div className='space-y-4'>
				{/* 导航面包屑 */}
				<BreadCrumb model={breadcrumbItems} home={breadcrumbHome} />

				{/* 搜索框 */}
				<div className='flex items-center gap-2'>
					<span className='p-input-icon-left w-full'>
						<i className='pi pi-search' />
						<InputText
							value={searchTerm}
							placeholder={t('search-files', {defaultMessage: '搜索文件...'})}
							className='w-full'
							onChange={e => {
								setSearchTerm(e.target.value);
							}}
						/>
					</span>
					<Button
						icon='pi pi-refresh'
						severity='secondary'
						tooltip={t('refresh', {defaultMessage: '刷新'})}
						onClick={loadFiles}
					/>
				</div>

				{/* 文件列表 */}
				<div className='border rounded-lg'>
					{loading
						? (
							<div className='flex justify-center items-center py-8'>
								<ProgressSpinner />
								<span className='ml-2'>{t('loading', {defaultMessage: '加载中...'})}</span>
							</div>
						)
						: (
							<DataTable
								className='border-0'
								dataKey='id'
								emptyMessage={t('no-files', {defaultMessage: '暂无文件'})}
								selection={selectedFiles}
								selectionMode={hasMultiSelect ? 'checkbox' : null}
								value={filteredFiles}
								onSelectionChange={(e: {value: FileItem[]}) => {
									setSelectedFiles(e.value);
								}}
							>
								<Column header='' body={fileIconTemplate} style={{width: '3rem'}} />
								<Column
									sortable
									field='name'
									header={t('file-name', {defaultMessage: '文件名'})}
									body={fileNameTemplate}
								/>
								<Column
									sortable
									field='size'
									header={t('file-size', {defaultMessage: '大小'})}
									body={fileSizeTemplate}
									style={{width: '8rem'}}
								/>
								<Column
									sortable
									field='modifiedAt'
									header={t('modified-date', {defaultMessage: '修改时间'})}
									style={{width: '10rem'}}
								/>
								<Column header={t('actions', {defaultMessage: '操作'})} body={actionTemplate} style={{width: '5rem'}} />
							</DataTable>
						)}
				</div>

				{/* 选择提示 */}
				{selectedFiles.length > 0 && (
					<div className='bg-blue-50 border border-blue-200 rounded-md p-3'>
						<div className='flex items-center gap-2'>
							<i className='pi pi-info-circle text-blue-600' />
							<span className='text-blue-800'>
								{t('selection-info', {
									count: selectedFiles.length,
									names: selectedFiles.map(f => f.name).join(', '),
									defaultMessage: `已选择 ${selectedFiles.length} 个文件: ${selectedFiles.map(f => f.name).join(', ')}`,
								})}
							</span>
						</div>
					</div>
				)}
			</div>
		</Dialog>
	);
}
