import { Attendance } from '../../models';
import { Op } from 'sequelize';

class AttendanceService {
  async checkIn(userId: number) {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already checked in
    const existingAttendance = await Attendance.findOne({
      where: {
        userId,
        date: today
      }
    }) as any;

    if (existingAttendance) {
      throw new Error('Already checked in for today');
    }

    const attendance = await Attendance.create({
      userId,
      date: today,
      checkInTime: new Date(),
      status: 'Present'
    });

    return attendance;
  }

  async checkOut(userId: number) {
    const today = new Date().toISOString().split('T')[0];
    
    const attendance = await Attendance.findOne({
      where: {
        userId,
        date: today
      }
    }) as any;

    if (!attendance) {
      throw new Error('No check-in record found for today');
    }

    if (attendance.checkOutTime) {
       throw new Error('Already checked out');
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.checkInTime);
    const durationMs = checkOutTime.getTime() - checkInTime.getTime();
    const totalHours = durationMs / (1000 * 60 * 60);

    await attendance.update({
      checkOutTime,
      totalHours: parseFloat(totalHours.toFixed(2)),
      status: 'Present'
    });

    return attendance;
  }

  async getHistory(userId: number) {
    return await Attendance.findAll({
      where: { userId },
      order: [['date', 'DESC']]
    });
  }

  async getTodayStatus(userId: number) {
    const today = new Date().toISOString().split('T')[0];
    return await Attendance.findOne({
      where: { userId, date: today }
    });
  }
  
  async getSummary(userId: number) {
     const today = new Date();
     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
     const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

     const attendances = await Attendance.findAll({
        where: {
            userId,
            date: {
                [Op.between]: [startOfMonth, endOfMonth]
            }
        }
     }) as any[];
     
     const totalDays = attendances.length;
     const totalHours = attendances.reduce((sum, record) => sum + (record.totalHours || 0), 0);
     
     return {
         month: today.toLocaleString('default', { month: 'long' }),
         year: today.getFullYear(),
         totalDays,
         totalHours: parseFloat(totalHours.toFixed(2))
     };
  }
}

export default new AttendanceService();
