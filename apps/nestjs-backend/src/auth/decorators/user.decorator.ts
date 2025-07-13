import {createParamDecorator, type ExecutionContext} from '@nestjs/common';
import {type ActiveUser} from '../types/active-user.type';

export const User = createParamDecorator((data: keyof ActiveUser | undefined, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest<{user: ActiveUser}>();
	const {user} = request;

	return data ? user?.[data] : user;
});
