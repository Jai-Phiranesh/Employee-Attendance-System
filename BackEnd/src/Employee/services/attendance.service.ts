import { Attendance } from '../../models';
import { Op } from 'sequelize';

class AttendanceService {
  async checkIn(userId: number) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    
    // Rule: Only one check-in per day
    const todayAttendance = await Attendance.findOne({
      where: {
        userId,
        date: today
      }
    }) as any;

    if (todayAttendance) {
      throw new Error('You have already checked in today. Only one check-in per day is allowed.');
    }

    // Determine status: Late if after 9 AM, Present if before
    const status = currentHour >= 9 ? 'Late' : 'Present';

    const attendance = await Attendance.create({
      userId,
      date: today,
      checkInTime: now,
      status
    });

    return attendance;
  }

  async checkOut(userId: number) {
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's attendance without checkout
    const attendance = await Attendance.findOne({
      where: {
        userId,
        date: today,
        checkOutTime: { [Op.eq]: null as any }
      }
    }) as any;

    if (!attendance) {
      throw new Error('No check-in found for today. Please check in first.');
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
     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
     const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
     // Use local date format to avoid timezone issues
     const startOfMonthStr = startOfMonth.toLocaleDateString('en-CA');
     const endOfMonthStr = endOfMonth.toLocaleDateString('en-CA');

     const attendances = await Attendance.findAll({
        where: {
            userId,
            date: {
                [Op.between]: [startOfMonthStr, endOfMonthStr]
            }
        }
     }) as any[];
     
     // Count total present days (all attendance records)
     const totalPresent = attendances.length;
     const totalHours = attendances.reduce((sum, record) => sum + (parseFloat(record.totalHours) || 0), 0);
     
     // Calculate late arrivals (after 9 AM)
     const totalLate = attendances.filter(record => {
       if (!record.checkInTime) return false;
       const checkInTime = new Date(record.checkInTime);
       return checkInTime.getHours() >= 9;
     }).length;

     // Calculate total days in month up to today (ALL days, including weekends)
     let totalDays = 0;
     const current = new Date(startOfMonth);
     const todayDate = new Date();
     todayDate.setHours(23, 59, 59, 999);
     while (current <= todayDate && current <= endOfMonth) {
       totalDays++;
       current.setDate(current.getDate() + 1);
     }
     
     // Absent = total days - present days
     const totalAbsent = Math.max(0, totalDays - totalPresent);
     
     return {
         month: today.toLocaleString('default', { month: 'long' }),
         year: today.getFullYear(),
         totalPresent,
         totalAbsent,
         totalLate,
         totalWorkHours: totalHours.toFixed(2)
     };
  }
}

export default new AttendanceService();
