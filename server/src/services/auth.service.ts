import { prisma } from '../db/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { RegisterInput, LoginInput } from '../validations/auth.validation.js';

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const password_hash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        password_hash,
      },
      select: {
        id: true,
        email: true,
        created_at: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return { user, token };
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await comparePassword(input.password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      token,
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}
