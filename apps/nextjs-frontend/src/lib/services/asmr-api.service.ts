import type {ASMRGenerationRequest, Job, JobProgress, ASMRPreset} from '@titan/shared';

// Import mock service for development
import {mockASMRApiService} from './asmr-api.mock';
import {apiRequestHandler} from '@/utils/api/api-request-handler';

// TODO: Switch to real implementation when backend is ready
const USE_MOCK_API = true;

export const ASMRApiService = {
	/**
	 * Creates a new ASMR generation job.
	 */
	async createJob(payload: ASMRGenerationRequest): Promise<Job> {
		if (USE_MOCK_API) {
			return mockASMRApiService.createJob(payload);
		}

		const response = await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/create-single`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error(`Failed to create ASMR job: ${response.statusText}`);
		}

		const result = await response.json();
		return result.data; // Assuming backend returns { data: Job }
	},

	/**
	 * Creates multiple ASMR generation jobs in batch.
	 */
	async createBatchJobs(requests: ASMRGenerationRequest[]): Promise<Job[]> {
		if (USE_MOCK_API) {
			return mockASMRApiService.createBatchJobs(requests);
		}

		const response = await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/create-batch`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({requests}),
		});

		if (!response.ok) {
			throw new Error(`Failed to create batch ASMR jobs: ${response.statusText}`);
		}

		const result = await response.json();
		return result.data;
	},

	/**
	 * Fetches the progress for a specific job.
	 */
	async getJobProgress(jobId: string): Promise<JobProgress> {
		if (USE_MOCK_API) {
			return mockASMRApiService.getJobProgress(jobId);
		}

		if (!jobId) {
			throw new Error('A job ID is required to fetch progress.');
		}

		const response = await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}/progress`, {
			method: 'GET',
			credentials: 'include',
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch job progress: ${response.statusText}`);
		}

		const result = await response.json();
		return result.data;
	},

	/**
	 * Fetches the list of all jobs for the current user.
	 */
	async listJobs(options?: {status?: string; projectId?: string; page?: number; limit?: number}): Promise<{
		jobs: Job[];
		total: number;
		page: number;
		limit: number;
	}> {
		if (USE_MOCK_API) {
			return mockASMRApiService.listJobs(options);
		}

		const parameters = new URLSearchParams();
		if (options?.status) {
			parameters.append('status', options.status);
		}

		if (options?.projectId) {
			parameters.append('projectId', options.projectId);
		}

		if (options?.page) {
			parameters.append('page', options.page.toString());
		}

		if (options?.limit) {
			parameters.append('limit', options.limit.toString());
		}

		const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs${parameters.toString() ? `?${parameters.toString()}` : ''}`;

		const response = await apiRequestHandler(url, {
			method: 'GET',
			credentials: 'include',
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch jobs: ${response.statusText}`);
		}

		const result = await response.json();
		return result.data;
	},

	/**
	 * Fetches job details by ID.
	 */
	async getJobById(jobId: string): Promise<Job> {
		if (USE_MOCK_API) {
			return mockASMRApiService.getJobById(jobId);
		}

		if (!jobId) {
			throw new Error('A job ID is required.');
		}

		const response = await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}`, {
			method: 'GET',
			credentials: 'include',
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch job details: ${response.statusText}`);
		}

		const result = await response.json();
		return result.data;
	},

	/**
	 * Retries a failed job.
	 */
	async retryJob(jobId: string): Promise<Job> {
		if (USE_MOCK_API) {
			return mockASMRApiService.retryJob(jobId);
		}

		if (!jobId) {
			throw new Error('A job ID is required to retry.');
		}

		const response = await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}/retry`, {
			method: 'POST',
			credentials: 'include',
		});

		if (!response.ok) {
			throw new Error(`Failed to retry job: ${response.statusText}`);
		}

		const result = await response.json();
		return result.data;
	},

	/**
	 * Fetches ASMR presets from backend.
	 */
	async getPresets(): Promise<{
		voicePresets: ASMRPreset[];
		soundscapePresets: ASMRPreset[];
		mixingPresets: ASMRPreset[];
	}> {
		if (USE_MOCK_API) {
			return mockASMRApiService.getPresets();
		}

		const response = await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/asmr/presets`, {
			method: 'GET',
			credentials: 'include',
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch ASMR presets: ${response.statusText}`);
		}

		const result = await response.json();
		return result.data;
	},

	/**
	 * Estimates the cost of an ASMR generation request.
	 */
	async estimateCost(payload: ASMRGenerationRequest): Promise<{
		voiceCost: number;
		soundscapeCost: number;
		totalCost: number;
		currency: string;
	}> {
		if (USE_MOCK_API) {
			return mockASMRApiService.estimateCost(payload);
		}

		const response = await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/asmr/estimate-cost`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error(`Failed to estimate cost: ${response.statusText}`);
		}

		const result = await response.json();
		return result.data;
	},

	/**
	 * Validates AI services connection status.
	 */
	async validateServices(): Promise<{
		elevenlabs: boolean;
		elevenLabsSoundscape: boolean;
		ffmpeg: boolean;
		overall: boolean;
	}> {
		if (USE_MOCK_API) {
			return mockASMRApiService.validateServices();
		}

		const response = await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/asmr/validate-services`, {
			method: 'GET',
			credentials: 'include',
		});

		if (!response.ok) {
			throw new Error(`Failed to validate services: ${response.statusText}`);
		}

		const result = await response.json();
		return result.data;
	},
};
