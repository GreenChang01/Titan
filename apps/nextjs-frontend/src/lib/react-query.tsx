'use client';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {useState} from 'react';

// React Query configuration
const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				// Stale time - data is considered fresh for 5 minutes
				staleTime: 5 * 60 * 1000,
				// Cache time - data stays in cache for 10 minutes
				gcTime: 10 * 60 * 1000,
				// Retry failed requests 3 times
				retry: 3,
				// Retry delay with exponential backoff
				retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30_000),
				// Refetch on window focus in production
				refetchOnWindowFocus: process.env.NODE_ENV === 'production',
				// Refetch on reconnect
				refetchOnReconnect: true,
				// Don't refetch on mount if data exists and is not stale
				refetchOnMount: false,
			},
			mutations: {
				// Retry failed mutations once
				retry: 1,
				// Retry delay for mutations
				retryDelay: 1000,
			},
		},
	});

export function ReactQueryProvider({children}: {children: React.ReactNode}) {
	// Create query client on component mount to avoid SSR mismatch
	const [queryClient] = useState(() => createQueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	);
}

// Query key factory for consistent key management
export const queryKeys = {
	// Auth keys
	auth: {
		profile: ['auth', 'profile'] as const,
		user: (userId: string) => ['auth', 'user', userId] as const,
	},

	// Project keys
	projects: {
		all: ['projects'] as const,
		lists: () => [...queryKeys.projects.all, 'list'] as const,
		list: (parameters: Record<string, any>) => [...queryKeys.projects.lists(), parameters] as const,
		details: () => [...queryKeys.projects.all, 'detail'] as const,
		detail: (id: string) => [...queryKeys.projects.details(), id] as const,
		materials: (id: string) => [...queryKeys.projects.detail(id), 'materials'] as const,
		activities: (id: string) => [...queryKeys.projects.detail(id), 'activities'] as const,
		stats: () => [...queryKeys.projects.all, 'stats'] as const,
		recent: () => [...queryKeys.projects.all, 'recent'] as const,
		search: (query: string) => [...queryKeys.projects.all, 'search', query] as const,
	},

	// Aliyun Drive keys
	aliyunDrive: {
		all: ['aliyun-drive'] as const,
		configs: () => [...queryKeys.aliyunDrive.all, 'configs'] as const,
		config: (id: string) => [...queryKeys.aliyunDrive.configs(), id] as const,
		files: () => [...queryKeys.aliyunDrive.all, 'files'] as const,
		fileList: (parameters: Record<string, any>) => [...queryKeys.aliyunDrive.files(), 'list', parameters] as const,
		fileInfo: (path: string) => [...queryKeys.aliyunDrive.files(), 'info', path] as const,
		stats: () => [...queryKeys.aliyunDrive.all, 'stats'] as const,
		search: (query: string, options?: Record<string, any>) =>
			[...queryKeys.aliyunDrive.files(), 'search', query, options] as const,
	},

	// ASMR keys (if needed for integration)
	asmr: {
		all: ['asmr'] as const,
		jobs: () => [...queryKeys.asmr.all, 'jobs'] as const,
		job: (id: string) => [...queryKeys.asmr.jobs(), id] as const,
		presets: () => [...queryKeys.asmr.all, 'presets'] as const,
	},
} as const;

// Utility function to invalidate related queries
export const invalidateQueries = {
	projects(queryClient: QueryClient) {
		queryClient.invalidateQueries({queryKey: queryKeys.projects.all});
	},

	projectDetail(queryClient: QueryClient, projectId: string) {
		queryClient.invalidateQueries({queryKey: queryKeys.projects.detail(projectId)});
		queryClient.invalidateQueries({queryKey: queryKeys.projects.stats()});
		queryClient.invalidateQueries({queryKey: queryKeys.projects.recent()});
	},

	aliyunDrive(queryClient: QueryClient) {
		queryClient.invalidateQueries({queryKey: queryKeys.aliyunDrive.all});
	},

	aliyunDriveFiles(queryClient: QueryClient, path?: string) {
		if (path) {
			queryClient.invalidateQueries({
				queryKey: queryKeys.aliyunDrive.files(),
				predicate(query) {
					const queryKey = query.queryKey as any[];
					return queryKey.some((key: any) => typeof key === 'object' && key?.path?.startsWith(path));
				},
			});
		} else {
			queryClient.invalidateQueries({queryKey: queryKeys.aliyunDrive.files()});
		}
	},
};
