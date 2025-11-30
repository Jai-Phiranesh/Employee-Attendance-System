import { Router } from 'express';
import { managerAttendanceController } from '../controllers/attendance.controller';
import authMiddleware from '../../middleware/auth.middleware';
import { managerMiddleware } from '../../middleware/manager.middleware';

const router = Router();

router.get('/all', authMiddleware, managerMiddleware, managerAttendanceController.getAllAttendances);
router.get('/departments', authMiddleware, managerMiddleware, managerAttendanceController.getAllDepartments);
router.get('/employee/:id', authMiddleware, managerMiddleware, managerAttendanceController.getEmployeeAttendance);
router.get('/summary', authMiddleware, managerMiddleware, managerAttendanceController.getTeamSummary);
router.get('/export', authMiddleware, managerMiddleware, managerAttendanceController.exportCsv);
router.get('/today-status', authMiddleware, managerMiddleware, managerAttendanceController.getTodayStatus);

export const managerAttendanceRoutes = router;
