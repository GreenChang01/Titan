import {type ResetPasswordRequestBody} from '@titan/shared';

export type ForgotPasswordParameters = {
	language: string;
	forgotPasswordData: ResetPasswordRequestBody;
};
