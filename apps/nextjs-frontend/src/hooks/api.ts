'use client';

import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryResult,
	type UseMutationResult,
} from '@tanstack/react-query';
import {toast} from 'sonner';
import {
	authApi,
	projectsApi,
	aliyunDriveApi,
	type LoginRequest,
	type RegisterRequest,
	type CreateProjectRequest,
	type UpdateProjectRequest,
	type ProjectListParams,
	type CreateConfigRequest,
	type UpdateConfigRequest,
	type FileListParams,
	type UploadFileRequest,
	type CreateDirectoryRequest,
	type MoveItemRequest,
	type AuthResponse,
	type User,
	type Project,
	type ProjectListResponse,
	type ProjectMaterial,
	type ProjectActivity,
	type ProjectStats,
	type AliyunDriveConfig,
	type DirectoryContent,
	type DriveStats,
	type DriveFile,
	type ConnectionTestResult,
	type SyncResult,
	type AddToProjectResult,
} from '@/lib/api';
import {queryKeys, invalidateQueries} from '@/lib/react-query.tsx';

/**
 * 认证相关的 React Query Hooks
 */

/**
 * 获取当前用户信息
 * @returns 用户信息查询结果
 */
export function useAuth(): UseQueryResult<User> {
	return useQuery({
		queryKey: queryKeys.auth.profile,
		queryFn: authApi.getProfile,
		retry: false,
	});
}

/**
 * 用户登录 mutation hook
 * @returns 登录 mutation 结果，包含成功和错误处理
 */
export function useLogin(): UseMutationResult<AuthResponse, Error, LoginRequest> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (credentials: LoginRequest) => authApi.login(credentials),
		onSuccess(data) {
			queryClient.setQueryData(queryKeys.auth.profile, data.user);
			toast.success('登录成功');
		},
		onError(error: Error) {
			toast.error(error.message ?? '登录失败');
		},
	});
}

/**
 * 用户注册 mutation hook
 * @returns 注册 mutation 结果，包含成功和错误处理
 */
export function useRegister(): UseMutationResult<AuthResponse, Error, RegisterRequest> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (userData: RegisterRequest) => authApi.register(userData),
		onSuccess(data) {
			queryClient.setQueryData(queryKeys.auth.profile, data.user);
			toast.success('注册成功');
		},
		onError(error: Error) {
			toast.error(error.message ?? '注册失败');
		},
	});
}

/**
 * 用户登出 mutation hook
 * @returns 登出 mutation 结果，清除本地缓存和认证状态
 */
export function useLogout(): UseMutationResult<void, Error, void> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: authApi.logout,
		onSuccess() {
			queryClient.clear();
			toast.success('已退出登录');
		},
	});
}

/**
 * 项目相关的 React Query Hooks
 */

/**
 * 获取项目列表
 * @param parameters - 查询参数（分页、搜索、筛选等）
 * @returns 项目列表查询结果
 */
export function useProjects(parameters?: ProjectListParams): UseQueryResult<ProjectListResponse> {
	return useQuery({
		queryKey: queryKeys.projects.list(parameters ?? {}),
		queryFn: async () => projectsApi.getProjects(parameters),
	});
}

/**
 * 获取项目详情
 * @param projectId - 项目ID
 * @param enabled - 是否启用查询，默认为true
 * @returns 项目详情查询结果
 */
export function useProject(projectId: string, enabled = true): UseQueryResult<Project> {
	return useQuery({
		queryKey: queryKeys.projects.detail(projectId),
		queryFn: async () => projectsApi.getProject(projectId),
		enabled: enabled && Boolean(projectId),
	});
}

/**
 * 获取项目素材列表
 * @param projectId - 项目ID
 * @param enabled - 是否启用查询，默认为true
 * @returns 项目素材列表查询结果
 */
export function useProjectMaterials(projectId: string, enabled = true): UseQueryResult<ProjectMaterial[]> {
	return useQuery({
		queryKey: queryKeys.projects.materials(projectId),
		queryFn: async () => projectsApi.getProjectMaterials(projectId),
		enabled: enabled && Boolean(projectId),
	});
}

/**
 * 获取项目活动记录
 * @param projectId - 项目ID
 * @param parameters - 查询参数（分页等）
 * @returns 项目活动记录查询结果
 */
