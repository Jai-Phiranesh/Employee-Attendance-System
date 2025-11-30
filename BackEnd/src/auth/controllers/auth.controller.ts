/**
 * Auth Controller
 * Handles incoming HTTP requests for authentication (register/login/me)
 */
import { Request, Response } from 'express';
import authService from '../services/auth.service';

const register = async (req: Request, res: Response) => {
  try {
    console.log('Registration request received:', { ...req.body, password: '[HIDDEN]' });
    const { name, email, password, role, employeeId, department } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    
    // Allow role to be 'employee' or 'manager', default to 'employee'
    const userRole = role === 'manager' ? 'manager' : 'employee';
    const user = await authService.register({ name, email, password, role: userRole, employeeId, department });
    res.status(201).json({ success: true, data: user, message: 'Registration successful' });
  } catch (error: any) {
    console.error('Registration error:', error.message);
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

const registerManager = async (req: Request, res: Response) => {
  try {
    const { name, email, password, employeeId, department } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    
    const user = await authService.register({ name, email, password, role: 'manager', employeeId, department });
    res.status(201).json({ success: true, data: user, message: 'Manager registration successful' });
  } catch (error: any) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const { token, user } = await authService.login(email, password);
    res.status(200).json({ success: true, data: { token, user }, message: 'Login successful' });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(401).json({ success: false, message: error.message });
  }
};

const getMe = async (req: Request, res: Response) => {
  try {
    // `req.user` is set by auth middleware
    // @ts-ignore
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
    }
    const user = await authService.getMe(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default { register, login, getMe, registerManager };
