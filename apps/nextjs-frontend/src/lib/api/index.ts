import {apiClient} from './client';

// Re-export all API types for convenience
export type {AuthResponse, User, LoginRequest, RegisterRequest} from './auth';

export type {
	Project,
	ProjectMaterial,
	ProjectActivity,
	CreateProjectRequest,
	UpdateProjectRequest,
	ProjectListResponse,
	ProjectStats,
} from './projects';

export type {
	AliyunDriveConfig,
	DriveFile,
	DirectoryContent,
	CreateConfigRequest,
	UploadFileRequest,
	ConnectionTestResult,
	DriveStats,
} from './aliyun-drive';

// Re-export API services
export {authApi} from './auth';
export {projectsApi} from './projects';
export {aliyunDriveApi} from './aliyun-drive';

// Re-export client and error types
export {apiClient, ApiError} from './client';
export type {ApiResponse} from './client';