export function useProjectActivities(
	projectId: string,
	parameters?: {page?: number; limit?: number},
): UseQueryResult<ProjectActivity[]> {
	return useQuery({
		queryKey: queryKeys.projects.activities(projectId),
		queryFn: async () => projectsApi.getProjectActivities(projectId, parameters),
		enabled: Boolean(projectId),
	});
}

/**
 * 获取项目统计信息
 * @returns 项目统计信息查询结果
 */
export function useProjectStats(): UseQueryResult<ProjectStats> {
	return useQuery({
		queryKey: queryKeys.projects.stats(),
		queryFn: projectsApi.getProjectStats,
	});
}

/**
 * 获取最近项目列表
 * @param limit - 返回项目数量限制，默认为5
 * @returns 最近项目列表查询结果
 */
export function useRecentProjects(limit = 5): UseQueryResult<Project[]> {
	return useQuery({
		queryKey: queryKeys.projects.recent(),
		queryFn: async () => projectsApi.getRecentProjects(limit),
	});
}

/**
 * 创建项目 mutation hook
 * @returns 创建项目 mutation 结果，包含成功和错误处理
 */
export function useCreateProject(): UseMutationResult<Project, Error, CreateProjectRequest> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (projectData: CreateProjectRequest) => projectsApi.createProject(projectData),
		onSuccess() {
			invalidateQueries.projects(queryClient);
			toast.success('项目创建成功');
		},
		onError(error: Error) {
			toast.error(error.message ?? '项目创建失败');
		},
	});
}

/**
 * 更新项目 mutation hook
 * @returns 更新项目 mutation 结果，包含成功和错误处理
 */
export function useUpdateProject(): UseMutationResult<
	Project,
	Error,
	{projectId: string; updates: UpdateProjectRequest}
> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({projectId, updates}: {projectId: string; updates: UpdateProjectRequest}) =>
			projectsApi.updateProject(projectId, updates),
		onSuccess(data, variables) {
			queryClient.setQueryData(queryKeys.projects.detail(variables.projectId), data);
			invalidateQueries.projects(queryClient);
			toast.success('项目更新成功');
		},
		onError(error: Error) {
			toast.error(error.message ?? '项目更新失败');
		},
	});
}

/**
 * 删除项目 mutation hook
 * @returns 删除项目 mutation 结果，包含成功和错误处理
 */
export function useDeleteProject(): UseMutationResult<void, Error, string> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: projectsApi.deleteProject,
		onSuccess() {
			invalidateQueries.projects(queryClient);
			toast.success('项目删除成功');
		},
		onError(error: Error) {
			toast.error(error.message ?? '项目删除失败');
		},
	});
}

/**
 * 添加项目素材 mutation hook
 * @returns 添加素材 mutation 结果，包含成功和错误处理
 */
export function useAddMaterials(): UseMutationResult<
	ProjectMaterial[],
	Error,
	{projectId: string; assetIds: string[]}
> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({projectId, assetIds}: {projectId: string; assetIds: string[]}) =>
			projectsApi.addMaterials(projectId, {assetIds}),
		onSuccess(data, variables) {
			invalidateQueries.projectDetail(queryClient, variables.projectId);
			toast.success(`成功添加 ${data.length} 个素材`);
		},
		onError(error: Error) {
			toast.error(error.message ?? '添加素材失败');
		},
	});
}

/**
 * 移除项目素材 mutation hook
 * @returns 移除素材 mutation 结果，包含成功和错误处理
 */
export function useRemoveMaterial(): UseMutationResult<void, Error, {projectId: string; materialId: string}> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({projectId, materialId}: {projectId: string; materialId: string}) =>
			projectsApi.removeMaterial(projectId, materialId),
		onSuccess(data, variables) {
			invalidateQueries.projectDetail(queryClient, variables.projectId);
			toast.success('素材移除成功');
		},
		onError(error: Error) {
			toast.error(error.message ?? '移除素材失败');
		},
	});
}

/**
 * 阿里云盘相关的 React Query Hooks
 */

/**
 * 获取所有阿里云盘配置列表
 * @description 用于设置页面展示所有可用的WebDAV配置
 * @returns 返回包含所有配置对象的查询结果
 */
export function useAliyunDriveConfigs(): UseQueryResult<AliyunDriveConfig[]> {
	return useQuery({
		queryKey: queryKeys.aliyunDrive.configs(),
		queryFn: aliyunDriveApi.getConfigs,
	});
}

