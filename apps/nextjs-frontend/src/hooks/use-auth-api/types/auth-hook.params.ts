import {type ApiError} from '@/utils/api/api-error.ts';

type BaseAuthHookParameters = {
	onSuccess?: () => void | Promise<void>;
	onError?: (error: ApiError) => void | Promise<void>;
	onSettled?: () => void | Promise<void>;
};

export type AuthHookParameters<T = undefined> = T extends undefined
	? BaseAuthHookParameters
	: BaseAuthHookParameters & {
			params: T;
		};
