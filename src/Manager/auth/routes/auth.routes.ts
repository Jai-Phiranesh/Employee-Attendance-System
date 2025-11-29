import { Router } from 'express';
import { managerAuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', managerAuthController.register);
router.post('/login', managerAuthController.login);

export const managerAuthRoutes = router;
