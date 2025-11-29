import { Request, Response } from 'express';
import attendanceService from '../services/attendance.service';

class AttendanceController {
  async checkIn(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.id;
      const attendance = await attendanceService.checkIn(userId);
      res.status(201).json(attendance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async checkOut(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.id;
      const attendance = await attendanceService.checkOut(userId);
      res.json(attendance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.id;
      const history = await attendanceService.getHistory(userId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getTodayStatus(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.id;
      const status = await attendanceService.getTodayStatus(userId);
      res.json(status || { message: 'Not checked in today' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getSummary(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.id;
      const summary = await attendanceService.getSummary(userId);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new AttendanceController();
