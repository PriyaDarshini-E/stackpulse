import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token required', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication token required', 401);
    }

    const decoded = verifyToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired authentication token', 401));
    }
  }
}
