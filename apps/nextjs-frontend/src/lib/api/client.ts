import {toast} from 'sonner';

/**
 * API响应的通用类型定义
 * @template T - 数据类型
 */
type ApiResponse<T = any> = {
	/** 请求是否成功 */
	success: boolean;
	/** 响应数据 */
	data: T;
	/** 成功消息 */
	message?: string;
	/** 错误消息 */
	error?: string;
};

/**
 * API错误类，继承自标准Error
 * 用于处理API请求过程中的各种错误情况
 */
class ApiError extends Error {
	constructor(
		message: string,
		/** HTTP状态码 */
		public status: number,
		/** 原始响应数据 */
		public response?: any,
	) {
		super(message);
		this.name = 'ApiError';
	}
}

/**
 * API客户端类
 * 提供统一的HTTP请求接口，包含认证、错误处理、文件上传等功能
 */
class ApiClient {
	/** API基础URL */
	private readonly baseURL: string;
	/** 认证令牌 */
	private token: string | undefined = null;

	/**
	 * 构造函数
	 * @param baseURL - API基础URL，默认从环境变量获取
	 */
	constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '/api') {
		this.baseURL = baseURL;
		// 在客户端从localStorage获取token
		if (globalThis.window !== undefined) {
			this.token = localStorage.getItem('auth_token');
		}
	}

	/**
	 * 设置认证令牌
	 * @param token - 认证令牌，为null时清除token
	 */
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

	/**
	 * 私有请求方法，处理所有HTTP请求的核心逻辑
	 * @template T - 响应数据类型
	 * @param endpoint - API端点
	 * @param options - fetch请求选项
	 * @returns 返回处理后的响应数据
	 * @throws {ApiError} 当请求失败时抛出API错误
	 */
	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;

		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...options.headers,
		};

		// 如果有认证令牌，添加到请求头
		if (this.token) {
			headers.Authorization = `Bearer ${this.token}`;
		}

		const config: RequestInit = {
			...options,
			headers,
		};

		try {
			const response = await fetch(url, config);

			// 处理非JSON响应
			const contentType = response.headers.get('content-type');
			let data: any;

			data = await (contentType && contentType.includes('application/json') ? response.json() : response.text());

			if (!response.ok) {
				// 处理结构化API错误
				if (typeof data === 'object' && data.error) {
					throw new ApiError(data.error, response.status, data);
				}

				// 处理HTTP错误
				throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status, data);
			}

			// 返回结构化API响应数据
			if (typeof data === 'object' && data.success !== undefined) {
				return data.data;
			}

			return data;
		} catch (error) {
			if (error instanceof ApiError) {
				// 处理认证错误
				if (error.status === 401) {
					this.setToken(null);
					if (globalThis.window !== undefined) {
						globalThis.location.href = '/login';
					}
				}

				// 为客户端错误显示错误提示
				if (error.status >= 400 && error.status < 500) {
					toast.error(error.message);
				}

				throw error;
			}

			// 处理网络错误
			if (error instanceof TypeError && error.message.includes('fetch')) {
				const networkError = new ApiError('Network error - please check your connection', 0);
				toast.error(networkError.message);
				throw networkError;
			}

			// 重新抛出其他错误
			throw error;
		}
	}

	/**
	 * 发送GET请求
	 * @template T - 响应数据类型
	 * @param endpoint - API端点
	 * @param parameters - 查询参数
	 * @returns 返回响应数据
	 */
	async get<T>(endpoint: string, parameters?: Record<string, string>): Promise<T> {
		const url = new URL(endpoint, this.baseURL);
		if (parameters) {
			for (const [key, value] of Object.entries(parameters)) {
				url.searchParams.append(key, value);
			}
		}

		return this.request<T>(url.pathname + url.search);
	}

	/**
	 * 发送POST请求
	 * @template T - 响应数据类型
	 * @param endpoint - API端点
	 * @param data - 请求体数据
	 * @returns 返回响应数据
	 */
	async post<T>(endpoint: string, data?: any): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	/**
	 * 发送PUT请求
	 * @template T - 响应数据类型
	 * @param endpoint - API端点
	 * @param data - 请求体数据
	 * @returns 返回响应数据
	 */
	async put<T>(endpoint: string, data?: any): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	/**
	 * 发送PATCH请求
	 * @template T - 响应数据类型
	 * @param endpoint - API端点
	 * @param data - 请求体数据
	 * @returns 返回响应数据
	 */
	async patch<T>(endpoint: string, data?: any): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PATCH',
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	/**
	 * 发送DELETE请求
	 * @template T - 响应数据类型
	 * @param endpoint - API端点
	 * @returns 返回响应数据
	 */
	async delete<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'DELETE',
		});
	}

	/**
	 * 上传文件
	 * @template T - 响应数据类型
	 * @param endpoint - API端点
	 * @param files - 要上传的文件数组
	 * @param additionalData - 额外的表单数据
	 * @returns 返回上传结果
	 * @throws {ApiError} 当上传失败时抛出错误
	 */
	async upload<T>(endpoint: string, files: File[], additionalData?: Record<string, any>): Promise<T> {
		const formData = new FormData();

		// 添加文件到表单数据
		for (const [index, file] of files.entries()) {
			formData.append(`files[${index}]`, file);
		}

		// 添加额外的表单数据
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

// 创建单例实例
export const apiClient = new ApiClient();

// 导出类型
export type {ApiResponse};
export {ApiError};
