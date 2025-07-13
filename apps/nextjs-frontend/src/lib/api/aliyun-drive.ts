import {apiClient} from './client';

// Aliyun Drive types
export type AliyunDriveConfig = {
	id: string;
	name: string;
	webdavUrl: string;
	username: string;
	isActive: boolean;
	lastSyncAt?: string;
	createdAt: string;
	updatedAt: string;
};

export type CreateConfigRequest = {
	name: string;
	webdavUrl: string;
	username: string;
	password: string;
};

export type UpdateConfigRequest = {
	name?: string;
	webdavUrl?: string;
	username?: string;
	password?: string;
	isActive?: boolean;
};

export type DriveFile = {
	id: string;
	name: string;
	path: string;
	type: 'file' | 'directory';
	size: number;
	mimeType?: string;
	modifiedAt: string;
	isSelected?: boolean;
	parentPath: string;
	extension?: string;
	thumbnail?: string;
};

export type DirectoryContent = {
	files: DriveFile[];
	directories: DriveFile[];
	currentPath: string;
	parentPath?: string;
	totalCount: number;
};

export type FileListParams = {
	path?: string;
	search?: string;
	fileType?: 'all' | 'image' | 'video' | 'audio' | 'document';
	sortBy?: 'name' | 'size' | 'modifiedAt' | 'type';
	sortOrder?: 'asc' | 'desc';
	page?: number;
	limit?: number;
};

export type UploadFileRequest = {
	file: File;
	targetPath: string;
	conflictResolution?: 'overwrite' | 'rename' | 'skip';
};

export type UploadProgress = {
	fileId: string;
	fileName: string;
	progress: number;
	status: 'pending' | 'uploading' | 'completed' | 'failed';
	error?: string;
};

export type CreateDirectoryRequest = {
	path: string;
	name: string;
};

export type MoveItemRequest = {
	sourcePath: string;
	targetPath: string;
	conflictResolution?: 'overwrite' | 'rename' | 'skip';
};

export type FileOperationResult = {
	success: boolean;
	message: string;
	newPath?: string;
};

export type ConnectionTestResult = {
	success: boolean;
	message: string;
	error?: string;
	responseTime?: number;
};

export type DriveStats = {
	totalFiles: number;
	totalDirectories: number;
	totalSize: number;
	usedSpace: number;
	availableSpace?: number;
	lastSyncAt: string;
};

