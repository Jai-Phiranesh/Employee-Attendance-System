import React, { useState, useEffect } from 'react';
import { getAllAttendances, getTeamSummary } from '../services/attendanceService';
import moment from 'moment';

interface AttendanceRecord {
  id: number;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  workDuration: string;
  User: {
    id: number;
    name: string;
    email: string;
  };
}

interface EmployeeData {
  id: number;
  name: string;
  attendanceMap: Map<string, string>;
}

const ManagerTeamCalendar: React.FC = () => {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [teamSummary, setTeamSummary] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceRes, summaryRes] = await Promise.all([
          getAllAttendances(),
          getTeamSummary()
        ]);
        setAttendances(attendanceRes.data);
        setTeamSummary(summaryRes.data);
        processEmployeeData(attendanceRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatus = (record: AttendanceRecord): string => {
    const checkInTime = moment(record.checkInTime);
    const nineAM = moment(record.date).set({ hour: 9, minute: 0, second: 0 });
    const duration = parseFloat(record.workDuration) || 0;
    
    if (checkInTime.isAfter(nineAM)) {
      if (duration < 4 && record.checkOutTime) {
        return 'half-day';
      }
      return 'late';
    }
    return 'present';
  };

  const processEmployeeData = (data: AttendanceRecord[]) => {
    const employeeMap = new Map<number, EmployeeData>();
    
    data.forEach(record => {
      if (!employeeMap.has(record.User.id)) {
        employeeMap.set(record.User.id, {
          id: record.User.id,
          name: record.User.name,
          attendanceMap: new Map()
        });
      }
      
      const employee = employeeMap.get(record.User.id)!;
      const dateStr = moment(record.date).format('YYYY-MM-DD');
      employee.attendanceMap.set(dateStr, getStatus(record));
    });
    
    setEmployees(Array.from(employeeMap.values()));
  };

  const getDaysInMonth = (): moment.Moment[] => {
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const days: moment.Moment[] = [];
    
    let day = startOfMonth.clone();
    while (day.isSameOrBefore(endOfMonth)) {
      days.push(day.clone());
      day.add(1, 'day');
    }
    
    return days;
  };

  const days = getDaysInMonth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>📅 Team Calendar View</h2>
      </div>

      {/* Summary Stats */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon total">👥</div>
          <div className="stat-content">
            <h3>{teamSummary?.totalEmployees || employees.length}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon present">✓</div>
          <div className="stat-content">
            <h3>{teamSummary?.presentToday || 0}</h3>
            <p>Present Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon absent">✕</div>
          <div className="stat-content">
            <h3>{teamSummary?.onLeaveToday || 0}</h3>
            <p>Absent Today</p>
          </div>
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color present"></span>
          <span>Present</span>
        </div>
        <div className="legend-item">
          <span className="legend-color absent"></span>
          <span>Absent</span>
        </div>
        <div className="legend-item">
          <span className="legend-color late"></span>
          <span>Late</span>
        </div>
        <div className="legend-item">
          <span className="legend-color half-day"></span>
          <span>Half Day</span>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="calendar-container">
        <div className="calendar-header">
          <h3>{currentMonth.format('MMMM YYYY')}</h3>
          <div className="calendar-nav">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))}
            >
              ← Prev
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setCurrentMonth(moment())}
            >
              This Month
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Team Calendar Grid */}
        <div className="team-calendar-wrapper">
          <table className="team-calendar-table">
            <thead>
              <tr>
                <th className="employee-column">Employee</th>
                {days.map(day => (
                  <th 
                    key={day.format('YYYY-MM-DD')} 
                    className={`day-column ${day.isSame(moment(), 'day') ? 'today' : ''} ${day.day() === 0 || day.day() === 6 ? 'weekend' : ''}`}
                  >
                    <div className="day-header">
                      <span className="day-name">{day.format('ddd')}</span>
                      <span className="day-number">{day.format('D')}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map(employee => (
                  <tr key={employee.id}>
                    <td className="employee-column">
                      <div className="employee-info">
                        <div className="employee-avatar">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{employee.name}</span>
                      </div>
                    </td>
                    {days.map(day => {
                      const dateStr = day.format('YYYY-MM-DD');
                      const status = employee.attendanceMap.get(dateStr);
                      const isWeekend = day.day() === 0 || day.day() === 6;
                      const isToday = day.isSame(moment(), 'day');
                      const isFuture = day.isAfter(moment(), 'day');
                      
                      return (
                        <td 
                          key={dateStr} 
                          className={`day-cell ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}`}
                        >
                          {!isFuture && (
                            <>
                              {status ? (
                                <div className={`attendance-indicator ${status}`} title={status}>
                                  {status === 'present' && '✓'}
                                  {status === 'late' && '⏰'}
                                  {status === 'half-day' && '½'}
                                </div>
                              ) : (
                                <div className={`attendance-indicator ${isWeekend ? 'weekend-indicator' : 'absent'}`} title={isWeekend ? 'holiday' : 'absent'}>
                                  {isWeekend ? '-' : '✕'}
                                </div>
                              )}
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={days.length + 1} className="empty-state">
                    <p>No employee data found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerTeamCalendar;
