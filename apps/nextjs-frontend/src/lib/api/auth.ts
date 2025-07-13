import {apiClient} from './client';

/**
 * 登录请求参数类型
 */
export type LoginRequest = {
	/** 用户邮箱 */
	email: string;
	/** 用户密码 */
	password: string;
};

/**
 * 注册请求参数类型
 */
export type RegisterRequest = {
	/** 用户姓名 */
	name: string;
	/** 用户邮箱 */
	email: string;
	/** 用户密码 */
	password: string;
	/** 确认密码 */
	confirmPassword: string;
};

/**
 * 认证响应数据类型
 */
export type AuthResponse = {
	/** 访问令牌 */
	access_token: string;
	/** 刷新令牌 */
	refresh_token: string;
	/** 用户信息 */
	user: {
		/** 用户ID */
		id: string;
		/** 用户姓名 */
		name: string;
		/** 用户邮箱 */
		email: string;
		/** 用户角色 */
		role: string;
		/** 创建时间 */
		createdAt: string;
	};
};

/**
 * 刷新令牌请求参数类型
 */
export type RefreshTokenRequest = {
	/** 刷新令牌 */
	refresh_token: string;
};

/**
 * 用户信息类型
 */
export type User = {
	/** 用户ID */
	id: string;
	/** 用户姓名 */
	name: string;
	/** 用户邮箱 */
	email: string;
	/** 用户角色 */
	role: string;
	/** 创建时间 */
	createdAt: string;
	/** 更新时间 */
	updatedAt: string;
};

/**
 * 认证API服务
 * 提供用户登录、注册、令牌刷新、个人资料管理等功能
 */
export const authApi = {
	/**
	 * 用户登录
	 * @param credentials - 登录凭据（邮箱和密码）
	 * @returns 返回包含令牌和用户信息的认证响应
	 */
	async login(credentials: LoginRequest): Promise<AuthResponse> {
		const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

		// 存储令牌
		if (response.access_token) {
			apiClient.setToken(response.access_token);
			if (globalThis.window !== undefined) {
				localStorage.setItem('refresh_token', response.refresh_token);
				localStorage.setItem('user', JSON.stringify(response.user));
			}
		}

		return response;
	},

	/**
	 * 用户注册
	 * @param userData - 注册用户数据
	 * @returns 返回包含令牌和用户信息的认证响应
	 */
	async register(userData: RegisterRequest): Promise<AuthResponse> {
		const response = await apiClient.post<AuthResponse>('/auth/register', userData);

		// 存储令牌
		if (response.access_token) {
			apiClient.setToken(response.access_token);
			if (globalThis.window !== undefined) {
				localStorage.setItem('refresh_token', response.refresh_token);
				localStorage.setItem('user', JSON.stringify(response.user));
			}
		}

		return response;
	},

	/**
	 * 刷新访问令牌
	 * @returns 返回新的令牌和用户信息
	 * @throws {TypeError} 当在服务器端调用时抛出错误
	 * @throws {Error} 当没有刷新令牌时抛出错误
	 */
	async refreshToken(): Promise<AuthResponse> {
		if (globalThis.window === undefined) {
			throw new TypeError('Cannot refresh token on server side');
		}

		const refreshToken = localStorage.getItem('refresh_token');
		if (!refreshToken) {
			throw new Error('No refresh token available');
		}

		const response = await apiClient.post<AuthResponse>('/auth/refresh', {
			refresh_token: refreshToken,
		});

		// 更新存储的令牌
		apiClient.setToken(response.access_token);
		localStorage.setItem('refresh_token', response.refresh_token);
		localStorage.setItem('user', JSON.stringify(response.user));

		return response;
	},

	/**
	 * 用户登出
	 * 清除本地存储的令牌和用户数据，即使服务器请求失败也会执行本地清理
	 */
	async logout(): Promise<void> {
		try {
			await apiClient.post('/auth/logout');
		} catch (error) {
			// 即使服务器请求失败也继续本地清理
			console.warn('Logout request failed:', error);
		} finally {
			// 清除本地存储
			apiClient.setToken(null);
			if (globalThis.window !== undefined) {
				localStorage.removeItem('refresh_token');
				localStorage.removeItem('user');
			}
		}
	},

	/**
	 * 获取当前用户个人资料
	 * @returns 返回用户信息
	 */
	async getProfile(): Promise<User> {
		return apiClient.get<User>('/auth/profile');
	},

	/**
	 * 更新用户个人资料
	 * @param updates - 要更新的用户信息（姓名或邮箱）
	 * @returns 返回更新后的用户信息
	 */
	async updateProfile(updates: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
		const response = await apiClient.patch<User>('/auth/profile', updates);

		// 更新存储的用户数据
		if (globalThis.window !== undefined) {
			localStorage.setItem('user', JSON.stringify(response));
		}

		return response;
	},

	/**
	 * 修改密码
	 * @param data - 包含当前密码、新密码和确认密码的数据
	 */
	async changePassword(data: {currentPassword: string; newPassword: string; confirmPassword: string}): Promise<void> {
		await apiClient.post('/auth/change-password', data);
	},

	/**
	 * 获取存储的用户数据
	 * @returns 返回本地存储的用户信息，如果不存在或解析失败则返回null
	 */
	getStoredUser(): User | undefined {
		if (globalThis.window === undefined) {
			return null;
		}

		const userString = localStorage.getItem('user');
		if (!userString) {
			return null;
		}

		try {
			return JSON.parse(userString);
		} catch (error) {
			console.error('Error parsing stored user data:', error);
			return null;
		}
	},

	/**
	 * 检查用户是否已认证
	 * @returns 如果用户有有效的访问令牌或刷新令牌则返回true
	 */
	isAuthenticated(): boolean {
		if (globalThis.window === undefined) {
			return false;
		}

		const token = localStorage.getItem('auth_token');
		const refreshToken = localStorage.getItem('refresh_token');

		return Boolean(token ?? refreshToken);
	},

	/**
	 * 从本地存储初始化认证状态
	 * 在应用启动时调用，恢复用户的登录状态
	 */
	initializeAuth(): void {
		if (globalThis.window === undefined) {
			return;
		}

		const token = localStorage.getItem('auth_token');
		if (token) {
			apiClient.setToken(token);
		}
	},
};
