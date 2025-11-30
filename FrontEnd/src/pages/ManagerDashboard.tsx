import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getManagerDashboard, exportCsv, getTeamSummary } from '../services/attendanceService';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import moment from 'moment';
import { saveAs } from 'file-saver';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

const ManagerDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [teamSummary, setTeamSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [dashboardRes, summaryRes] = await Promise.all([
        getManagerDashboard(),
        getTeamSummary()
      ]);
      setDashboardData(dashboardRes.data);
      setTeamSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to fetch manager dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportCsv();
      const blob = new Blob([response.data], { type: 'text/csv' });
      saveAs(blob, `team_attendance_${moment().format('YYYY-MM-DD')}.csv`);
    } catch (error) {
      console.error('Export failed', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const summary = dashboardData?.summary || teamSummary || {};

  // Get stats directly from summary (backend now calculates correctly)
  const totalEmployees = summary.totalEmployees || 0;
  const presentToday = summary.presentToday || 0;
  const absentToday = summary.absentToday || 0;
  const lateToday = summary.lateToday || 0;

  // Team work duration bar chart
  const teamWorkData = {
    labels: dashboardData?.teamWorkDuration?.map((d: any) => d.name) || [],
    datasets: [{
      label: 'Total Work Hours',
      data: dashboardData?.teamWorkDuration?.map((d: any) => parseFloat(d.totalWorkDuration) || 0) || [],
      backgroundColor: 'rgba(79, 70, 229, 0.7)',
      borderColor: 'rgb(79, 70, 229)',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  // Attendance distribution doughnut chart
  const attendanceDistribution = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      data: [presentToday, absentToday, lateToday],
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

  // Daily attendance trend (from all attendance data)
  const getDailyTrend = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      last7Days.push(moment().subtract(i, 'days').format('YYYY-MM-DD'));
    }

    const dailyCounts = last7Days.map(date => {
      const count = dashboardData?.allAttendance?.filter((a: any) => 
        moment(a.date).format('YYYY-MM-DD') === date
      ).length || 0;
      return count;
    });

    return {
      labels: last7Days.map(d => moment(d).format('MMM D')),
      data: dailyCounts
    };
  };

  const trend = getDailyTrend();
  const dailyTrendData = {
    labels: trend.labels,
    datasets: [{
      label: 'Daily Attendance',
      data: trend.data,
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

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours'
        }
      }
    }
  };

  // Get recent attendance for table
  const recentAttendance = dashboardData?.allAttendance?.slice(0, 8) || [];

  return (
    <div>
      <div className="page-header">
        <h2>📊 Manager Dashboard</h2>
        <div className="header-actions">
          <span className="header-date">{moment().format('dddd, MMMM D, YYYY')}</span>
          <button 
            className="btn btn-primary" 
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? '⏳ Exporting...' : '📥 Export CSV'}
          </button>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="today-status manager-welcome">
        <h3>Welcome, {user?.name}!</h3>
        <div className="status">Team Overview</div>
        <div className="time-info">
          <div className="time-item">
            <span className="time-label">Total Team Members</span>
            <span className="time-value">{totalEmployees}</span>
          </div>
          <div className="time-item">
            <span className="time-label">Present Today</span>
            <span className="time-value">{presentToday}</span>
          </div>
          <div className="time-item">
            <span className="time-label">Absent Today</span>
            <span className="time-value">{absentToday}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon total">👥</div>
          <div className="stat-content">
            <h3>{totalEmployees}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon present">✓</div>
          <div className="stat-content">
            <h3>{presentToday}</h3>
            <p>Present Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon absent">✕</div>
          <div className="stat-content">
            <h3>{absentToday}</h3>
            <p>Absent Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon late">⏰</div>
          <div className="stat-content">
            <h3>{lateToday}</h3>
            <p>Late Today</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        <Link to="/manager/employees" className="quick-link-card">
          <span className="quick-link-icon">👥</span>
          <span className="quick-link-label">All Employees</span>
        </Link>
        <Link to="/manager/calendar" className="quick-link-card">
          <span className="quick-link-icon">📅</span>
          <span className="quick-link-label">Team Calendar</span>
        </Link>
        <Link to="/manager/reports" className="quick-link-card">
          <span className="quick-link-icon">📊</span>
          <span className="quick-link-label">Reports</span>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>📈 Attendance Trend (Last 7 Days)</h3>
          <div className="chart-wrapper">
            <Line data={dailyTrendData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-card">
          <h3>🥧 Today's Attendance</h3>
          <div className="chart-wrapper doughnut-chart">
            <Doughnut data={attendanceDistribution} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="chart-card full-width">
        <h3>👥 Team Work Hours (Total)</h3>
        <div className="chart-wrapper bar-chart">
          <Bar data={teamWorkData} options={barOptions} />
        </div>
      </div>

      {/* Recent Attendance Table */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <span className="card-title">📋 Recent Team Attendance</span>
          <Link to="/manager/employees" className="btn btn-outline btn-sm">
            View All →
          </Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.length > 0 ? (
                recentAttendance.map((record: any) => {
                  const checkInTime = moment(record.checkInTime);
                  const nineAM = moment(record.date).set({ hour: 9, minute: 0, second: 0 });
                  const isLate = checkInTime.isAfter(nineAM);
                  
                  return (
                    <tr key={record.id}>
                      <td>
                        <div className="employee-info">
                          <div className="employee-avatar">
                            {record.User?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span>{record.User?.name || 'Unknown'}</span>
                        </div>
                      </td>
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
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>No attendance records</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;

