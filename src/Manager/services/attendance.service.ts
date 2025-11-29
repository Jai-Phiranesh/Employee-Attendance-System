import { User, Attendance } from '../../models';
import { Parser } from 'json2csv';
import { Op } from 'sequelize';

class ManagerAttendanceService {
  async getAllAttendances() {
    return await Attendance.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['date', 'DESC']],
    });
  }

  async getEmployeeAttendance(employeeId: number) {
    return await Attendance.findAll({
      where: { userId: employeeId },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['date', 'DESC']],
    });
  }

  async getTeamSummary() {
    const users = await User.findAll({
        where: { role: 'employee' },
        include: [{ model: Attendance, as: 'attendances' }]
    });

    return users.map((user: any) => {
        const totalHours = user.attendances.reduce((acc: number, record: any) => acc + record.totalHours, 0);
        const averageHours = user.attendances.length > 0 ? totalHours / user.attendances.length : 0;
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            totalDays: user.attendances.length,
            totalHours: totalHours.toFixed(2),
            averageHours: averageHours.toFixed(2)
        };
    });
  }

  async exportCsv() {
    const allAttendance = await this.getAllAttendances();
    const records = allAttendance.map((a: any) => a.toJSON());
    const fields = [
      { label: 'User ID', value: 'User.id' },
      { label: 'Name', value: 'User.name' },
      { label: 'Email', value: 'User.email' },
      'date',
      'checkInTime',
      'checkOutTime',
      'totalHours',
    ];
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
}

export const managerAttendanceService = new ManagerAttendanceService();
