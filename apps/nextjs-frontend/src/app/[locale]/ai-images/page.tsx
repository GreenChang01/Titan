import React from 'react';
import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query';
import {aiImageKeys, AIImagesPage} from '@/hooks/use-ai-images';
import {AIImagesClient} from './ai-images-client';

// Server-side fetch function
const fetchAIImagesServer = async (params: {cursor?: number; limit?: number} = {}): Promise<AIImagesPage> => {
	const {cursor = 0, limit = 10} = params;
	
	try {
		// In development or when API is not available, return mock data
		if (process.env.NODE_ENV === 'development') {
			// Generate mock data for development
			const mockImages = Array.from({length: limit}, (_, index) => ({
				id: `mock-${cursor * limit + index}`,
				prompt: `Mock AI generated image ${cursor * limit + index + 1}`,
				model: 'pollinations',
				imageUrl: `https://picsum.photos/400/300?random=${cursor * limit + index}`,
				width: 400,
				height: 300,
				enhance: true,
				nologo: true,
				private: false,
				nofeed: false,
				createdAt: new Date().toISOString(),
				userId: 'mock-user',
			}));

			return {
				items: mockImages,
				nextCursor: cursor < 4 ? cursor + 1 : null, // Mock 5 pages total
				hasMore: cursor < 4,
				totalCount: 50, // Mock total
			};
		}

		// In production, make actual API call
		const response = await fetch(`${process.env.API_BASE_URL}/api/ai/images?cursor=${cursor}&limit=${limit}`, {
			cache: 'no-store',
		});
		
		if (!response.ok) {
			throw new Error('Failed to fetch AI images');
		}

		const data = await response.json();
		
		// Transform if needed to match AIImagesPage format
		if (Array.isArray(data)) {
			return {
				items: data,
				nextCursor: null,
				hasMore: false,
				totalCount: data.length,
			};
		}

		return data;
	} catch (error) {
		console.error('SSR fetch error:', error);
		// Return empty data to prevent SSR crash
		return {
			items: [],
			nextCursor: null,
			hasMore: false,
			totalCount: 0,
		};
	}
};

// Server Component - handles SSR prefetching
export default async function AIImagesPage() {
	// Create a fresh QueryClient for this server request with SSR-optimized settings
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				// SSR optimization: prevent immediate refetch on hydration
				staleTime: 60 * 1000, // 1 minute (increased from 30s for better caching)
				gcTime: 10 * 60 * 1000, // 10 minutes
			},
		},
	});

	// Prefetch infinite query data for faster initial render
	await queryClient.prefetchInfiniteQuery({
		queryKey: aiImageKeys.infinite({}),
		queryFn: ({pageParam}) => fetchAIImagesServer({cursor: pageParam as number}),
		initialPageParam: 0,
		// Prefetch first 2 pages for better initial experience
		pages: 2,
	});

	// Dehydrate the query state to pass to client
	const dehydratedState = dehydrate(queryClient);

	return (
		<HydrationBoundary state={dehydratedState}>
			<AIImagesClient />
		</HydrationBoundary>
	);
}
