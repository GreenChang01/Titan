'use client';

import React from 'react';
import Link from 'next/link';
import {useQueryClient} from '@tanstack/react-query';
import {aiImageKeys} from '@/hooks/use-ai-images';

type AIImageLinkProps = {
	readonly href: string;
	readonly children: React.ReactNode;
	readonly filters?: Record<string, unknown>;
	readonly className?: string;
};

// Default filters object to prevent React re-render issues
const defaultFilters = {};

export function AIImageLink({href, children, filters = defaultFilters, className}: AIImageLinkProps) {
	const queryClient = useQueryClient();

	const handlePrefetch = () => {
		// Prefetch AI images data for the target route
		queryClient.prefetchInfiniteQuery({
			queryKey: aiImageKeys.infinite(filters),
			queryFn: async ({pageParam = 0}) => {
				// Use same mock data structure as the main hook
				if (process.env.NODE_ENV === 'development') {
					const cursor = pageParam;
					const limit = 10;

					return {
						items: Array.from({length: limit}, (_, index) => ({
							id: `route-prefetch-${cursor * limit + index}`,
							prompt: `Route prefetched AI image ${cursor * limit + index + 1}`,
							model: 'pollinations',
							imageUrl: `https://picsum.photos/400/300?random=${cursor * limit + index + 200}`,
							width: 400,
							height: 300,
							enhance: true,
							nologo: true,
							private: false,
							nofeed: false,
							createdAt: new Date().toISOString(),
							userId: 'mock-user',
						})),
						nextCursor: cursor < 4 ? cursor + 1 : null,
						hasMore: cursor < 4,
						totalCount: 50,
					};
				}

				// Production API call
				return fetch(`/api/ai/images?cursor=${pageParam}&limit=10`).then(async res => res.json());
			},
			initialPageParam: 0,
			getNextPageParam: (lastPage: {nextCursor: number | null}) => lastPage.nextCursor,
			// Only prefetch first page on route hover
			pages: 1,
		});

		console.log('🔗 Route prefetching triggered for:', href);
	};

	return (
		<Link
			href={href}
			className={className}
			onMouseEnter={handlePrefetch}
		>
			{children}
		</Link>
	);
}
