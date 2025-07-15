'use client';

import React, {useState, useEffect, type JSX} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {apiClient} from '@/lib/api-client';

// React Query configuration optimized for SSR hydration
const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				// Critical for SSR: prevent immediate refetch on client hydration
				// Data is considered fresh for 30 seconds after SSR hydration
				staleTime: 30 * 1000,
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

export function ReactQueryProvider({children}: {readonly children: React.ReactNode}): JSX.Element {
	// Use useState instead of useMemo to ensure single instance per component lifecycle
	const [queryClient] = useState(() => createQueryClient());
	
	// Connect API client with QueryClient for cache invalidation
	useEffect(() => {
		apiClient.setQueryClient(queryClient);
	}, [queryClient]);
	
	return (
		<QueryClientProvider client={queryClient}>
			<ReactQueryDevtools initialIsOpen={false}/> {/* This will only be available if NODE_ENV === 'development' */}
			{children}
		</QueryClientProvider>
	);
}
