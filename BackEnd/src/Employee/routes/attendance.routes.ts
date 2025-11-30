import { Router } from 'express';
import attendanceController from '../controllers/attendance.controller';
import authMiddleware from '../../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut);
router.get('/my-history', attendanceController.getHistory);
router.get('/my-summary', attendanceController.getSummary);
router.get('/today', attendanceController.getTodayStatus);

export default router;
