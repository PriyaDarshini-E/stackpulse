import { z } from 'zod';

export const usernameParamSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'GitHub username is required')
    .max(39, 'GitHub username is at most 39 characters')
    .regex(/^[a-zA-Z0-9_-]{1,39}$/, 'Invalid GitHub username format'),
});

export const reposQuerySchema = z.object({
  sort: z.enum(['stars', 'updated', 'name']).default('stars'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
