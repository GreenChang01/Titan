import {z} from 'zod';

export const loginTwoFactorSchema = z.object({
	code: z
		.string()
		.transform(value => value.trim())
		.pipe(z.string().min(6).max(6)),
});
