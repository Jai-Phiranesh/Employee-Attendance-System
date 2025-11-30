import { Request, Response } from 'express';
import attendanceService from '../services/attendance.service';

class AttendanceController {
  async checkIn(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const attendance = await attendanceService.checkIn(userId);
      res.status(201).json({ success: true, data: attendance, message: 'Check-in successful' });
    } catch (error: any) {
      if (error.message.includes('already checked in')) {
        return res.status(409).json({ success: false, message: error.message });
      }
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async checkOut(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const attendance = await attendanceService.checkOut(userId);
      res.status(200).json({ success: true, data: attendance, message: 'Check-out successful' });
    } catch (error: any) {
      if (error.message.includes('not checked in') || error.message.includes('No active')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const history = await attendanceService.getHistory(userId);
      res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getTodayStatus(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const status = await attendanceService.getTodayStatus(userId);
      res.status(200).json({ success: true, data: status, message: status ? 'Status retrieved' : 'Not checked in today' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSummary(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const summary = await attendanceService.getSummary(userId);
      res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new AttendanceController();
