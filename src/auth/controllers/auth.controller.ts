/**
 * Auth Controller
 * Handles incoming HTTP requests for authentication (register/login/me)
 */
import { Request, Response } from 'express';
import authService from '../services/auth.service';

const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body as any);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
    res.json({ token, user });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

const getMe = async (req: Request, res: Response) => {
  try {
    // `req.user` is set by auth middleware
    // use `any` here for simplicity; type tightening can be done later
    // @ts-ignore
    const user = await authService.getMe((req as any).user.id);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export default { register, login, getMe };
