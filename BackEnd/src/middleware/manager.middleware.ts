import { Request, Response, NextFunction } from 'express';

export const managerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  if (req.user && req.user.role === 'manager') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Access is restricted to managers.' });
  }
};
