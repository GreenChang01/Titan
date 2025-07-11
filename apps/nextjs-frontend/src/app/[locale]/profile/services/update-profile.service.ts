import {type UpdateUserBody} from '@titan/shared';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';

export const updateProfile = async (data: UpdateUserBody): Promise<void> => {
  // eslint-disable-next-line n/prefer-global/process
  await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};
