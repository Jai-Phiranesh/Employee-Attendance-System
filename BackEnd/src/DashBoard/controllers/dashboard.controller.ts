import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

class DashboardController {
  async getEmployeeDashboard(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized - User ID not found in token' });
      }
      const dashboardData = await dashboardService.getEmployeeDashboard(userId);
      res.status(200).json({ success: true, data: dashboardData });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getManagerDashboard(req: Request, res: Response) {
    try {
      const dashboardData = await dashboardService.getManagerDashboard();
      res.status(200).json({ success: true, data: dashboardData });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const dashboardController = new DashboardController();
