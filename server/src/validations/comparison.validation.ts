import { z } from 'zod';

export const createComparisonSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  developer_ids: z
    .array(z.string().uuid('Invalid developer ID'))
    .min(2, 'At least 2 developers are required')
    .max(5, 'At most 5 developers can be compared'),
});

export const updateComparisonSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
});

export const comparisonIdParamSchema = z.object({
  id: z.string().uuid('Invalid comparison ID format'),
});
