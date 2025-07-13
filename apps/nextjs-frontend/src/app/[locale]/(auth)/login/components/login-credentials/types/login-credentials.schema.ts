import {z} from 'zod';

export const loginCredentialsSchema = z.object({
  email: z
    .string()
    .transform(value => value.trim())
    .pipe(z.string().email()),
  password: z.string().min(4).max(128),
});
