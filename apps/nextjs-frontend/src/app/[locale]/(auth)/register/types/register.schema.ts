import {z} from 'zod';

export const registerSchema = z.object({
	email: z
		.string()
		.transform((value) => value.trim())
		.pipe(z.string().email().max(100)),
	username: z
		.string()
		.transform((value) => value.trim())
		.pipe(z.string().min(4).max(20)),
	password: z.string().min(4).max(128),
});
