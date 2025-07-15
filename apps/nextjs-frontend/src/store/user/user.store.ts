import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {type UserDto} from '@titan/shared';
import {type UserStoreState} from './types/user-store.state.type';
import {type LoadUserReturnType} from './types/load-user.return.type';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';
import {ApiError} from '@/utils/api/api-error.ts';

/**
 * 用户状态管理 Store
 * 使用 Zustand 创建的全局用户状态管理，包含用户信息、加载状态和错误状态
 * 使用 persist 中间件实现状态持久化到 localStorage
 */
export const useUserStore = create<UserStoreState>()(persist(
	set => ({
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
	{
		/** 本地存储的键名 */
		name: 'user-storage',
	},
));
