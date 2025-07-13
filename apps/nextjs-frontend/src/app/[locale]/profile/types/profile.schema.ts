import {z} from 'zod';

export const profileSchema = z.object({
  email: z
    .string()
    .transform(value => value.trim())
    .pipe(z.string().email().max(100))
    .optional(),
  username: z
    .string()
    .transform(value => value.trim())
    .pipe(z.string().min(4).max(20))
    .optional(),
  password: z.string().min(4).max(128).optional(),
});