/**
 * 获取单个阿里云盘配置详情
 * @param configId - 配置的唯一标识符
 * @param enabled - 是否启用查询，默认为true
 * @returns 返回单个配置对象的查询结果
 */
export function useAliyunDriveConfig(configId: string, enabled = true): UseQueryResult<AliyunDriveConfig> {
	return useQuery({
		queryKey: queryKeys.aliyunDrive.config(configId),
		queryFn: async () => aliyunDriveApi.getConfig(configId),
		enabled: enabled && Boolean(configId),
	});
}

/**
 * 获取指定路径下的文件和目录列表
 * @description 文件浏览器的核心查询hook，支持分页和搜索
 * @param parameters - 查询参数（路径、分页、搜索等）
 * @returns 返回目录内容的查询结果，包含文件和子目录
 */
export function useAliyunDriveFiles(parameters?: FileListParams): UseQueryResult<DirectoryContent> {
	return useQuery({
		queryKey: queryKeys.aliyunDrive.fileList(parameters ?? {}),
		queryFn: async () => aliyunDriveApi.getFiles(parameters),
		staleTime: 2 * 60 * 1000, // 2分钟缓存时间
	});
}

/**
 * 获取云盘存储统计信息
 * @description 显示总容量、已用空间等统计数据
 * @param configId - 可选的配置ID，不传则使用默认配置
 * @returns 返回包含统计信息的查询结果
 */
export function useAliyunDriveStats(configId?: string): UseQueryResult<DriveStats> {
	return useQuery({
		queryKey: queryKeys.aliyunDrive.stats(),
		queryFn: async () => aliyunDriveApi.getDriveStats(configId),
	});
}

/**
 * 创建阿里云盘配置 mutation hook
 * @description 创建新的WebDAV连接配置，包含服务器地址、认证信息等
 * @returns 创建配置的mutation结果，包含成功和错误处理
 */
export function useCreateAliyunDriveConfig(): UseMutationResult<AliyunDriveConfig, Error, CreateConfigRequest> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (configData: CreateConfigRequest) => aliyunDriveApi.createConfig(configData),
		onSuccess() {
			invalidateQueries.aliyunDrive(queryClient);
			toast.success('配置创建成功');
		},
		onError(error: Error) {
			toast.error(error.message ?? '配置创建失败');
		},
	});
}

/**
 * 更新阿里云盘配置 mutation hook
 * @description 修改已存在的WebDAV配置信息
 * @returns 更新配置的mutation结果，包含成功和错误处理
 */
export function useUpdateAliyunDriveConfig(): UseMutationResult<
	AliyunDriveConfig,
	Error,
	{configId: string; updates: UpdateConfigRequest}
> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({configId, updates}: {configId: string; updates: UpdateConfigRequest}) =>
			aliyunDriveApi.updateConfig(configId, updates),
		onSuccess(data, variables) {
			queryClient.setQueryData(queryKeys.aliyunDrive.config(variables.configId), data);
			invalidateQueries.aliyunDrive(queryClient);
			toast.success('配置更新成功');
		},
		onError(error: Error) {
			toast.error(error.message ?? '配置更新失败');
		},
	});
}

/**
 * 删除阿里云盘配置 mutation hook
 * @description 删除指定的WebDAV配置
 * @returns 删除配置的mutation结果，包含成功和错误处理
 */
export function useDeleteAliyunDriveConfig(): UseMutationResult<void, Error, string> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: aliyunDriveApi.deleteConfig,
		onSuccess() {
			invalidateQueries.aliyunDrive(queryClient);
			toast.success('配置删除成功');
		},
		onError(error: Error) {
			toast.error(error.message ?? '配置删除失败');
		},
	});
}

/**
 * 测试WebDAV连接 mutation hook
 * @description 在保存配置前验证服务器地址、用户名和密码是否正确
 * @returns 连接测试的mutation结果，返回连接状态和错误信息
 */
export function useTestConnection(): UseMutationResult<ConnectionTestResult, Error, CreateConfigRequest> {
	return useMutation({
		mutationFn: async (configData: CreateConfigRequest) => aliyunDriveApi.testConnection(configData),
		onSuccess(data) {
			if (data.success) {
				toast.success('连接测试成功');
			} else {
				toast.error(data.message ?? '连接测试失败');
			}
		},
		onError(error: Error) {
			toast.error(error.message ?? '连接测试失败');
		},
	});
}

