import { Request, Response } from 'express';
import { managerAttendanceService } from '../services/attendance.service';

class ManagerAttendanceController {
  constructor() {
    this.getAllAttendances = this.getAllAttendances.bind(this);
    this.getEmployeeAttendance = this.getEmployeeAttendance.bind(this);
    this.getTeamSummary = this.getTeamSummary.bind(this);
    this.exportCsv = this.exportCsv.bind(this);
    this.getTodayStatus = this.getTodayStatus.bind(this);
  }

  async getAllAttendances(req: Request, res: Response) {
    try {
      const attendances = await managerAttendanceService.getAllAttendances();
      res.json(attendances);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getEmployeeAttendance(req: Request, res: Response) {
    try {
      const employeeId = parseInt(req.params.id, 10);
      const attendances = await managerAttendanceService.getEmployeeAttendance(employeeId);
      res.json(attendances);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getTeamSummary(req: Request, res: Response) {
    try {
      const summary = await managerAttendanceService.getTeamSummary();
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async exportCsv(req: Request, res: Response) {
    try {
      const csv = await managerAttendanceService.exportCsv();
      res.header('Content-Type', 'text/csv');
      res.attachment('attendance.csv');
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getTodayStatus(req: Request, res: Response) {
    try {
        const status = await managerAttendanceService.getTodayStatus();
        res.json(status);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
  }
}

export const managerAttendanceController = new ManagerAttendanceController();
