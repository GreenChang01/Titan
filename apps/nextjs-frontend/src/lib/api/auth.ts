import {apiClient} from './client';

// Auth types
export type LoginRequest = {
  email: string;
  password: string;
}

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
}

export type RefreshTokenRequest = {
  refresh_token: string;
}

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Auth API service
export const authApi = {
  // User login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

    // Store tokens
    if (response.access_token) {
      apiClient.setToken(response.access_token);
      if (globalThis.window !== undefined) {
        localStorage.setItem('refresh_token', response.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }

    return response;
  },

  // User registration
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);

    // Store tokens
    if (response.access_token) {
      apiClient.setToken(response.access_token);
      if (globalThis.window !== undefined) {
        localStorage.setItem('refresh_token', response.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }

    return response;
  },

  // Refresh access token
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

    // Update stored tokens
    apiClient.setToken(response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  },

  // User logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with local cleanup even if server request fails
      console.warn('Logout request failed:', error);
    } finally {
      // Clear local storage
      apiClient.setToken(null);
      if (globalThis.window !== undefined) {
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  },

  // Update user profile
  async updateProfile(updates: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
    const response = await apiClient.patch<User>('/auth/profile', updates);

    // Update stored user data
    if (globalThis.window !== undefined) {
      localStorage.setItem('user', JSON.stringify(response));
    }

    return response;
  },

  // Change password
  async changePassword(data: {currentPassword: string; newPassword: string; confirmPassword: string}): Promise<void> {
    await apiClient.post('/auth/change-password', data);
  },

  // Get stored user data
  getStoredUser(): User | undefined {
    if (globalThis.window === undefined) return null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (globalThis.window === undefined) return false;

    const token = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');

    return Boolean(token || refreshToken);
  },

  // Initialize auth state from storage
  initializeAuth(): void {
    if (globalThis.window === undefined) return;

    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.setToken(token);
    }
  },
};
