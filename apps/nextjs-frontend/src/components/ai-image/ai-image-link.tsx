'use client';

import React from 'react';
import Link from 'next/link';
import {useQueryClient} from '@tanstack/react-query';
import {aiImageKeys} from '@/hooks/use-ai-images';

interface AIImageLinkProps {
	href: string;
	children: React.ReactNode;
	filters?: Record<string, unknown>;
	className?: string;
}

export function AIImageLink({href, children, filters = {}, className}: AIImageLinkProps) {
	const queryClient = useQueryClient();

	const handlePrefetch = () => {
		// Prefetch AI images data for the target route
		queryClient.prefetchInfiniteQuery({
			queryKey: aiImageKeys.infinite(filters),
			queryFn: async ({pageParam}) => {
				// Use same mock data structure as the main hook
				if (process.env.NODE_ENV === 'development') {
					const cursor = pageParam as number;
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
				return fetch(`/api/ai/images?cursor=${pageParam}&limit=10`).then(res => res.json());
			},
			initialPageParam: 0,
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