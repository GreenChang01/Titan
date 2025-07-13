import {z} from 'zod';

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .transform(value => value.trim())
    .pipe(z.string().email()),
});
