import {
	useMutation, useQuery, useQueryClient, useInfiniteQuery,
} from '@tanstack/react-query';
import {useToast} from '@/hooks/use-toast/use-toast.hook';
import {apiClient} from '@/lib/api-client';

export type AIImageRequest = {
	prompt: string;
	model?: string;
	width?: number;
	height?: number;
	enhance?: boolean;
	nologo?: boolean;
	private?: boolean;
	nofeed?: boolean;
};

export type AIImage = {
	id: string;
	prompt: string;
	model: string;
	imageUrl: string;
	width: number;
	height: number;
	enhance: boolean;
	nologo: boolean;
	private: boolean;
	nofeed: boolean;
	createdAt: string;
	userId: string;
};

export type GenerateImageResponse = {
	id: string;
	imageUrl: string;
	message: string;
};

export type AIImagesPage = {
	items: AIImage[];
	nextCursor: number | undefined;
	hasMore: boolean;
	totalCount: number;
};

export type PaginationParams = {
	cursor?: number;
	limit?: number;
};

// Query keys
const aiImageKeys = {
	all: ['ai-images'] as const,
	lists: () => [...aiImageKeys.all, 'list'] as const,
	list: (filters: Record<string, unknown>) => [...aiImageKeys.lists(), filters] as const,
	details: () => [...aiImageKeys.all, 'detail'] as const,
	detail: (id: string) => [...aiImageKeys.details(), id] as const,
	// New: Infinite query keys
	infinite: (filters: Record<string, unknown> = {}) => [...aiImageKeys.all, 'infinite', filters] as const,
};

// API functions using centralized API client
const aiImageApi = {
	async generateImage(data: AIImageRequest): Promise<GenerateImageResponse> {
		const response = await apiClient.post<GenerateImageResponse>('/ai/images/generate', data);
		return response.data;
	},

	async getImages(): Promise<AIImage[]> {
		const response = await apiClient.get<AIImage[]>('/ai/images');
		return response.data;
	},

	async getImagesPaginated(params: PaginationParams = {}): Promise<AIImagesPage> {
		const {cursor = 0, limit = 10} = params;
		const queryParams = {
			cursor: cursor.toString(),
			limit: limit.toString(),
		};

		const response = await apiClient.get<AIImagesPage>('/ai/images', queryParams);

		// Transform the response to match our AIImagesPage format if needed
		if (Array.isArray(response.data)) {
			// Mock pagination for existing API that returns array
			const itemsPerPage = limit;
			const startIndex = cursor * itemsPerPage;
			const endIndex = startIndex + itemsPerPage;
			const paginatedItems = response.data.slice(startIndex, endIndex);

			return {
				items: paginatedItems,
				nextCursor: endIndex < response.data.length ? cursor + 1 : null,
				hasMore: endIndex < response.data.length,
				totalCount: response.data.length,
			};
		}

		// If API already returns paginated format
		return response.data;
	},

	async getImage(id: string): Promise<AIImage> {
		const response = await apiClient.get<AIImage>(`/ai/images/${id}`);
		return response.data;
	},

	async deleteImage(id: string): Promise<void> {
		await apiClient.delete(`/ai/images/${id}`);
	},

	async updateImage(id: string, data: Partial<AIImageRequest>): Promise<AIImage> {
		const response = await apiClient.patch<AIImage>(`/ai/images/${id}`, data);
		return response.data;
	},
};

// React Query hooks
export function useAIImages() {
	return useQuery({
		queryKey: aiImageKeys.lists(),
		queryFn: aiImageApi.getImages,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useInfiniteAIImages(filters: Record<string, unknown> = {}) {
	return useInfiniteQuery({
		queryKey: aiImageKeys.infinite(filters),
		queryFn: async ({pageParam}) => aiImageApi.getImagesPaginated({cursor: pageParam}),
		initialPageParam: 0,
		getNextPageParam(lastPage: AIImagesPage) {
			// Return null (not undefined) to signal no more pages - important for SSR serialization
			return lastPage.nextCursor;
		},
		// Enhanced caching strategy for better prefetching performance
		staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
		gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
		// Enable background refetch when window regains focus
		refetchOnWindowFocus: true,
		// Optional: flatten pages for easier consumption
		select: data => ({
			...data,
			flatImages: data.pages.flatMap(page => page.items),
		}),
	});
}

export function useAIImage(id: string) {
	return useQuery({
		queryKey: aiImageKeys.detail(id),
		queryFn: async () => aiImageApi.getImage(id),
		enabled: Boolean(id),
	});
}

export function useGenerateAIImage() {
	const queryClient = useQueryClient();
	const {showToast} = useToast();

	return useMutation({
		mutationFn: aiImageApi.generateImage,
		onSuccess(data) {
			// Invalidate and refetch images list
			queryClient.invalidateQueries({queryKey: aiImageKeys.lists()});

			showToast({
				severity: 'success',
				summary: 'Success',
				detail: 'Image generated successfully!',
			});
		},
		onError(error: Error) {
			showToast({
				severity: 'error',
				summary: 'Error',
				detail: error.message || 'Failed to generate image',
			});
		},
	});
}

export function useDeleteAIImage() {
	const queryClient = useQueryClient();
	const {showToast} = useToast();

	return useMutation({
		mutationFn: aiImageApi.deleteImage,
		async onMutate(id) {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({queryKey: aiImageKeys.lists()});

			// Snapshot the previous value
			const previousImages = queryClient.getQueryData(aiImageKeys.lists());

			// Optimistically update to the new value
			queryClient.setQueryData(aiImageKeys.lists(), (old: AIImage[] | undefined) => old?.filter(image => image.id !== id) ?? []);

			// Return a context object with the snapshotted value
			return {previousImages};
		},
		onError(error: Error, variables, context) {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousImages) {
				queryClient.setQueryData(aiImageKeys.lists(), context.previousImages);
			}

			showToast({
				severity: 'error',
				summary: 'Error',
				detail: error.message || 'Failed to delete image',
			});
		},
		onSettled() {
			// Always refetch after error or success
			queryClient.invalidateQueries({queryKey: aiImageKeys.lists()});
		},
		onSuccess() {
			showToast({
				severity: 'success',
				summary: 'Success',
				detail: 'Image deleted successfully!',
			});
		},
	});
}

export function useUpdateAIImage() {
	const queryClient = useQueryClient();
	const {showToast} = useToast();

	return useMutation({
		mutationFn: async ({id, data}: {id: string; data: Partial<AIImageRequest>}) =>
			aiImageApi.updateImage(id, data),
		onSuccess(updatedImage) {
			// Update the specific image in the cache
			queryClient.setQueryData(aiImageKeys.detail(updatedImage.id), updatedImage);

			// Update the image in the list
			queryClient.setQueryData(aiImageKeys.lists(), (old: AIImage[] | undefined) => old?.map(image =>
				image.id === updatedImage.id ? updatedImage : image) ?? []);

			showToast({
				severity: 'success',
				summary: 'Success',
				detail: 'Image updated successfully!',
			});
		},
		onError(error: Error) {
			showToast({
				severity: 'error',
				summary: 'Error',
				detail: error.message || 'Failed to update image',
			});
		},
	});
}

// Export query keys for external cache management
export {aiImageKeys};
