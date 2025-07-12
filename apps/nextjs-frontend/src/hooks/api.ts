'use client';

import {
	useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult,
} from '@tanstack/react-query';
import {toast} from 'sonner';
import {
	authApi, projectsApi, aliyunDriveApi,
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
} from '@/lib/api.js';
import {queryKeys, invalidateQueries} from '@/lib/react-query.tsx';

// Auth hooks
export function useAuth(): UseQueryResult<User, Error> {
	return useQuery({
		queryKey: queryKeys.auth.profile,
		queryFn: authApi.getProfile,
		retry: false,
	});
}

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

// Project hooks
export function useProjects(parameters?: ProjectListParams): UseQueryResult<ProjectListResponse, Error> {
	return useQuery({
		queryKey: queryKeys.projects.list(parameters ?? {}),
		queryFn: async () => projectsApi.getProjects(parameters),
	});
}

export function useProject(projectId: string, enabled = true): UseQueryResult<Project, Error> {
	return useQuery({
		queryKey: queryKeys.projects.detail(projectId),
		queryFn: async () => projectsApi.getProject(projectId),
		enabled: enabled && Boolean(projectId),
	});
}

export function useProjectMaterials(projectId: string, enabled = true): UseQueryResult<ProjectMaterial[], Error> {
	return useQuery({
		queryKey: queryKeys.projects.materials(projectId),
		queryFn: async () => projectsApi.getProjectMaterials(projectId),
		enabled: enabled && Boolean(projectId),
	});
}

export function useProjectActivities(projectId: string, parameters?: {page?: number; limit?: number}): UseQueryResult<ProjectActivity[], Error> {
	return useQuery({
		queryKey: queryKeys.projects.activities(projectId),
		queryFn: async () => projectsApi.getProjectActivities(projectId, parameters),
		enabled: Boolean(projectId),
	});
}

export function useProjectStats(): UseQueryResult<ProjectStats, Error> {
	return useQuery({
		queryKey: queryKeys.projects.stats(),
		queryFn: projectsApi.getProjectStats,
	});
}

export function useRecentProjects(limit = 5): UseQueryResult<Project[], Error> {
	return useQuery({
		queryKey: queryKeys.projects.recent(),
		queryFn: async () => projectsApi.getRecentProjects(limit),
	});
}

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

export function useUpdateProject(): UseMutationResult<Project, Error, {projectId: string; updates: UpdateProjectRequest}> {
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

export function useAddMaterials(): UseMutationResult<ProjectMaterial[], Error, {projectId: string; assetIds: string[]}> {
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

// Aliyun Drive hooks
export function useAliyunDriveConfigs(): UseQueryResult<AliyunDriveConfig[], Error> {
	return useQuery({
		queryKey: queryKeys.aliyunDrive.configs(),
		queryFn: aliyunDriveApi.getConfigs,
	});
}

export function useAliyunDriveConfig(configId: string, enabled = true): UseQueryResult<AliyunDriveConfig, Error> {
	return useQuery({
		queryKey: queryKeys.aliyunDrive.config(configId),
		queryFn: async () => aliyunDriveApi.getConfig(configId),
		enabled: enabled && Boolean(configId),
	});
}

export function useAliyunDriveFiles(parameters?: FileListParams): UseQueryResult<DirectoryContent, Error> {
	return useQuery({
		queryKey: queryKeys.aliyunDrive.fileList(parameters ?? {}),
		queryFn: async () => aliyunDriveApi.getFiles(parameters),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useAliyunDriveStats(configId?: string): UseQueryResult<DriveStats, Error> {
	return useQuery({
		queryKey: queryKeys.aliyunDrive.stats(),
		queryFn: async () => aliyunDriveApi.getDriveStats(configId),
	});
}

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

export function useUpdateAliyunDriveConfig(): UseMutationResult<AliyunDriveConfig, Error, {configId: string; updates: UpdateConfigRequest}> {
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

export function useDeleteItems(): UseMutationResult<Array<{path: string; success: boolean; error?: string}>, Error, string[]> {
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

export function useAddToProject(): UseMutationResult<AddToProjectResult, Error, {projectId: string; filePaths: string[]}> {
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
