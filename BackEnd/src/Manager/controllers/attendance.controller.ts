import { Request, Response } from 'express';
import { managerAttendanceService } from '../services/attendance.service';

class ManagerAttendanceController {
  constructor() {
    this.getAllAttendances = this.getAllAttendances.bind(this);
    this.getEmployeeAttendance = this.getEmployeeAttendance.bind(this);
    this.getTeamSummary = this.getTeamSummary.bind(this);
    this.exportCsv = this.exportCsv.bind(this);
    this.getTodayStatus = this.getTodayStatus.bind(this);
    this.getAllDepartments = this.getAllDepartments.bind(this);
  }

  async getAllAttendances(req: Request, res: Response) {
    try {
      const attendances = await managerAttendanceService.getAllAttendances();
      res.status(200).json({ success: true, data: attendances });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getEmployeeAttendance(req: Request, res: Response) {
    try {
      const employeeId = parseInt(req.params.id, 10);
      if (isNaN(employeeId)) {
        return res.status(400).json({ success: false, message: 'Invalid employee ID' });
      }
      const attendances = await managerAttendanceService.getEmployeeAttendance(employeeId);
      if (!attendances || attendances.length === 0) {
        return res.status(404).json({ success: false, message: 'No attendance records found for this employee' });
      }
      res.status(200).json({ success: true, data: attendances });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getTeamSummary(req: Request, res: Response) {
    try {
      const summary = await managerAttendanceService.getTeamSummary();
      res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async exportCsv(req: Request, res: Response) {
    try {
      const csv = await managerAttendanceService.exportCsv();
      res.status(200).header('Content-Type', 'text/csv');
      res.attachment('attendance.csv');
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getTodayStatus(req: Request, res: Response) {
    try {
        const status = await managerAttendanceService.getTodayStatus();
        res.status(200).json({ success: true, data: status });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllDepartments(req: Request, res: Response) {
    try {
      const departments = await managerAttendanceService.getAllDepartments();
      res.status(200).json({ success: true, data: departments });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const managerAttendanceController = new ManagerAttendanceController();
