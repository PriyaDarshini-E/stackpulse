import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  createComparisonSchema,
  updateComparisonSchema,
  comparisonIdParamSchema,
} from '../validations/comparison.validation.js';

export class ComparisonController {
  static async getComparisons(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const comparisons = await prisma.comparison.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        include: {
          comparison_devs: {
            include: {
              developer: {
                select: {
                  id: true,
                  github_username: true,
                  avatar_url: true,
                  name: true,
                  total_stars: true,
                  followers: true,
                  public_repos: true,
                },
              },
            },
          },
        },
      });

      return res.status(200).json({ comparisons });
    } catch (error) {
      next(error);
    }
  }

  static async getComparisonById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = comparisonIdParamSchema.parse(req.params);

      // Scoped by authenticated user_id
      const comparison = await prisma.comparison.findFirst({
        where: { id, user_id: userId },
        include: {
          comparison_devs: {
            include: {
              developer: true,
            },
          },
        },
      });

      if (!comparison) {
        throw new AppError('Saved comparison not found', 404);
      }

      return res.status(200).json({ comparison });
    } catch (error) {
      next(error);
    }
  }

  static async createComparison(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = createComparisonSchema.parse(req.body);

      // Verify all developer IDs exist
      const developers = await prisma.developer.findMany({
        where: { id: { in: data.developer_ids } },
      });

      if (developers.length !== data.developer_ids.length) {
        throw new AppError('One or more selected developers were not found', 400);
      }

      // Create comparison and link developers
      const comparison = await prisma.comparison.create({
        data: {
          user_id: userId,
          name: data.name,
          comparison_devs: {
            create: data.developer_ids.map((devId) => ({
              developer_id: devId,
            })),
          },
        },
        include: {
          comparison_devs: {
            include: {
              developer: {
                select: {
                  id: true,
                  github_username: true,
                  avatar_url: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return res.status(201).json({
        message: 'Comparison saved successfully',
        comparison,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateComparison(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = comparisonIdParamSchema.parse(req.params);
      const data = updateComparisonSchema.parse(req.body);

      // Verify ownership
      const existing = await prisma.comparison.findFirst({
        where: { id, user_id: userId },
      });

      if (!existing) {
        throw new AppError('Saved comparison not found', 404);
      }

      const updated = await prisma.comparison.update({
        where: { id },
        data: { name: data.name },
        include: {
          comparison_devs: {
            include: {
              developer: true,
            },
          },
        },
      });

      return res.status(200).json({
        message: 'Comparison renamed successfully',
        comparison: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteComparison(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = comparisonIdParamSchema.parse(req.params);

      // Verify ownership
      const existing = await prisma.comparison.findFirst({
        where: { id, user_id: userId },
      });

      if (!existing) {
        throw new AppError('Saved comparison not found', 404);
      }

      await prisma.comparison.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Comparison deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
