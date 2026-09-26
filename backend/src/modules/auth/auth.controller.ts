import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
  private service: AuthService;

  constructor(service = new AuthService()) {
    this.service = service;
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      const result = await this.service.login(username, password);

      res.json({
        success: true,
        message: 'Sesión iniciada correctamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.getCurrentUser(req.user!.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await this.service.updateProfile(req.user!.id, req.body);
      res.json({
        success: true,
        message: 'Perfil actualizado correctamente',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await this.service.changePassword(req.user!.id, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  };
}
