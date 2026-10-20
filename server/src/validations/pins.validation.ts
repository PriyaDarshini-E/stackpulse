import { z } from 'zod';

export const createPinSchema = z.object({
  repo_id: z.string().uuid('Invalid repository ID format'),
  note: z.string().max(1000, 'Note cannot exceed 1000 characters').optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(30)).max(20, 'Maximum 20 tags allowed').default([]),
});

export const updatePinSchema = z.object({
  note: z.string().max(1000, 'Note cannot exceed 1000 characters').optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(30)).max(20, 'Maximum 20 tags allowed').optional(),
});

export const pinIdParamSchema = z.object({
  id: z.string().uuid('Invalid pin ID format'),
});
