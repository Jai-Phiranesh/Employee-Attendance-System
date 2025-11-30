import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { sequelize } from './models';
import authRoutes from './auth/routes/auth.routes';
import attendanceRoutes from './Employee/routes/attendance.routes';
import { managerAttendanceRoutes } from './Manager/routes/attendance.routes';
import { dashboardRoutes } from './DashBoard/routes/dashboard.routes';


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance', managerAttendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);


const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

async function start() {
  app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    try {
      await sequelize.authenticate();
      console.log('Database connected!');
      // Sync database tables
      await sequelize.sync({ alter: true });
      console.log('Database synced!');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  });
}

start();

export default app;
