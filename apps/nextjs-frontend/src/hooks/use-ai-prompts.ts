import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from '@/hooks/use-toast';

export type AIPrompt = {
	id: string;
	title: string;
	content: string;
	category: string;
	tags: string[];
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
	userId: string;
};

export type CreateAIPromptRequest = {
	title: string;
	content: string;
	category: string;
	tags?: string[];
	isPublic?: boolean;
};

export type UpdateAIPromptRequest = {
	title?: string;
	content?: string;
	category?: string;
	tags?: string[];
	isPublic?: boolean;
};

export type AIPromptFilters = {
	category?: string;
	tags?: string[];
	isPublic?: boolean;
	search?: string;
};

// Query keys
const aiPromptKeys = {
	all: ['ai-prompts'] as const,
	lists: () => [...aiPromptKeys.all, 'list'] as const,
	list: (filters: AIPromptFilters) => [...aiPromptKeys.lists(), filters] as const,
	details: () => [...aiPromptKeys.all, 'detail'] as const,
	detail: (id: string) => [...aiPromptKeys.details(), id] as const,
	categories: () => [...aiPromptKeys.all, 'categories'] as const,
};

// API functions
const aiPromptApi = {
	async getPrompts(filters: AIPromptFilters = {}): Promise<AIPrompt[]> {
		const searchParams = new URLSearchParams();

		if (filters.category) {
			searchParams.append('category', filters.category);
		}

		if (filters.isPublic !== undefined) {
			searchParams.append('isPublic', String(filters.isPublic));
		}

		if (filters.search) {
			searchParams.append('search', filters.search);
		}

		if (filters.tags?.length) {
			for (const tag of filters.tags) {
				searchParams.append('tags', tag);
			}
		}

		const response = await fetch(`/api/ai/prompts?${searchParams.toString()}`);

		if (!response.ok) {
			throw new Error('Failed to fetch prompts');
		}

		return response.json();
	},

	async getPrompt(id: string): Promise<AIPrompt> {
		const response = await fetch(`/api/ai/prompts/${id}`);

		if (!response.ok) {
			throw new Error('Failed to fetch prompt');
		}

		return response.json();
	},

	async createPrompt(data: CreateAIPromptRequest): Promise<AIPrompt> {
		const response = await fetch('/api/ai/prompts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to create prompt');
		}

		return response.json();
	},

	async updatePrompt(id: string, data: UpdateAIPromptRequest): Promise<AIPrompt> {
		const response = await fetch(`/api/ai/prompts/${id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to update prompt');
		}

		return response.json();
	},

	async deletePrompt(id: string): Promise<void> {
		const response = await fetch(`/api/ai/prompts/${id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			throw new Error('Failed to delete prompt');
		}
	},

	async getCategories(): Promise<string[]> {
		const response = await fetch('/api/ai/prompts/categories');

		if (!response.ok) {
			throw new Error('Failed to fetch categories');
		}

		return response.json();
	},

	async duplicatePrompt(id: string): Promise<AIPrompt> {
		const response = await fetch(`/api/ai/prompts/${id}/duplicate`, {
			method: 'POST',
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to duplicate prompt');
		}

		return response.json();
	},
};

// React Query hooks
export function useAIPrompts(filters: AIPromptFilters = {}) {
	return useQuery({
		queryKey: aiPromptKeys.list(filters),
		queryFn: async () => aiPromptApi.getPrompts(filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useAIPrompt(id: string) {
	return useQuery({
		queryKey: aiPromptKeys.detail(id),
		queryFn: async () => aiPromptApi.getPrompt(id),
		enabled: Boolean(id),
	});
}

export function useAIPromptCategories() {
	return useQuery({
		queryKey: aiPromptKeys.categories(),
		queryFn: aiPromptApi.getCategories,
		staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
	});
}

export function useCreateAIPrompt() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: aiPromptApi.createPrompt,
		onSuccess(newPrompt) {
			// Invalidate all prompt lists to ensure new prompt appears
			queryClient.invalidateQueries({queryKey: aiPromptKeys.lists()});

			// Optionally add the new prompt to cache
			queryClient.setQueryData(aiPromptKeys.detail(newPrompt.id), newPrompt);

			toast({
				title: 'Success',
				description: 'Prompt created successfully!',
			});
		},
		onError(error: Error) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to create prompt',
				variant: 'destructive',
			});
		},
	});
}

export function useUpdateAIPrompt() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({id, data}: {id: string; data: UpdateAIPromptRequest}) =>
			aiPromptApi.updatePrompt(id, data),
		onSuccess(updatedPrompt) {
			// Update the specific prompt in the cache
			queryClient.setQueryData(aiPromptKeys.detail(updatedPrompt.id), updatedPrompt);

			// Update the prompt in all relevant lists
			queryClient.invalidateQueries({queryKey: aiPromptKeys.lists()});

			toast({
				title: 'Success',
				description: 'Prompt updated successfully!',
			});
		},
		onError(error: Error) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to update prompt',
				variant: 'destructive',
			});
		},
	});
}

export function useDeleteAIPrompt() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: aiPromptApi.deletePrompt,
		async onMutate(id) {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({queryKey: aiPromptKeys.lists()});

			// Get current filters from active queries
			const queryCache = queryClient.getQueryCache();
			const activeQueries = queryCache.getAll().filter(query =>
				query.queryKey[0] === 'ai-prompts' && query.queryKey[1] === 'list');

			const previousData: Record<string, AIPrompt[]> = {};

			// Optimistically update all relevant lists
			for (const query of activeQueries) {
				const queryKey = query.queryKey as unknown[];
				const currentData = queryClient.getQueryData(queryKey);

				if (currentData) {
					previousData[JSON.stringify(queryKey)] = currentData;
					queryClient.setQueryData(queryKey, currentData.filter(prompt => prompt.id !== id));
				}
			}

			return {previousData};
		},
		onError(error: Error, variables, context) {
			// Roll back all optimistic updates
			if (context?.previousData) {
				for (const [keyStr, data] of Object.entries(context.previousData)) {
					const queryKey = JSON.parse(keyStr);
					queryClient.setQueryData(queryKey, data);
				}
			}

			toast({
				title: 'Error',
				description: error.message || 'Failed to delete prompt',
				variant: 'destructive',
			});
		},
		onSettled() {
			// Always refetch after error or success
			queryClient.invalidateQueries({queryKey: aiPromptKeys.lists()});
		},
		onSuccess() {
			toast({
				title: 'Success',
				description: 'Prompt deleted successfully!',
			});
		},
	});
}

export function useDuplicateAIPrompt() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: aiPromptApi.duplicatePrompt,
		onSuccess(duplicatedPrompt) {
			// Invalidate all prompt lists to show the new duplicate
			queryClient.invalidateQueries({queryKey: aiPromptKeys.lists()});

			// Add the duplicated prompt to cache
			queryClient.setQueryData(aiPromptKeys.detail(duplicatedPrompt.id), duplicatedPrompt);

			toast({
				title: 'Success',
				description: 'Prompt duplicated successfully!',
			});
		},
		onError(error: Error) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to duplicate prompt',
				variant: 'destructive',
			});
		},
	});
}

// Export query keys for external cache management
export {aiPromptKeys};
