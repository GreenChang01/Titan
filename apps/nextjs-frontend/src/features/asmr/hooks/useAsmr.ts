'use client';

import {
  useQuery, useMutation, useQueryClient, type UseMutationOptions,
} from '@tanstack/react-query';
import {toast} from 'sonner';
import type {AsmrGenerationRequest, Job, JobProgress} from '@titan/shared';
import {
  asmrApi, type JobListParams, type JobListResponse, type CostEstimate, type ServiceStatus, type PresetsResponse,
} from '../api/asmr.api';
import {queryKeys, invalidateQueries} from '@/lib/react-query';
import {type ApiError} from '@/lib/api/client';

// Job list hook (simplest one to start migration)
export function useAsmrJobs(parameters?: JobListParams) {
  return useQuery({
    queryKey: queryKeys.asmr.jobs(parameters || {}),
    queryFn: async () => asmrApi.listJobs(parameters),
    staleTime: 30 * 1000, // 30 seconds for job list
  });
}

// Individual job detail hook
export function useAsmrJob(jobId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.asmr.job(jobId),
    queryFn: async () => asmrApi.getJobById(jobId),
    enabled: enabled && Boolean(jobId),
  });
}

// Job progress hook (for real-time monitoring) with intelligent completion handling
export function useAsmrJobProgress(
  jobId: string,
  options?: {
    enabled?: boolean;
    onJobComplete?: (job: Job) => void;
  },
) {
  const queryClient = useQueryClient();
  const enabled = options?.enabled !== false && Boolean(jobId);

  return useQuery({
    queryKey: queryKeys.asmr.jobProgress(jobId),
    queryFn: async () => asmrApi.getJobProgress(jobId),
    enabled,
    refetchInterval(query) {
      const {data} = query.state;
      // Auto-refresh for pending/processing jobs
      if (data?.status === 'pending' || data?.status === 'processing') {
        return 2000; // 2 seconds
      }

      return false; // Don't refresh for completed/failed jobs
    },
    onSuccess(progress) {
      const isFinished = progress.status === 'completed' || progress.status === 'failed';

      // If the job is done and the callback exists...
      if (isFinished && options?.onJobComplete) {
        // Use the queryClient to fetch the full job details
        // This ensures we pass the complete, canonical object to the callback
        queryClient.fetchQuery({
          queryKey: queryKeys.asmr.job(jobId),
          queryFn: async () => asmrApi.getJob(jobId),
        }).then(fullJob => {
          if (fullJob) {
            // Now call the callback with the complete data
            options.onJobComplete!(fullJob);

            // Optimization: We can also update the main job list cache
            // to reflect the final status, preventing a future refetch
            queryClient.setQueryData(
              queryKeys.asmr.jobs({}),
              (oldData: JobListResponse | undefined) => {
                if (!oldData) {
                  return oldData;
                }

                return {
                  ...oldData,
                  jobs: oldData.jobs.map(j => j.id === fullJob.id ? fullJob : j),
                };
              },
            );
          }
        }).catch(error => {
          console.error('Failed to fetch complete job details:', error);
          // Fallback: still call the callback but with limited data
          const fallbackJob: Job = {
            id: progress.jobId,
            status: progress.status,
            createdAt: new Date().toISOString(),
            requestPayload: {},
          };
          options.onJobComplete!(fallbackJob);
        });
      }
    },
  });
}

// ASMR presets hook
export function useAsmrPresets() {
  return useQuery({
    queryKey: queryKeys.asmr.presets(),
    queryFn: asmrApi.getPresets,
    staleTime: 10 * 60 * 1000, // 10 minutes - presets don't change often
  });
}

// Service status hook
export function useAsmrServiceStatus() {
  return useQuery({
    queryKey: queryKeys.asmr.serviceStatus(),
    queryFn: asmrApi.validateServices,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Create job mutation with enhanced error handling
type CreateJobOptions = Omit<UseMutationOptions<Job, ApiError, AsmrGenerationRequest>, 'mutationFn'>;

export function useCreateAsmrJob(options?: CreateJobOptions) {
  const queryClient = useQueryClient();

  return useMutation<Job, ApiError, AsmrGenerationRequest>({
    mutationFn: asmrApi.createJob,
    onSuccess(data, variables, context) {
      // Default success behavior: invalidate job list and show toast
      invalidateQueries.asmrJobs(queryClient);
      toast.success('ASMR音频生成任务已创建');

      // Allow component-level logic to run as well
      options?.onSuccess?.(data, variables, context);
    },
    onError(error, variables, context) {
      // Default error behavior: show a generic toast
      toast.error(error.message || 'ASMR任务创建失败');

      // Allow component-level logic to run as well
      options?.onError?.(error, variables, context);
    },
    // Spread the component-level options
    ...options,
  });
}

// Create batch jobs mutation
type CreateBatchJobsOptions = Omit<UseMutationOptions<Job[], ApiError, AsmrGenerationRequest[]>, 'mutationFn'>;

export function useCreateBatchAsmrJobs(options?: CreateBatchJobsOptions) {
  const queryClient = useQueryClient();

  return useMutation<Job[], ApiError, AsmrGenerationRequest[]>({
    mutationFn: asmrApi.createBatchJobs,
    onSuccess(data, variables, context) {
      invalidateQueries.asmrJobs(queryClient);
      toast.success(`成功创建 ${data.length} 个ASMR任务`);
      options?.onSuccess?.(data, variables, context);
    },
    onError(error, variables, context) {
      toast.error(error.message || '批量创建ASMR任务失败');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}

// Retry job mutation
type RetryJobOptions = Omit<UseMutationOptions<Job, ApiError, string>, 'mutationFn'>;

export function useRetryAsmrJob(options?: RetryJobOptions) {
  const queryClient = useQueryClient();

  return useMutation<Job, ApiError, string>({
    mutationFn: asmrApi.retryJob,
    onSuccess(data, variables, context) {
      // Invalidate the specific job and job list
      queryClient.setQueryData(queryKeys.asmr.job(variables), data);
      invalidateQueries.asmrJobs(queryClient);
      toast.success('任务重试已启动');
      options?.onSuccess?.(data, variables, context);
    },
    onError(error, variables, context) {
      toast.error(error.message || '任务重试失败');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}

// Cost estimation mutation (doesn't affect cache)
export function useEstimateAsmrCost() {
  return useMutation({
    mutationFn: asmrApi.estimateCost,
    // No need for cache invalidation for cost estimation
  });
}
