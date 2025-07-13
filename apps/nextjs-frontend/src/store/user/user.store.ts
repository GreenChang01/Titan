import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {type UserDto} from '@titan/shared';
import {type UserStoreState} from './types/user-store.state.type';
import {type LoadUserReturnType} from './types/load-user.return.type';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';
import {ApiError} from '@/utils/api/api-error.ts';

export const useUserStore = create<UserStoreState>()(persist(
	set => ({
		user: undefined,
		loading: false,
		error: false,

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

		clearUser(): void {
			set({user: undefined, loading: false, error: false});
		},
	}),
	{
		name: 'user-storage',
	},
));
