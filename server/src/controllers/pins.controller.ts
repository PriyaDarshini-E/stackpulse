import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  createPinSchema,
  updatePinSchema,
  pinIdParamSchema,
} from '../validations/pins.validation.js';

export class PinsController {
  static async getPins(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const pins = await prisma.pin.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        include: {
          repo: {
            include: {
              developer: {
                select: {
                  id: true,
                  github_username: true,
                  avatar_url: true,
                },
              },
            },
          },
        },
      });

      return res.status(200).json({ pins });
    } catch (error) {
      next(error);
    }
  }

  static async createPin(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = createPinSchema.parse(req.body);

      // Verify repository exists
      const repo = await prisma.repo.findUnique({
        where: { id: data.repo_id },
      });

      if (!repo) {
        throw new AppError('Repository not found', 404);
      }

      // Upsert pin for this user
      const pin = await prisma.pin.upsert({
        where: {
          user_id_repo_id: {
            user_id: userId,
            repo_id: data.repo_id,
          },
        },
        update: {
          note: data.note,
          tags: data.tags,
        },
        create: {
          user_id: userId,
          repo_id: data.repo_id,
          note: data.note,
          tags: data.tags,
        },
        include: {
          repo: {
            include: {
              developer: {
                select: {
                  id: true,
                  github_username: true,
                  avatar_url: true,
                },
              },
            },
          },
        },
      });

      return res.status(201).json({ message: 'Repository pinned successfully', pin });
    } catch (error) {
      next(error);
    }
  }

  static async updatePin(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = pinIdParamSchema.parse(req.params);
      const data = updatePinSchema.parse(req.body);

      // Ownership isolation: verify pin exists AND belongs to user
      const existing = await prisma.pin.findFirst({
        where: { id, user_id: userId },
      });

      if (!existing) {
        throw new AppError('Pin not found', 404);
      }

      const updated = await prisma.pin.update({
        where: { id },
        data: {
          ...(data.note !== undefined ? { note: data.note } : {}),
          ...(data.tags !== undefined ? { tags: data.tags } : {}),
        },
        include: {
          repo: {
            include: {
              developer: {
                select: {
                  id: true,
                  github_username: true,
                  avatar_url: true,
                },
              },
            },
          },
        },
      });

      return res.status(200).json({ message: 'Pin updated successfully', pin: updated });
    } catch (error) {
      next(error);
    }
  }

  static async deletePin(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = pinIdParamSchema.parse(req.params);

      // Ownership isolation: must belong to user
      const existing = await prisma.pin.findFirst({
        where: { id, user_id: userId },
      });

      if (!existing) {
        throw new AppError('Pin not found', 404);
      }

      await prisma.pin.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Pin removed successfully' });
    } catch (error) {
      next(error);
    }
  }
}
