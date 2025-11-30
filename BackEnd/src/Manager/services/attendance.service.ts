import { User, Attendance } from '../../models';
import { Parser } from 'json2csv';
import { Op } from 'sequelize';

class ManagerAttendanceService {
  async getAllAttendances() {
    return await Attendance.findAll({
      include: [{ 
        model: User, 
        attributes: ['id', 'name', 'email', 'department', 'employeeId'],
        where: { role: 'employee' }  // Only include employees, exclude managers
      }],
      order: [['date', 'DESC']],
    });
  }

  async getEmployeeAttendance(employeeId: number) {
    return await Attendance.findAll({
      where: { userId: employeeId },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'department', 'employeeId'] }],
      order: [['date', 'DESC']],
    });
  }

  async getTeamSummary() {
    const today = new Date();
    // Use local date string format to avoid timezone issues
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    // Count total employees (EXCLUDE managers)
    const totalEmployees = await User.count({
      where: { role: 'employee' }
    });
    
    // Get today's attendance for employees only
    const todayAttendances = await Attendance.findAll({
      where: { date: todayStr },
      include: [{ model: User, attributes: ['id', 'role', 'department'] }]
    }) as any[];
    
    const employeeAttendances = todayAttendances.filter((att: any) => att.User?.role === 'employee');
    const presentToday = employeeAttendances.length;
    
    // Count late arrivals (after 9 AM)
    const lateToday = employeeAttendances.filter((att: any) => {
      if (!att.checkInTime) return false;
      const checkInTime = new Date(att.checkInTime);
      return checkInTime.getHours() >= 9;
    }).length;

    // Get employees with their attendance (exclude managers)
    const users = await User.findAll({
        where: { role: 'employee' },
        include: [{ model: Attendance }]
    });

    const teamMembers = users.map((user: any) => {
        const attendances = user.Attendances || [];
        const totalHours = attendances.reduce((acc: number, record: any) => acc + (parseFloat(record.totalHours) || 0), 0);
        const averageHours = attendances.length > 0 ? totalHours / attendances.length : 0;
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            totalDays: attendances.length,
            totalHours: totalHours.toFixed(2),
            averageHours: averageHours.toFixed(2)
        };
    });

    return {
      totalEmployees,
      presentToday,
      absentToday: Math.max(0, totalEmployees - presentToday),
      lateToday,
      teamMembers
    };
  }

  async exportCsv() {
    const allAttendance = await this.getAllAttendances();
    const records = allAttendance.map((a: any) => {
      const data = a.toJSON();
      return {
        'User ID': data.User?.id || '',
        'Name': data.User?.name || '',
        'Email': data.User?.email || '',
        'Date': data.date || '',
        'Check In Time': data.checkInTime ? new Date(data.checkInTime).toLocaleString() : '',
        'Check Out Time': data.checkOutTime ? new Date(data.checkOutTime).toLocaleString() : '',
        'Total Hours': data.totalHours ? parseFloat(data.totalHours).toFixed(2) : '0.00'
      };
    });
    const fields = ['User ID', 'Name', 'Email', 'Date', 'Check In Time', 'Check Out Time', 'Total Hours'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(records);
    return csv;
  }

  async getTodayStatus() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAttendances = await Attendance.findAll({
        where: {
            checkInTime: {
                [Op.gte]: today,
                [Op.lt]: tomorrow
            }
        },
        include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });

    const employees = await User.findAll({ where: { role: 'employee' } });

    const status = employees.map((employee: any) => {
        const attendanceRecord = todaysAttendances.find((att: any) => att.userId === employee.id);
        const checkIn = attendanceRecord ? (attendanceRecord as any).checkInTime : undefined;
        const checkOut = attendanceRecord ? (attendanceRecord as any).checkOutTime : undefined;
        const totalHours = attendanceRecord ? (attendanceRecord as any).totalHours : undefined;
        return {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            status: attendanceRecord ? (checkOut ? 'Checked-out' : 'Checked-in') : 'Absent',
            checkIn,
            checkOut,
            totalHours
        };
    });

    return status;
  }

  // Get all unique departments from database
  async getAllDepartments() {
    const users = await User.findAll({
      attributes: ['department'],
      group: ['department'],
      raw: true
    }) as any[];
    
    // Extract unique departments and filter out empty/null values
    const departments = users
      .map((u: any) => u.department)
      .filter((dept: string | null) => dept && dept.trim() !== '')
      .sort();
    
    return departments;
  }
}

export const managerAttendanceService = new ManagerAttendanceService();
