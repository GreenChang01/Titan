'use client';

import React, {useRef, useEffect, useCallback} from 'react';
import {useVirtualizer} from '@tanstack/react-virtual';
import {useQueryClient} from '@tanstack/react-query';
import {useInfiniteAIImages, aiImageKeys} from '@/hooks/use-ai-images';
import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
	Loader2, Download, Eye, AlertCircle,
} from 'lucide-react';

type VirtualizedAIImagesProps = {
	readonly filters?: Record<string, unknown>;
	readonly className?: string;
};

// Default filters object to prevent React re-render issues
const defaultFilters = {};

export function VirtualizedAIImages({filters = defaultFilters, className}: VirtualizedAIImagesProps) {
	const queryClient = useQueryClient();
	const {
		data,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
		isError,
	} = useInfiniteAIImages(filters);

	const parentRef = useRef<HTMLDivElement>(null);

	// Get flattened images from our select function
	const allImages = data?.flatImages ?? [];
	const totalCount = data?.pages[0]?.totalCount ?? 0;

	// Prefetching tracking to prevent duplicate prefetches
	const prefetchedPagesRef = useRef(new Set<number>());

	// Hover prefetching strategy
	const handlePrefetch = useCallback((index: number) => {
		const prefetchThreshold = 5; // Prefetch when hovering near the end
		if (index >= allImages.length - prefetchThreshold && hasNextPage && data) {
			const nextPageParam = data.pages.at(-1)?.nextCursor;
			if (nextPageParam !== null && nextPageParam !== undefined && !prefetchedPagesRef.current.has(nextPageParam)) {
				console.log(`🚀 Prefetching next page with cursor: ${nextPageParam}`);
				prefetchedPagesRef.current.add(nextPageParam);

				queryClient.prefetchInfiniteQuery({
					queryKey: aiImageKeys.infinite(filters),
					async queryFn({pageParam = 0}) {
						// Use same API call as the main hook
						if (process.env.NODE_ENV === 'development') {
							return {
								items: Array.from({length: 10}, (_, i) => ({
									id: `prefetch-${nextPageParam}-${i}`,
									prompt: `Prefetched AI image ${i + 1}`,
									model: 'pollinations',
									imageUrl: `https://picsum.photos/400/300?random=${nextPageParam * 10 + i + 100}`,
									width: 400,
									height: 300,
									enhance: true,
									nologo: true,
									private: false,
									nofeed: false,
									createdAt: new Date().toISOString(),
									userId: 'mock-user',
								})),
								nextCursor: nextPageParam < 4 ? nextPageParam + 1 : null,
								hasMore: nextPageParam < 4,
								totalCount: 50,
							};
						}

						// Production API call would go here
						return fetch(`/api/ai/images?cursor=${pageParam}&limit=10`).then(async res => res.json());
					},
					initialPageParam: 0,
					getNextPageParam: (lastPage: {nextCursor: number | undefined}) => lastPage.nextCursor,
					pages: data.pages.length + 1, // Ensure we have one more page cached
				});
			}
		}
	}, [allImages.length, hasNextPage, data, queryClient, filters]);

	const rowVirtualizer = useVirtualizer({
		count: hasNextPage ? allImages.length + 1 : allImages.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 380, // Estimate height: image (300px) + content (80px)
		overscan: 5,
	});

	const virtualItems = rowVirtualizer.getVirtualItems();

	// Auto-fetch next page when scrolling near the end
	useEffect(() => {
		const lastItem = virtualItems.at(-1);

		if (
			lastItem
			&& lastItem.index >= allImages.length - 1
			&& hasNextPage
			&& !isFetchingNextPage
		) {
			fetchNextPage();
		}
	}, [
		hasNextPage,
		fetchNextPage,
		allImages.length,
		isFetchingNextPage,
		virtualItems,
	]);

	if (status === 'pending') {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='w-8 h-8 animate-spin'/>
				<span className='ml-2'>Loading AI images...</span>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='flex flex-col items-center justify-center h-64 space-y-4'>
				<AlertCircle className='w-12 h-12 text-red-500'/>
				<p className='text-red-600'>Error loading images: {error?.message}</p>
				<Button
					variant='outline'
					onClick={() => {
						globalThis.location.reload();
					}}
				>
					Retry
				</Button>
			</div>
		);
	}

	const handleDownload = (imageUrl: string, prompt: string) => {
		const link = document.createElement('a');
		link.href = imageUrl;
		link.download = `ai-image-${prompt.slice(0, 30).replaceAll(/\s+/g, '-')}.jpg`;
		document.body.append(link);
		link.click();
		link.remove();
	};

	return (
		<div className={className}>
			{/* Header with stats */}
			<div className='mb-6 p-4 bg-muted rounded-lg'>
				<div className='flex items-center justify-between'>
					<div>
						<h3 className='text-lg font-semibold'>AI Generated Images</h3>
						<p className='text-sm text-muted-foreground'>
							Loaded {allImages.length} of {totalCount} images
						</p>
					</div>
					<div className='flex items-center space-x-2'>
						{hasNextPage ? <Badge variant='secondary'>
							{isFetchingNextPage ? 'Loading more...' : 'Scroll for more'}
                     </Badge> : null}
					</div>
				</div>
			</div>

			{/* Virtualized list container */}
			<div
				ref={parentRef}
				className='h-[70vh] w-full overflow-auto border rounded-lg'
				style={{
					contain: 'strict',
				}}
			>
				<div
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						width: '100%',
						position: 'relative',
					}}
				>
					{virtualItems.map(virtualItem => {
						const isLoaderRow = virtualItem.index > allImages.length - 1;
						const image = allImages[virtualItem.index];

						return (
							<div
								key={virtualItem.key}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									height: `${virtualItem.size}px`,
									transform: `translateY(${virtualItem.start}px)`,
								}}
								className='px-4 py-2'
								onMouseEnter={() => {
									handlePrefetch(virtualItem.index);
								}}
							>
								{isLoaderRow ? (
									<div className='flex justify-center items-center h-full'>
										{hasNextPage ? (
											<div className='flex items-center space-x-2'>
												<Loader2 className='h-6 w-6 animate-spin'/>
												<span>Loading more images...</span>
											</div>
										) : (
											<div className='text-center p-8'>
												<p className='text-muted-foreground'>
													🎉 You've reached the end! No more images to load.
												</p>
											</div>
										)}
									</div>
								) : image ? (
									<Card className='h-full'>
										<CardContent className='p-0 h-full flex flex-col'>
											{/* Image container */}
											<div className='relative flex-1 bg-gray-100 rounded-t-lg overflow-hidden'>
												<img
													src={image.imageUrl}
													alt={image.prompt}
													className='w-full h-full object-cover'
													loading='lazy'
													onError={e => {
														const target = e.target as HTMLImageElement;
														target.src = '/placeholder-image.png'; // Fallback image
													}}
												/>
												{/* Overlay with actions */}
												<div className='absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100'>
													<div className='flex space-x-2'>
														<Button
															variant='secondary'
															size='sm'
															onClick={() => {
																window.open(image.imageUrl, '_blank');
															}}
														>
															<Eye className='w-4 h-4'/>
														</Button>
														<Button
															variant='secondary'
															size='sm'
															onClick={() => {
																handleDownload(image.imageUrl, image.prompt);
															}}
														>
															<Download className='w-4 h-4'/>
														</Button>
													</div>
												</div>
											</div>

											{/* Content section */}
											<div className='p-4 space-y-2'>
												<p className='text-sm line-clamp-2 text-foreground'>
													{image.prompt}
												</p>
												<div className='flex items-center justify-between text-xs text-muted-foreground'>
													<Badge variant='outline' className='text-xs'>
														{image.model || 'AI Generated'}
													</Badge>
													<span>
														{image.width} × {image.height}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								) : null}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

