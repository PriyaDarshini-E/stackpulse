import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode = 400, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle known AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Handle Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'A record with this identifier already exists',
      details: err.meta,
    });
  }

  // Log unexpected errors
  console.error('Unhandled Server Error:', err);

  return res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : {}),
  });
}