// Aliyun Drive API service
export const aliyunDriveApi = {
	// Configuration management
	async getConfigs(): Promise<AliyunDriveConfig[]> {
		return apiClient.get<AliyunDriveConfig[]>('/aliyun-drive/config');
	},

	async getConfig(configId: string): Promise<AliyunDriveConfig> {
		return apiClient.get<AliyunDriveConfig>(`/aliyun-drive/config/${configId}`);
	},

	async createConfig(configData: CreateConfigRequest): Promise<AliyunDriveConfig> {
		return apiClient.post<AliyunDriveConfig>('/aliyun-drive/config', configData);
	},

	async updateConfig(configId: string, updates: UpdateConfigRequest): Promise<AliyunDriveConfig> {
		return apiClient.patch<AliyunDriveConfig>(`/aliyun-drive/config/${configId}`, updates);
	},

	async deleteConfig(configId: string): Promise<void> {
		await apiClient.delete(`/aliyun-drive/config/${configId}`);
	},

	async testConnection(configData: CreateConfigRequest): Promise<ConnectionTestResult> {
		return apiClient.post<ConnectionTestResult>('/aliyun-drive/config/test', configData);
	},

	// File operations
	async getFiles(parameters?: FileListParams): Promise<DirectoryContent> {
		const queryParameters: Record<string, string> = {};

		if (parameters) {
			if (parameters.path) {
				queryParameters.path = parameters.path;
			}

			if (parameters.search) {
				queryParameters.search = parameters.search;
			}

			if (parameters.fileType) {
				queryParameters.fileType = parameters.fileType;
			}

			if (parameters.sortBy) {
				queryParameters.sortBy = parameters.sortBy;
			}

			if (parameters.sortOrder) {
				queryParameters.sortOrder = parameters.sortOrder;
			}

			if (parameters.page) {
				queryParameters.page = parameters.page.toString();
			}

			if (parameters.limit) {
				queryParameters.limit = parameters.limit.toString();
			}
		}

		return apiClient.get<DirectoryContent>('/aliyun-drive/files', queryParameters);
	},

	async getFileInfo(path: string): Promise<DriveFile> {
		return apiClient.get<DriveFile>('/aliyun-drive/files/info', {
			path,
		});
	},

	async downloadFile(path: string): Promise<Blob> {
		const response = await fetch(`${apiClient.baseURL}/aliyun-drive/files/download?path=${encodeURIComponent(path)}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiClient.token}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Download failed: ${response.statusText}`);
		}

		return response.blob();
	},

	async getFileUrl(path: string, expiresIn?: number): Promise<{url: string; expiresAt: string}> {
		const parameters: Record<string, string> = {path};
		if (expiresIn) {
			parameters.expiresIn = expiresIn.toString();
		}

		return apiClient.get('/aliyun-drive/files/url', parameters);
	},

	async uploadFile(request: UploadFileRequest, onProgress?: (progress: UploadProgress) => void): Promise<DriveFile> {
		const formData = new FormData();
		formData.append('file', request.file);
		formData.append('targetPath', request.targetPath);
		if (request.conflictResolution) {
			formData.append('conflictResolution', request.conflictResolution);
		}

		// Note: This is a simplified implementation
		// In a real app, you'd want to implement proper upload progress tracking
		const response = await apiClient.upload<DriveFile>('/aliyun-drive/files/upload', [request.file], {
			targetPath: request.targetPath,
			conflictResolution: request.conflictResolution,
		});

		return response;
	},

	async uploadFiles(
		files: UploadFileRequest[],
		onProgress?: (progress: UploadProgress[]) => void,
	): Promise<DriveFile[]> {
		const results: DriveFile[] = [];

		for (const fileRequest of files) {
			try {
				const result = await this.uploadFile(fileRequest, onProgress);
				results.push(result);
			} catch (error) {
				console.error(`Failed to upload ${fileRequest.file.name}:`, error);
				// Continue with other files
			}
		}

		return results;
	},

	// Directory operations
	async createDirectory(request: CreateDirectoryRequest): Promise<DriveFile> {
		return apiClient.post<DriveFile>('/aliyun-drive/directories', request);
	},

	async deleteItem(path: string): Promise<FileOperationResult> {
		return apiClient.delete<FileOperationResult>('/aliyun-drive/items', {
			path,
		});
	},

	async deleteItems(paths: string[]): Promise<FileOperationResult[]> {
		return apiClient.post<FileOperationResult[]>('/aliyun-drive/items/batch-delete', {
			paths,
		});
	},

	async moveItem(request: MoveItemRequest): Promise<FileOperationResult> {
		return apiClient.post<FileOperationResult>('/aliyun-drive/items/move', request);
	},

	async copyItem(request: MoveItemRequest): Promise<FileOperationResult> {
		return apiClient.post<FileOperationResult>('/aliyun-drive/items/copy', request);
	},

	async renameItem(path: string, newName: string): Promise<FileOperationResult> {
		return apiClient.post<FileOperationResult>('/aliyun-drive/items/rename', {
			path,
			newName,
		});
	},

	// Search and filtering
	async searchFiles(
		query: string,
		options?: {
			path?: string;
			fileType?: 'all' | 'image' | 'video' | 'audio' | 'document';
			limit?: number;
		},
	): Promise<DriveFile[]> {
		const parameters: Record<string, string> = {
			search: query,
		};

		if (options?.path) {
			parameters.path = options.path;
		}

		if (options?.fileType) {
			parameters.fileType = options.fileType;
		}

		if (options?.limit) {
			parameters.limit = options.limit.toString();
		}

		return apiClient.get<DriveFile[]>('/aliyun-drive/files/search', parameters);
	},

	// Statistics and monitoring
	async getDriveStats(configId?: string): Promise<DriveStats> {
		const parameters: Record<string, string> = {};
		if (configId) {
			parameters.configId = configId;
		}

		return apiClient.get<DriveStats>('/aliyun-drive/stats', parameters);
	},

	async syncDrive(configId?: string): Promise<{success: boolean; message: string; syncedCount: number}> {
		const parameters: Record<string, string> = {};
		if (configId) {
			parameters.configId = configId;
		}

		return apiClient.post('/aliyun-drive/sync', parameters);
	},

	// Thumbnails and previews
	async getThumbnail(path: string, size?: 'small' | 'medium' | 'large'): Promise<Blob> {
		const parameters: Record<string, string> = {path};
		if (size) {
			parameters.size = size;
		}

		const response = await fetch(
			`${apiClient.baseURL}/aliyun-drive/files/thumbnail?${new URLSearchParams(parameters)}`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${apiClient.token}`,
				},
			},
		);

		if (!response.ok) {
			throw new Error(`Thumbnail generation failed: ${response.statusText}`);
		}

		return response.blob();
	},

	// Asset integration
	async addToProject(
		projectId: string,
		filePaths: string[],
	): Promise<{success: boolean; addedCount: number; errors: string[]}> {
		return apiClient.post(`/aliyun-drive/add-to-project/${projectId}`, {
			filePaths,
		});
	},

	// Utility methods
	getFileTypeFromMime(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
		if (mimeType.startsWith('image/')) {
			return 'image';
		}

		if (mimeType.startsWith('video/')) {
			return 'video';
		}

		if (mimeType.startsWith('audio/')) {
			return 'audio';
		}

		if (mimeType.includes('document') || mimeType.includes('text') || mimeType.includes('pdf')) {
			return 'document';
		}

		return 'other';
	},

	formatFileSize(bytes: number): string {
		const units = ['B', 'KB', 'MB', 'GB', 'TB'];
		let size = bytes;
		let unitIndex = 0;

		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}

		return `${size.toFixed(1)} ${units[unitIndex]}`;
	},

	getFileExtension(filename: string): string {
		const lastDot = filename.lastIndexOf('.');
		return lastDot > 0 ? filename.slice(Math.max(0, lastDot + 1)).toLowerCase() : '';
	},
};
