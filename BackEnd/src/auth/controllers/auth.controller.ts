/**
 * Auth Controller
 * Handles incoming HTTP requests for authentication (register/login/me)
 */
import { Request, Response } from 'express';
import authService from '../services/auth.service';

const register = async (req: Request, res: Response) => {
  try {
    console.log('Registration request received:', { ...req.body, password: '[HIDDEN]' });
    const { name, email, password, role } = req.body;
    // Allow role to be 'employee' or 'manager', default to 'employee'
    const userRole = role === 'manager' ? 'manager' : 'employee';
    const user = await authService.register({ name, email, password, role: userRole });
    res.status(201).json(user);
  } catch (error: any) {
    console.error('Registration error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

const registerManager = async (req: Request, res: Response) => {
  try {
    const user = await authService.register({ ...req.body, role: 'manager' });
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

export default { register, login, getMe, registerManager };
