import { apiRequestHandler } from '@/utils/api/api-request-handler';
import type { 
  ASMRGenerationRequest, 
  Job, 
  JobProgress, 
  ASMRPreset 
} from '@titan/shared';

export class ASMRApiService {
  /**
   * Creates a new ASMR generation job.
   */
  static async createJob(payload: ASMRGenerationRequest): Promise<Job> {
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
  }

  /**
   * Creates multiple ASMR generation jobs in batch.
   */
  static async createBatchJobs(requests: ASMRGenerationRequest[]): Promise<Job[]> {
    const response = await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/create-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create batch ASMR jobs: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Fetches the progress for a specific job.
   */
  static async getJobProgress(jobId: string): Promise<JobProgress> {
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
  }

  /**
   * Fetches the list of all jobs for the current user.
   */
  static async listJobs(options?: {
    status?: string;
    projectId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    jobs: Job[];
    total: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.projectId) params.append('projectId', options.projectId);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await apiRequestHandler(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Fetches job details by ID.
   */
  static async getJobById(jobId: string): Promise<Job> {
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
  }

  /**
   * Retries a failed job.
   */
  static async retryJob(jobId: string): Promise<Job> {
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
  }

  /**
   * Fetches ASMR presets from backend.
   * TODO: This endpoint needs to be implemented in the backend.
   */
  static async getPresets(): Promise<{
    voicePresets: ASMRPreset[];
    soundscapePresets: ASMRPreset[];
    mixingPresets: ASMRPreset[];
  }> {
    const response = await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/asmr/presets`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ASMR presets: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Estimates the cost of an ASMR generation request.
   */
  static async estimateCost(payload: ASMRGenerationRequest): Promise<{
    voiceCost: number;
    soundscapeCost: number;
    totalCost: number;
    currency: string;
  }> {
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
  }

  /**
   * Validates AI services connection status.
   */
  static async validateServices(): Promise<{
    elevenlabs: boolean;
    elevenLabsSoundscape: boolean;
    ffmpeg: boolean;
    overall: boolean;
  }> {
    const response = await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/asmr/validate-services`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to validate services: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }
}