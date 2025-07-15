import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export interface AIImageRequest {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  enhance?: boolean;
  nologo?: boolean;
  private?: boolean;
  nofeed?: boolean;
}

export interface AIImage {
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
}

export interface GenerateImageResponse {
  id: string;
  imageUrl: string;
  message: string;
}

// Query keys
const aiImageKeys = {
  all: ['ai-images'] as const,
  lists: () => [...aiImageKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...aiImageKeys.lists(), filters] as const,
  details: () => [...aiImageKeys.all, 'detail'] as const,
  detail: (id: string) => [...aiImageKeys.details(), id] as const,
};

// API functions
const aiImageApi = {
  async generateImage(data: AIImageRequest): Promise<GenerateImageResponse> {
    const response = await fetch('/api/ai/images/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate image');
    }

    return response.json();
  },

  async getImages(): Promise<AIImage[]> {
    const response = await fetch('/api/ai/images');
    
    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }

    return response.json();
  },

  async getImage(id: string): Promise<AIImage> {
    const response = await fetch(`/api/ai/images/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    return response.json();
  },

  async deleteImage(id: string): Promise<void> {
    const response = await fetch(`/api/ai/images/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }
  },

  async updateImage(id: string, data: Partial<AIImageRequest>): Promise<AIImage> {
    const response = await fetch(`/api/ai/images/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update image');
    }

    return response.json();
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

export function useAIImage(id: string) {
  return useQuery({
    queryKey: aiImageKeys.detail(id),
    queryFn: () => aiImageApi.getImage(id),
    enabled: !!id,
  });
}

export function useGenerateAIImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiImageApi.generateImage,
    onSuccess: (data) => {
      // Invalidate and refetch images list
      queryClient.invalidateQueries({ queryKey: aiImageKeys.lists() });
      
      toast({
        title: 'Success',
        description: 'Image generated successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate image',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteAIImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiImageApi.deleteImage,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: aiImageKeys.lists() });

      // Snapshot the previous value
      const previousImages = queryClient.getQueryData(aiImageKeys.lists());

      // Optimistically update to the new value
      queryClient.setQueryData(aiImageKeys.lists(), (old: AIImage[] | undefined) => {
        return old?.filter(image => image.id !== id) ?? [];
      });

      // Return a context object with the snapshotted value
      return { previousImages };
    },
    onError: (error: Error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousImages) {
        queryClient.setQueryData(aiImageKeys.lists(), context.previousImages);
      }

      toast({
        title: 'Error',
        description: error.message || 'Failed to delete image',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: aiImageKeys.lists() });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Image deleted successfully!',
      });
    },
  });
}

export function useUpdateAIImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AIImageRequest> }) =>
      aiImageApi.updateImage(id, data),
    onSuccess: (updatedImage) => {
      // Update the specific image in the cache
      queryClient.setQueryData(aiImageKeys.detail(updatedImage.id), updatedImage);

      // Update the image in the list
      queryClient.setQueryData(aiImageKeys.lists(), (old: AIImage[] | undefined) => {
        return old?.map(image => 
          image.id === updatedImage.id ? updatedImage : image
        ) ?? [];
      });

      toast({
        title: 'Success',
        description: 'Image updated successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update image',
        variant: 'destructive',
      });
    },
  });
}

// Export query keys for external cache management
export { aiImageKeys };