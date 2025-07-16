import {type QueryClient} from '@tanstack/react-query';

/**
 * Centralized API client with authentication and interceptors
 * This provides a unified interface for all API calls with proper error handling,
 * authentication token management, and request/response interceptors.
 */

export type APIClientConfig = {
	baseURL?: string;
	timeout?: number;
	headers?: Record<string, string>;
};

export type APIResponse<T = unknown> = {
	data: T;
	status: number;
	statusText: string;
	headers: Headers;
};

export type APIError = {
	message: string;
	status?: number;
	code?: string;
	details?: unknown;
};

class APIClientClass {
	private readonly baseURL: string;
	private readonly timeout: number;
	private readonly defaultHeaders: Record<string, string>;
	private queryClient?: QueryClient;

	constructor(config: APIClientConfig = {}) {
		this.baseURL = config.baseURL || process.env.NEXT_PUBLIC_API_URL || '/api';
		this.timeout = config.timeout || 30_000; // 30 seconds
		this.defaultHeaders = {
			'Content-Type': 'application/json',
			...config.headers,
		};
	}

	/**
	 * Set QueryClient instance for cache invalidation
	 */
	setQueryClient(queryClient: QueryClient) {
		this.queryClient = queryClient;
	}

	/**
	 * Get authentication token from storage
	 */
	private getAuthToken(): string | undefined {
		if (globalThis.window === undefined) {
			return null;
		}

		return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
	}

	/**
	 * Set authentication token
	 */
	setAuthToken(token: string, persist = true) {
		if (globalThis.window === undefined) {
			return;
		}

		if (persist) {
			localStorage.setItem('authToken', token);
		} else {
			sessionStorage.setItem('authToken', token);
		}
	}

	/**
	 * Clear authentication token
	 */
	clearAuthToken() {
		if (globalThis.window === undefined) {
			return;
		}

		localStorage.removeItem('authToken');
		sessionStorage.removeItem('authToken');
	}

	/**
	 * Build request headers with authentication
	 */
	private buildHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
		const headers = {...this.defaultHeaders, ...customHeaders};

		const token = this.getAuthToken();
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		return headers;
	}

	/**
	 * Create AbortController for request timeout
	 */
	private createAbortController(): AbortController {
		const controller = new AbortController();
		setTimeout(() => {
			controller.abort();
		}, this.timeout);
		return controller;
	}

	/**
	 * Handle API response
	 */
	private async handleResponse<T>(response: Response): Promise<APIResponse<T>> {
		const responseData: APIResponse<T> = {
			data: null as T,
			status: response.status,
			statusText: response.statusText,
			headers: response.headers,
		};

		// Handle different content types
		const contentType = response.headers.get('content-type');
		if (contentType?.includes('application/json')) {
			responseData.data = await response.json();
		} else if (contentType?.includes('text/')) {
			responseData.data = (await response.text()) as T;
		} else {
			responseData.data = (await response.blob()) as T;
		}

		// Handle error responses
		if (!response.ok) {
			const error: APIError = {
				message: response.statusText,
				status: response.status,
				details: responseData.data,
			};

			// Handle authentication errors
			if (response.status === 401) {
				this.clearAuthToken();
				// Optionally redirect to login
				if (globalThis.window !== undefined && globalThis.location.pathname !== '/login') {
					globalThis.location.href = '/login';
				}
			}

			throw error;
		}

		return responseData;
	}

	/**
	 * Build full URL
	 */
	private buildURL(endpoint: string): string {
		if (endpoint.startsWith('http')) {
			return endpoint;
		}

		return `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
	}

	/**
	 * Generic request method
	 */
	private async request<T>(
		method: string,
		endpoint: string,
		options: {
			body?: unknown;
			headers?: Record<string, string>;
			queryParams?: Record<string, string>;
		} = {},
	): Promise<APIResponse<T>> {
		const url = this.buildURL(endpoint);
		const {body, headers = {}, queryParams} = options;

		// Add query parameters
		const searchParams = new URLSearchParams();
		if (queryParams) {
			for (const [key, value] of Object.entries(queryParams)) {
				if (value !== undefined && value !== null) {
					searchParams.append(key, value);
				}
			}
		}

		const finalURL = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;
		const controller = this.createAbortController();

		const requestOptions: RequestInit = {
			method,
			headers: this.buildHeaders(headers),
			signal: controller.signal,
		};

		// Add body for non-GET requests
		if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
			if (body instanceof FormData) {
				// Remove Content-Type for FormData (browser will set it)
				delete requestOptions.headers!['Content-Type' as keyof HeadersInit];
				requestOptions.body = body;
			} else {
				requestOptions.body = JSON.stringify(body);
			}
		}

		try {
			const response = await fetch(finalURL, requestOptions);
			return await this.handleResponse<T>(response);
		} catch (error) {
			// Handle abort/timeout
			if (error instanceof Error && error.name === 'AbortError') {
				throw new Error(`Request timeout after ${this.timeout}ms`);
			}

			throw error;
		}
	}

	/**
	 * HTTP Methods
	 */
	async get<T>(endpoint: string, queryParams?: Record<string, string>, headers?: Record<string, string>): Promise<APIResponse<T>> {
		return this.request<T>('GET', endpoint, {queryParams, headers});
	}

	async post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<APIResponse<T>> {
		return this.request<T>('POST', endpoint, {body, headers});
	}

	async put<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<APIResponse<T>> {
		return this.request<T>('PUT', endpoint, {body, headers});
	}

	async patch<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<APIResponse<T>> {
		return this.request<T>('PATCH', endpoint, {body, headers});
	}

	async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<APIResponse<T>> {
		return this.request<T>('DELETE', endpoint, {headers});
	}

	/**
	 * File upload helper
	 */
	async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<APIResponse<T>> {
		const formData = new FormData();
		formData.append('file', file);

		if (additionalData) {
			for (const [key, value] of Object.entries(additionalData)) {
				formData.append(key, value);
			}
		}

		return this.request<T>('POST', endpoint, {body: formData});
	}

	/**
	 * Invalidate React Query cache for specific endpoints
	 */
	invalidateQueries(queryKeyPrefix: string[]) {
		if (this.queryClient) {
			this.queryClient.invalidateQueries({queryKey: queryKeyPrefix});
		}
	}

	/**
	 * Health check endpoint
	 */
	async healthCheck(): Promise<boolean> {
		try {
			await this.get('/health');
			return true;
		} catch {
			return false;
		}
	}
}

// Export singleton instance
export const apiClient = new APIClientClass();

// React Query integration helper
export const withQueryClient = (queryClient: QueryClient) => {
	apiClient.setQueryClient(queryClient);
	return apiClient;
};

export default apiClient;
