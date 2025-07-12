import {toast} from 'sonner';

type ApiResponse<T = any> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private readonly baseURL: string;
  private token: string | undefined = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '/api') {
    this.baseURL = baseURL;
    // Get token from localStorage on client side
    if (globalThis.window !== undefined) {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | undefined) {
    this.token = token;
    if (globalThis.window !== undefined) {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data: any;

      data = await (contentType && contentType.includes('application/json') ? response.json() : response.text());

      if (!response.ok) {
        // Handle structured API errors
        if (typeof data === 'object' && data.error) {
          throw new ApiError(data.error, response.status, data);
        }

        // Handle HTTP errors
        throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status, data);
      }

      // Return structured API response data
      if (typeof data === 'object' && data.success !== undefined) {
        return data.data;
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle authentication errors
        if (error.status === 401) {
          this.setToken(null);
          if (globalThis.window !== undefined) {
            globalThis.location.href = '/login';
          }
        }

        // Show error toast for client errors
        if (error.status >= 400 && error.status < 500) {
          toast.error(error.message);
        }

        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new ApiError('Network error - please check your connection', 0);
        toast.error(networkError.message);
        throw networkError;
      }

      // Re-throw other errors
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
      }
    }

    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Upload files
  async upload<T>(endpoint: string, files: File[], additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();

    for (const [index, file] of files.entries()) {
      formData.append(`files[${index}]`, file);
    }

    if (additionalData) {
      for (const [key, value] of Object.entries(additionalData)) {
        formData.append(key, JSON.stringify(value));
      }
    }

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ApiError(`Upload failed: ${error}`, response.status);
    }

    return response.json();
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types
export type {ApiResponse};
export {ApiError};