/**
 * 上传文件到云盘 mutation hook
 * @description 将本地文件上传到指定的云盘路径
 * @returns 文件上传的mutation结果，支持批量上传
 */
export function useUploadFiles(): UseMutationResult<DriveFile[], Error, UploadFileRequest[]> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (files: UploadFileRequest[]) => aliyunDriveApi.uploadFiles(files),
		onSuccess(data) {
			invalidateQueries.aliyunDriveFiles(queryClient);
			toast.success(`成功上传 ${data.length} 个文件`);
		},
		onError(error: Error) {
			toast.error(error.message ?? '文件上传失败');
		},
	});
}

/**
 * 创建目录 mutation hook
 * @description 在指定路径下创建新的文件夹
 * @returns 创建目录的mutation结果，返回新建的目录信息
 */
export function useCreateDirectory(): UseMutationResult<DriveFile, Error, CreateDirectoryRequest> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (request: CreateDirectoryRequest) => aliyunDriveApi.createDirectory(request),
		onSuccess(data) {
			invalidateQueries.aliyunDriveFiles(queryClient, data.parentPath);
			toast.success('文件夹创建成功');
		},
		onError(error: Error) {
			toast.error(error.message ?? '文件夹创建失败');
		},
	});
}

/**
 * 删除文件或目录 mutation hook
 * @description 从云盘中删除一个或多个文件/目录，支持批量删除
 * @returns 删除操作的mutation结果，返回每个删除项的状态
 */
export function useDeleteItems(): UseMutationResult<
	Array<{path: string; success: boolean; error?: string}>,
	Error,
	string[]
> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (paths: string[]) => aliyunDriveApi.deleteItems(paths),
		onSuccess(data) {
			invalidateQueries.aliyunDriveFiles(queryClient);
			const successCount = data.filter(result => result.success).length;
			toast.success(`成功删除 ${successCount} 个项目`);
		},
		onError(error: Error) {
			toast.error(error.message ?? '删除失败');
		},
	});
}

/**
 * 移动文件或目录 mutation hook
 * @description 将云盘中的文件或目录移动到新位置
 * @returns 移动操作的mutation结果
 */
export function useMoveItem(): UseMutationResult<DriveFile, Error, MoveItemRequest> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (request: MoveItemRequest) => aliyunDriveApi.moveItem(request),
		onSuccess() {
			invalidateQueries.aliyunDriveFiles(queryClient);
			toast.success('移动成功');
		},
		onError(error: Error) {
			toast.error(error.message ?? '移动失败');
		},
	});
}

/**
 * 添加云盘文件到项目 mutation hook
 * @description 将指定的云盘文件/目录关联到内部项目中，连接云盘资源和项目管理
 * @returns 添加到项目的mutation结果，返回添加结果和失败信息
 */
export function useAddToProject(): UseMutationResult<
	AddToProjectResult,
	Error,
	{projectId: string; filePaths: string[]}
> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({projectId, filePaths}: {projectId: string; filePaths: string[]}) =>
			aliyunDriveApi.addToProject(projectId, filePaths),
		onSuccess(data, variables) {
			invalidateQueries.projectDetail(queryClient, variables.projectId);
			toast.success(`成功添加 ${data.addedCount} 个文件到项目`);

			if (data.errors.length > 0) {
				toast.warning(`${data.errors.length} 个文件添加失败`);
			}
		},
		onError(error: Error) {
			toast.error(error.message ?? '添加到项目失败');
		},
	});
}

/**
 * 同步云盘数据 mutation hook
 * @description 触发对指定云盘的全量或增量同步，这是一个耗时较长的后台操作
 * @returns 同步操作的mutation结果，返回同步状态和处理的文件数量
 */
export function useSyncDrive(): UseMutationResult<SyncResult, Error, string | undefined> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (configId?: string) => aliyunDriveApi.syncDrive(configId),
		onSuccess(data) {
			invalidateQueries.aliyunDrive(queryClient);
			if (data.success) {
				toast.success(`同步完成，处理了 ${data.syncedCount} 个文件`);
			} else {
				toast.error(data.message ?? '同步失败');
			}
		},
		onError(error: Error) {
			toast.error(error.message ?? '同步失败');
		},
	});
}
