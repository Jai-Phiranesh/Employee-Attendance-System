import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import authMiddleware from '../../middleware/auth.middleware';
import { managerMiddleware } from '../../middleware/manager.middleware';

const router = Router();

router.get('/employee', authMiddleware, dashboardController.getEmployeeDashboard);
router.get('/manager', authMiddleware, managerMiddleware, dashboardController.getManagerDashboard);

export const dashboardRoutes = router;
