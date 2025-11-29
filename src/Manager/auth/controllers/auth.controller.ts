import { Request, Response } from 'express';
import { managerAuthService } from '../services/auth.service';

class ManagerAuthController {
  async register(req: Request, res: Response) {
    try {
      const user = await managerAuthService.register(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { user, token } = await managerAuthService.login(req.body);
      res.json({ user, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export const managerAuthController = new ManagerAuthController();
