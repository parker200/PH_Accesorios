import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';
import { UnauthorizedError, BadRequestError, ConflictError } from '../../errors/app-error.js';

export class AuthService {
  async login(username: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const permissions = user.role.permissions.map((p) => p.permission.code);

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role.name
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        permissions
      }
    };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions.map((p) => p.permission.code)
    };
  }

  async updateProfile(userId: string, data: { username?: string; email?: string }) {
    if (data.username) {
      const existing = await prisma.user.findUnique({ where: { username: data.username } });
      if (existing && existing.id !== userId) {
        throw new ConflictError('El nombre de usuario ya está en uso');
      }
    }

    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== userId) {
        throw new ConflictError('El correo electrónico ya está en uso');
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        email: data.email
      },
      include: {
        role: true
      }
    });

    return {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      role: updated.role.name
    };
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('La contraseña actual es incorrecta');
    }

    if (currentPass === newPass) {
      throw new BadRequestError('La nueva contraseña no puede ser igual a la anterior');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPass, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return true;
  }
}
