import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

class DashboardController {
  async getEmployeeDashboard(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({ message: 'User ID not found in token' });
      }
      const dashboardData = await dashboardService.getEmployeeDashboard(userId);
      res.json(dashboardData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getManagerDashboard(req: Request, res: Response) {
    try {
      const dashboardData = await dashboardService.getManagerDashboard();
      res.json(dashboardData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const dashboardController = new DashboardController();
