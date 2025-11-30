import React, { useState, useEffect } from 'react';
import { getMyHistory, getMySummary } from '../services/attendanceService';
import moment from 'moment';
import { toast } from 'react-toastify';

interface AttendanceRecord {
  id: number;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  workDuration: string;
  status?: string;
}

interface Summary {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalHalfDay: number;
  totalWorkHours: string;
}

const AttendanceHistory: React.FC = () => {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, summaryRes] = await Promise.all([
          getMyHistory(),
          getMySummary()
        ]);
        setHistory(historyRes.data?.data || historyRes.data);
        setSummary(summaryRes.data?.data || summaryRes.data);
      } catch (error) {
        console.error('Failed to fetch attendance data', error);
        toast.error('Failed to load attendance history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusForDate = (date: moment.Moment): string | null => {
    const dateStr = date.format('YYYY-MM-DD');
    const record = history.find(r => moment(r.date).format('YYYY-MM-DD') === dateStr);
    const isWeekend = date.day() === 0 || date.day() === 6; // Sunday or Saturday
    const isFuture = date.isAfter(moment(), 'day');
    
    // Don't show status for future dates
    if (isFuture) return null;
    
    if (record) {
      // Check if it's a late check-in (after 9 AM)
      const checkInTime = moment(record.checkInTime);
      const nineAM = moment(record.date).set({ hour: 9, minute: 0, second: 0 });
      
      if (checkInTime.isAfter(nineAM)) {
        // Check work duration for half day (less than 4 hours)
        const duration = parseFloat(record.workDuration) || 0;
        if (duration < 4 && record.checkOutTime) {
          return 'half-day';
        }
        return 'late';
      }
      
      return 'present';
    }
    
    // No record - check if weekend (holiday) or absent
    if (isWeekend) {
      return 'holiday';
    }
    
    return 'absent';
  };

  const getRecordForDate = (date: moment.Moment): AttendanceRecord | null => {
    const dateStr = date.format('YYYY-MM-DD');
    return history.find(r => moment(r.date).format('YYYY-MM-DD') === dateStr) || null;
  };

  const renderCalendar = () => {
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');

    const days: JSX.Element[] = [];
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Day headers
    dayHeaders.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="calendar-day-header">
          {day}
        </div>
      );
    });

    // Calendar days
    let day = startDate.clone();
    while (day.isSameOrBefore(endDate)) {
      const currentDay = day.clone();
      const isCurrentMonth = day.month() === currentMonth.month();
      const isToday = day.isSame(moment(), 'day');
      const status = isCurrentMonth ? getStatusForDate(currentDay) : null;
      const isSelected = selectedDate === currentDay.format('YYYY-MM-DD');

      days.push(
        <div
          key={day.format('YYYY-MM-DD')}
          className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${status || ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedDate(currentDay.format('YYYY-MM-DD'))}
        >
          {day.date()}
        </div>
      );
      day.add(1, 'day');
    }

    return days;
  };

  const selectedRecord = selectedDate ? getRecordForDate(moment(selectedDate)) : null;

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
        <h2>📅 Attendance History</h2>
      </div>

      {/* Summary Stats */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon present">✓</div>
          <div className="stat-content">
            <h3>{summary?.totalPresent || 0}</h3>
            <p>Days Present</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon absent">✕</div>
          <div className="stat-content">
            <h3>{summary?.totalAbsent || 0}</h3>
            <p>Days Absent</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon late">⏰</div>
          <div className="stat-content">
            <h3>{summary?.totalLate || 0}</h3>
            <p>Late Arrivals</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon hours">⏱</div>
          <div className="stat-content">
            <h3>{summary?.totalWorkHours || '0'}</h3>
            <p>Total Hours</p>
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
        <div className="legend-item">
          <span className="legend-color holiday"></span>
          <span>Holiday</span>
        </div>
      </div>

      {/* Calendar */}
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
              Today
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))}
            >
              Next →
            </button>
          </div>
        </div>
        <div className="calendar-grid">
          {renderCalendar()}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <span className="card-title">
              📋 Details for {moment(selectedDate).format('MMMM D, YYYY')}
            </span>
          </div>
          {selectedRecord ? (
            <div className="selected-date-details">
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status-badge status-${getStatusForDate(moment(selectedDate)) || 'absent'}`}>
                  {getStatusForDate(moment(selectedDate))?.replace('-', ' ').toUpperCase() || 'ABSENT'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Check-in:</span>
                <span>{moment(selectedRecord.checkInTime).format('h:mm:ss A')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Check-out:</span>
                <span>{selectedRecord.checkOutTime ? moment(selectedRecord.checkOutTime).format('h:mm:ss A') : 'Not checked out'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Work Duration:</span>
                <span>{selectedRecord.workDuration || 'N/A'} hours</span>
              </div>
            </div>
          ) : (
            <div className="selected-date-details">
              {(() => {
                const status = getStatusForDate(moment(selectedDate));
                return (
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge status-${status || 'absent'}`}>
                      {status === 'holiday' ? '🏖️ HOLIDAY (Weekend)' : 'ABSENT'}
                    </span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Recent History Table */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <span className="card-title">📊 Recent Attendance Records</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.slice(0, 10).map((record) => {
                  const status = getStatusForDate(moment(record.date));
                  return (
                    <tr key={record.id}>
                      <td>{moment(record.date).format('MMM D, YYYY')}</td>
                      <td>
                        <span className={`status-badge status-${status || 'present'}`}>
                          {status?.replace('-', ' ').toUpperCase() || 'PRESENT'}
                        </span>
                      </td>
                      <td>{moment(record.checkInTime).format('h:mm A')}</td>
                      <td>{record.checkOutTime ? moment(record.checkOutTime).format('h:mm A') : '-'}</td>
                      <td>{record.workDuration || '-'} hrs</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>No attendance records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
