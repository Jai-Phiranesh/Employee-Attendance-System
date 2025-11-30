import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getEmployeeDashboard, checkIn, checkOut, getMySummary } from '../services/attendanceService';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import moment from 'moment';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

interface Summary {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalWorkHours: string;
}

const EmployeeDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const fetchDashboard = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const [dashboardRes, summaryRes] = await Promise.all([
        getEmployeeDashboard(),
        getMySummary()
      ]);
      setDashboardData(dashboardRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, []);

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await checkIn();
      showMessage('success', '✓ Successfully checked in!');
      fetchDashboard();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Check-in failed. Please try again.';
      showMessage('error', msg);
      console.error('Check-in failed', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await checkOut();
      showMessage('success', '✓ Successfully checked out!');
      fetchDashboard();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Check-out failed. Please try again.';
      showMessage('error', msg);
      console.error('Check-out failed', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const todayStatus = dashboardData?.today;
  const isCheckedIn = !!todayStatus?.checkInTime;
  const isCheckedOut = !!todayStatus?.checkOutTime;

  // Doughnut chart for attendance overview
  const attendanceOverviewData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      data: [
        summary?.totalPresent || 0,
        summary?.totalAbsent || 0,
        summary?.totalLate || 0
      ],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
      ],
      borderColor: [
        'rgb(16, 185, 129)',
        'rgb(239, 68, 68)',
        'rgb(245, 158, 11)',
      ],
      borderWidth: 2,
    }],
  };

  // Line chart for work hours trend
  const recentHistory = dashboardData?.attendanceHistory?.slice(0, 7).reverse() || [];
  const workHoursTrendData = {
    labels: recentHistory.map((r: any) => moment(r.date).format('MMM D')),
    datasets: [{
      label: 'Work Hours',
      data: recentHistory.map((r: any) => parseFloat(r.workDuration) || 0),
      fill: true,
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      borderColor: 'rgb(79, 70, 229)',
      tension: 0.4,
      pointBackgroundColor: 'rgb(79, 70, 229)',
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const currentHour = new Date().getHours();
  const isLateCheckIn = currentHour >= 9;

  return (
    <div>
      <div className="page-header">
        <h2>👋 Welcome back, {user?.name}!</h2>
        <span className="header-date">{moment().format('dddd, MMMM D, YYYY')}</span>
      </div>

      {/* Attendance Rules */}
      <div className="rules-card">
        <h4>📋 Attendance Rules</h4>
        <ul>
          <li>✅ Check-in before <strong>9:00 AM</strong> = Present</li>
          <li>⚠️ Check-in after <strong>9:00 AM</strong> = Late</li>
          <li>✅ Only <strong>one check-in and one check-out</strong> per day</li>
          <li>✅ You must check-in before you can check-out</li>
        </ul>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Today's Status Card */}
      <div className="today-status">
        <h3>Today's Status</h3>
        <div className="status">
          {!isCheckedIn && isLateCheckIn && '⚠️ Late Check-in Available'}
          {!isCheckedIn && !isLateCheckIn && '⏰ Ready to Check In'}
          {isCheckedIn && !isCheckedOut && '🟢 Working'}
          {isCheckedIn && isCheckedOut && '✅ Day Complete'}
        </div>
        {todayStatus && (
          <div className="time-info">
            <div className="time-item">
              <span className="time-label">Check-in Time</span>
              <span className="time-value">
                {moment(todayStatus.checkInTime).format('h:mm:ss A')}
              </span>
            </div>
            {todayStatus.checkOutTime && (
              <>
                <div className="time-item">
                  <span className="time-label">Check-out Time</span>
                  <span className="time-value">
                    {moment(todayStatus.checkOutTime).format('h:mm:ss A')}
                  </span>
                </div>
                <div className="time-item">
                  <span className="time-label">Work Duration</span>
                  <span className="time-value">
                    {todayStatus.workDuration || '0'} hrs
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="attendance-actions">
        <button 
          className={`btn ${isLateCheckIn ? 'btn-warning' : 'btn-success'} check-btn`}
          onClick={handleCheckIn} 
          disabled={isCheckedIn || actionLoading}
          title={isLateCheckIn ? 'You will be marked as Late' : ''}
        >
          {actionLoading ? '⏳ Processing...' : isLateCheckIn ? '⚠️ Check In (Late)' : '🟢 Check In'}
        </button>
        <button 
          className="btn btn-danger check-btn" 
          onClick={handleCheckOut} 
          disabled={!isCheckedIn || isCheckedOut || actionLoading}
        >
          {actionLoading ? '⏳ Processing...' : '🔴 Check Out'}
        </button>
      </div>

      {isLateCheckIn && !isCheckedIn && (
        <div className="alert alert-warning" style={{ marginTop: '10px' }}>
          ⚠️ It's past 9:00 AM. Checking in now will mark you as <strong>Late</strong>.
        </div>
      )}

      {/* Stats Grid */}
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

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>📊 Attendance Overview</h3>
          <div className="chart-wrapper doughnut-chart">
            <Doughnut data={attendanceOverviewData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-card">
          <h3>📈 Work Hours (Last 7 Days)</h3>
          <div className="chart-wrapper">
            <Line data={workHoursTrendData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 Recent Attendance</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.attendanceHistory?.slice(0, 5).map((record: any) => {
                const checkInTime = moment(record.checkInTime);
                const nineAM = moment(record.date).set({ hour: 9, minute: 0, second: 0 });
                const isLate = checkInTime.isAfter(nineAM);
                
                return (
                  <tr key={record.id}>
                    <td>{moment(record.date).format('MMM D, YYYY')}</td>
                    <td>{moment(record.checkInTime).format('h:mm A')}</td>
                    <td>{record.checkOutTime ? moment(record.checkOutTime).format('h:mm A') : '-'}</td>
                    <td>{record.workDuration || '-'} hrs</td>
                    <td>
                      <span className={`status-badge ${isLate ? 'status-late' : 'status-present'}`}>
                        {isLate ? 'LATE' : 'ON TIME'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {(!dashboardData?.attendanceHistory || dashboardData.attendanceHistory.length === 0) && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>No attendance records yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

