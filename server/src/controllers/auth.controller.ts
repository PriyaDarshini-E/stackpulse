import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await AuthService.register(validated);
      return res.status(201).json({
        message: 'Registration successful',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated);
      return res.status(200).json({
        message: 'Login successful',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const user = await AuthService.getCurrentUser(req.user.id);
      return res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
}
