import {create} from 'zustand';
import {type UserStoreState} from './types/user-store.state.type';
import {type LoadUserReturnType} from './types/load-user.return.type';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';
import {ApiError} from '@/utils/api/api-error.ts';

// 创建基础 store（不使用 persist）
const createUserStore = () => create<UserStoreState>(
	(set, get) => ({
		/** 当前用户信息，未登录时为 undefined */
		user: undefined,
		/** 是否正在加载用户信息 */
		loading: false,
		/** 是否发生错误 */
		error: false,

		/**
		 * 加载当前用户信息
		 * @description 从后端API获取当前已认证用户的信息
		 * @returns 返回加载结果，包含成功状态和可能的错误信息
		 */
		async loadUser(): LoadUserReturnType {
			// 防止重复加载
			if (get().loading) {
				return {success: false, error: new ApiError('Already loading user', new Response())};
			}

			set({loading: true});
			try {
				const response = await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`, {
					method: 'GET',
					credentials: 'include',
				});

				if (!response.ok) {
					set({user: undefined, loading: false, error: true});
					return {success: false, error: new ApiError('Failed to load user', response)};
				}

				const responseJson = await response.json();
				if (responseJson.success && responseJson.data) {
					set({user: responseJson.data, loading: false, error: false});
					return {success: true};
				}

				set({user: undefined, loading: false, error: true});
				return {success: false, error: new ApiError('Invalid user response format', response)};
			} catch (error) {
				set({user: undefined, loading: false, error: true});
				return {success: false, error: error as ApiError};
			}
		},

		/**
		 * 清除用户信息
		 * @description 清空当前用户状态，通常在用户登出时调用
		 */
		clearUser(): void {
			set({user: undefined, loading: false, error: false});
		},
	}),
);

// 创建 SSR 兼容的 store
let store: ReturnType<typeof createUserStore> | null = null;

// 获取或创建 store 实例
const getStore = () => {
	if (!store) {
		store = createUserStore();
	}
	return store;
};

/**
 * 用户状态管理 Store
 * SSR 兼容的 Zustand store，不使用 persist 中间件避免水合问题
 */
export const useUserStore = (selector?: (state: UserStoreState) => any) => {
	const store = getStore();
	return selector ? store(selector) : store();
};
