import { z } from 'zod';

export const compareQuerySchema = z.object({
  users: z
    .string()
    .min(1, 'Users query parameter is required')
    .transform((val) =>
      val
        .split(',')
        .map((u) => u.trim())
        .filter((u) => u.length > 0)
    )
    .refine((users) => users.length >= 2, {
      message: 'At least 2 developers are required for comparison',
    })
    .refine((users) => users.length <= 5, {
      message: 'Maximum 5 developers can be compared at once',
    })
    .refine((users) => new Set(users.map((u) => u.toLowerCase())).size === users.length, {
      message: 'Cannot compare duplicate usernames',
    }),
});
