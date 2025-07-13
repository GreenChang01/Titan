import {apiClient} from './client';

// Project types
export type Project = {
  id: string;
  name: string;
  description?: string;
  color: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  materialCount: number;
  isActive: boolean;
};

export type CreateProjectRequest = {
  name: string;
  description?: string;
  color: string;
};

export type UpdateProjectRequest = {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
};

export type ProjectMaterial = {
  id: string;
  projectId: string;
  assetId: string;
  asset: {
    id: string;
    filename: string;
    path: string;
    type: 'image' | 'video' | 'audio' | 'text';
    size: number;
    mimeType: string;
    tags: string[];
    createdAt: string;
  };
  addedAt: string;
};

export type ProjectActivity = {
  id: string;
  projectId: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  action: 'created' | 'updated' | 'material_added' | 'material_removed';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
};

export type ProjectListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
};

export type ProjectListResponse = {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AddMaterialRequest = {
  assetIds: string[];
};

export type ProjectStats = {
  totalProjects: number;
  activeProjects: number;
  totalMaterials: number;
  recentActivity: number;
};

// Projects API service
export const projectsApi = {
  // Get projects list
  async getProjects(parameters?: ProjectListParams): Promise<ProjectListResponse> {
    const queryParameters: Record<string, string> = {};

    if (parameters) {
      if (parameters.page) {
        queryParameters.page = parameters.page.toString();
      }

      if (parameters.limit) {
        queryParameters.limit = parameters.limit.toString();
      }

      if (parameters.search) {
        queryParameters.search = parameters.search;
      }

      if (parameters.sortBy) {
        queryParameters.sortBy = parameters.sortBy;
      }

      if (parameters.sortOrder) {
        queryParameters.sortOrder = parameters.sortOrder;
      }

      if (parameters.isActive !== undefined) {
        queryParameters.isActive = parameters.isActive.toString();
      }
    }

    return apiClient.get<ProjectListResponse>('/projects', queryParameters);
  },

  // Get project by ID
  async getProject(projectId: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${projectId}`);
  },

  // Create new project
  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    return apiClient.post<Project>('/projects', projectData);
  },

  // Update project
  async updateProject(projectId: string, updates: UpdateProjectRequest): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${projectId}`, updates);
  },

  // Delete project
  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}`);
  },

  // Get project materials
  async getProjectMaterials(projectId: string): Promise<ProjectMaterial[]> {
    return apiClient.get<ProjectMaterial[]>(`/projects/${projectId}/materials`);
  },

  // Add materials to project
  async addMaterials(projectId: string, data: AddMaterialRequest): Promise<ProjectMaterial[]> {
    return apiClient.post<ProjectMaterial[]>(`/projects/${projectId}/materials`, data);
  },

  // Remove material from project
  async removeMaterial(projectId: string, materialId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/materials/${materialId}`);
  },

  // Bulk remove materials from project
  async removeMaterials(projectId: string, materialIds: string[]): Promise<void> {
    await apiClient.post(`/projects/${projectId}/materials/remove`, {
      materialIds,
    });
  },

  // Get project activities
  async getProjectActivities(
    projectId: string,
    parameters?: {
      page?: number;
      limit?: number;
    },
  ): Promise<{
      activities: ProjectActivity[];
      total: number;
      page: number;
      limit: number;
    }> {
    const queryParameters: Record<string, string> = {};

    if (parameters?.page) {
      queryParameters.page = parameters.page.toString();
    }

    if (parameters?.limit) {
      queryParameters.limit = parameters.limit.toString();
    }

    return apiClient.get(`/projects/${projectId}/activities`, queryParameters);
  },

  // Get project statistics
  async getProjectStats(): Promise<ProjectStats> {
    return apiClient.get<ProjectStats>('/projects/stats');
  },

  // Get recent projects
  async getRecentProjects(limit = 5): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects/recent', {
      limit: limit.toString(),
    });
  },

  // Search projects
  async searchProjects(
    query: string,
    options?: {
      limit?: number;
      includeInactive?: boolean;
    },
  ): Promise<Project[]> {
    const parameters: Record<string, string> = {
      search: query,
    };

    if (options?.limit) {
      parameters.limit = options.limit.toString();
    }

    if (options?.includeInactive) {
      parameters.includeInactive = 'true';
    }

    return apiClient.get<Project[]>('/projects/search', parameters);
  },

  // Archive project (soft delete)
  async archiveProject(projectId: string): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${projectId}`, {
      isActive: false,
    });
  },

  // Restore archived project
  async restoreProject(projectId: string): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${projectId}`, {
      isActive: true,
    });
  },

  // Duplicate project
  async duplicateProject(projectId: string, name: string): Promise<Project> {
    return apiClient.post<Project>(`/projects/${projectId}/duplicate`, {
      name,
    });
  },

  // Export project data
  async exportProject(projectId: string): Promise<Blob> {
    const response = await fetch(`${apiClient.baseURL}/projects/${projectId}/export`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiClient.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  },

  // Import project data
  async importProject(file: File): Promise<Project> {
    return apiClient.upload<Project>('/projects/import', [file]);
  },
};
