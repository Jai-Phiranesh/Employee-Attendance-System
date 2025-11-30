import { User, Attendance } from '../../models';
import { Op, fn, col, literal } from 'sequelize';

class DashboardService {
  async getEmployeeDashboard(userId: number) {
    const today = new Date();
    // Use local date format to avoid timezone issues
    const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    // 1. Get the most recent uncompleted attendance (any day, not just today)
    const activeAttendance = await Attendance.findOne({
      where: { 
        userId, 
        checkOutTime: { [Op.eq]: null as any }
      },
      order: [['createdAt', 'DESC']]
    });

    // 2. Today's attendance (for display purposes)
    const todayAttendance = await Attendance.findOne({
      where: { userId, date: todayStr },
      order: [['createdAt', 'DESC']]
    });

    // Use active attendance if exists, otherwise today's attendance
    const currentAttendance = activeAttendance || todayAttendance;
    
    const todayStatus = currentAttendance
      ? ((currentAttendance as any).checkOutTime ? 'Checked-out' : 'Checked-in')
      : 'Not Checked-in';

    // 2. This month's stats
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    // Use local date format
    const startOfMonthStr = startOfMonth.toLocaleDateString('en-CA');
    const endOfMonthStr = endOfMonth.toLocaleDateString('en-CA');
    
    const monthAttendances = await Attendance.findAll({
      where: { userId, date: { [Op.between]: [startOfMonthStr, endOfMonthStr] } },
    });

    // Count total present days (all attendance records)
    const presentDays = monthAttendances.length;
    
    // Calculate total days in month up to today (ALL days including weekends)
    let totalDaysInMonth = 0;
    const current = new Date(startOfMonth);
    const todayDate = new Date();
    todayDate.setHours(23, 59, 59, 999);
    while (current <= todayDate && current <= endOfMonth) {
      totalDaysInMonth++;
      current.setDate(current.getDate() + 1);
    }
    
    // Absent = total days - present days
    const absentDays = Math.max(0, totalDaysInMonth - presentDays);
    const totalHours = monthAttendances.reduce((sum, record) => {
      const value = (record as any).get ? (record as any).get('totalHours') : (record as any).totalHours;
      return sum + (Number(value) || 0);
    }, 0);

    // Calculate late arrivals (checked in after 9 AM)
    const lateDays = monthAttendances.filter((record: any) => {
      if (!record.checkInTime) return false;
      const checkInTime = new Date(record.checkInTime);
      return checkInTime.getHours() >= 9;
    }).length;

    // 3. Recent attendance (last 30 days for better history)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toLocaleDateString('en-CA');
    
    const recentAttendance = await Attendance.findAll({
      where: { userId, date: { [Op.gte]: thirtyDaysAgoStr } },
      order: [['date', 'DESC']],
    });

    // Format attendance history with workDuration
    const attendanceHistory = recentAttendance.map((record: any) => ({
      id: record.id,
      date: record.date,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
      workDuration: record.totalHours ? record.totalHours.toFixed(2) : null,
      status: record.status
    }));

    return {
      todayStatus,
      today: currentAttendance ? {
        id: (currentAttendance as any).id,
        date: (currentAttendance as any).date,
        checkInTime: (currentAttendance as any).checkInTime,
        checkOutTime: (currentAttendance as any).checkOutTime,
        workDuration: (currentAttendance as any).totalHours ? (currentAttendance as any).totalHours.toFixed(2) : null,
      } : null,
      monthSummary: {
        present: presentDays,
        absent: absentDays,
        late: lateDays,
        totalHours: totalHours.toFixed(2),
      },
      recentAttendance,
      attendanceHistory,
    };
  }

  async getManagerDashboard() {
    const today = new Date();
    // Use local date string format to avoid timezone issues
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // 1. Total employees (EXCLUDE managers)
    const totalEmployees = await User.count({
      where: { role: 'employee' }
    });

    // 2. Today's attendance for employees only
    const todayAttendances = await Attendance.findAll({
      where: { date: todayStr },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }],
    }) as any[];

    // Filter to only count employees (not managers)
    const employeeAttendances = todayAttendances.filter((att: any) => att.User?.role === 'employee');
    const presentTodayCount = employeeAttendances.length;
    
    // Count late arrivals (check-in after 9 AM)
    const lateTodayCount = employeeAttendances.filter((att: any) => {
      if (!att.checkInTime) return false;
      const checkInTime = new Date(att.checkInTime);
      return checkInTime.getHours() >= 9;
    }).length;

    const absentTodayCount = Math.max(0, totalEmployees - presentTodayCount);

    // 3. Get all attendances with user info (employees only, exclude managers)
    const allAttendance = await Attendance.findAll({
      include: [{ 
        model: User, 
        attributes: ['id', 'name', 'email', 'role'],
        where: { role: 'employee' }  // Only include employees
      }],
      order: [['date', 'DESC']],
      limit: 50
    });

    // 4. Team work duration - aggregate by user
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    const recentAttendances = await Attendance.findAll({
      where: { 
        date: { [Op.gte]: sevenDaysAgoStr } 
      },
      include: [{ 
        model: User, 
        attributes: ['id', 'name', 'email'],
        where: { role: 'employee' }  // Only include employees
      }],
    });

    // Group by user for team work duration
    const userWorkMap = new Map<number, { name: string; totalHours: number }>();
    recentAttendances.forEach((att: any) => {
      const userId = att.userId;
      const userName = att.User?.name || 'Unknown';
      const hours = parseFloat(att.totalHours) || 0;
      
      if (userWorkMap.has(userId)) {
        userWorkMap.get(userId)!.totalHours += hours;
      } else {
        userWorkMap.set(userId, { name: userName, totalHours: hours });
      }
    });

    const teamWorkDuration = Array.from(userWorkMap.values()).map(u => ({
      name: u.name,
      totalWorkDuration: u.totalHours.toFixed(2)
    }));

    // 5. List of absent employees today
    const presentUserIds = (await Attendance.findAll({
        where: { date: todayStr },
        attributes: ['userId'],
        raw: true
    })).map((a: any) => a.userId);

    const absentEmployees = presentUserIds.length > 0 
      ? await User.findAll({
          where: {
            id: { [Op.notIn]: presentUserIds },
            role: 'employee'  // Only employees
          },
          attributes: ['id', 'name', 'email']
        })
      : await User.findAll({ 
          where: { role: 'employee' },
          attributes: ['id', 'name', 'email'] 
        });

    return {
      summary: {
        totalEmployees,
        presentToday: presentTodayCount,
        absentToday: absentTodayCount,
        lateToday: lateTodayCount,
      },
      allAttendance,
      teamWorkDuration,
      absentEmployeesToday: absentEmployees,
    };
  }

  private getWorkingDays(start: Date, end: Date) {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) { // Exclude Sunday and Saturday
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    return count;
  }
}

export const dashboardService = new DashboardService();
