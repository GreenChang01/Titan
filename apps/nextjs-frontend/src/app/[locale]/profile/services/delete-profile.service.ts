import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';

export const deleteProfile = async (): Promise<void> => {
	await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
		method: 'DELETE',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
	});
};
