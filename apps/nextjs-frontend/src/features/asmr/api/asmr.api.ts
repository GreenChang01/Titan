import type {
	AsmrGenerationRequest, Job, JobProgress, AsmrPreset,
} from '@titan/shared';
import {apiClient} from '@/lib/api/client';

// Import mock service for development
import {mockASMRApiService} from '@/lib/services/asmr-api.mock';

// TODO: Switch to real implementation when backend is ready
const USE_MOCK_API = true;

// Job list response type
export type JobListResponse = {
	jobs: Job[];
	total: number;
	page: number;
	limit: number;
};

// Cost estimate response type
export type CostEstimate = {
	voiceCost: number;
	soundscapeCost: number;
	totalCost: number;
	currency: string;
};

// Service status response type
export type ServiceStatus = {
	elevenlabs: boolean;
	elevenLabsSoundscape: boolean;
	ffmpeg: boolean;
	overall: boolean;
};

// Presets response type
export type PresetsResponse = {
	voicePresets: AsmrPreset[];
	soundscapePresets: AsmrPreset[];
	mixingPresets: AsmrPreset[];
};

// Job list parameters
export type JobListParams = {
	status?: string;
	projectId?: string;
	page?: number;
	limit?: number;
};

export const asmrApi = {
	/**
	 * Creates a new ASMR generation job.
	 */
	async createJob(payload: AsmrGenerationRequest): Promise<Job> {
		if (USE_MOCK_API) {
			return mockASMRApiService.createJob(payload);
		}

		return apiClient.post<Job>('/asmr/jobs', payload);
	},

	/**
	 * Creates multiple ASMR generation jobs in batch.
	 */
	async createBatchJobs(requests: AsmrGenerationRequest[]): Promise<Job[]> {
		if (USE_MOCK_API) {
			return mockASMRApiService.createBatchJobs(requests);
		}

		return apiClient.post<Job[]>('/asmr/jobs/batch', {requests});
	},

	/**
	 * Fetches the progress for a specific job.
	 */
	async getJobProgress(jobId: string): Promise<JobProgress> {
		if (USE_MOCK_API) {
			return mockASMRApiService.getJobProgress(jobId);
		}

		return apiClient.get<JobProgress>(`/asmr/jobs/${jobId}/progress`);
	},

	/**
	 * Fetches the list of all jobs for the current user.
	 */
	async listJobs(parameters?: JobListParams): Promise<JobListResponse> {
		if (USE_MOCK_API) {
			return mockASMRApiService.listJobs(parameters);
		}

		const queryParameters: Record<string, string> = {};
		if (parameters?.status) {
			queryParameters.status = parameters.status;
		}

		if (parameters?.projectId) {
			queryParameters.projectId = parameters.projectId;
		}

		if (parameters?.page) {
			queryParameters.page = parameters.page.toString();
		}

		if (parameters?.limit) {
			queryParameters.limit = parameters.limit.toString();
		}

		return apiClient.get<JobListResponse>('/asmr/jobs', queryParameters);
	},

	/**
	 * Fetches job details by ID.
	 */
	async getJob(jobId: string): Promise<Job> {
		if (USE_MOCK_API) {
			return mockASMRApiService.getJobById(jobId);
		}

		return apiClient.get<Job>(`/asmr/jobs/${jobId}`);
	},

	/**
	 * Fetches job details by ID.
	 * @deprecated Use getJob instead
	 */
	async getJobById(jobId: string): Promise<Job> {
		return this.getJob(jobId);
	},

	/**
	 * Retries a failed job.
	 */
	async retryJob(jobId: string): Promise<Job> {
		if (USE_MOCK_API) {
			return mockASMRApiService.retryJob(jobId);
		}

		return apiClient.post<Job>(`/asmr/jobs/${jobId}/retry`);
	},

	/**
	 * Fetches ASMR presets from backend.
	 */
	async getPresets(): Promise<PresetsResponse> {
		if (USE_MOCK_API) {
			return mockASMRApiService.getPresets();
		}

		return apiClient.get<PresetsResponse>('/asmr/presets');
	},

	/**
	 * Estimates the cost of an ASMR generation request.
	 */
	async estimateCost(payload: AsmrGenerationRequest): Promise<CostEstimate> {
		if (USE_MOCK_API) {
			return mockASMRApiService.estimateCost(payload);
		}

		return apiClient.post<CostEstimate>('/asmr/estimate-cost', payload);
	},

	/**
	 * Validates AI services connection status.
	 */
	async validateServices(): Promise<ServiceStatus> {
		if (USE_MOCK_API) {
			return mockASMRApiService.validateServices();
		}

		return apiClient.get<ServiceStatus>('/asmr/validate-services');
	},
};
