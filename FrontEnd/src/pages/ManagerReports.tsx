import React, { useState, useEffect } from 'react';
import { getAllAttendances, getTeamSummary, exportCsv } from '../services/attendanceService';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import moment from 'moment';
import { saveAs } from 'file-saver';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

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

const ManagerReports: React.FC = () => {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [startDate, setStartDate] = useState(moment().subtract(30, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
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
        filterByDateRange(attendanceRes.data, startDate, endDate);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    filterByDateRange(attendances, startDate, endDate);
  }, [startDate, endDate, attendances]);

  const filterByDateRange = (data: AttendanceRecord[], start: string, end: string) => {
    const filtered = data.filter(a => {
      const date = moment(a.date);
      return date.isSameOrAfter(moment(start)) && date.isSameOrBefore(moment(end));
    });
    setFilteredAttendances(filtered);
  };

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

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportCsv();
      const blob = new Blob([response.data], { type: 'text/csv' });
      saveAs(blob, `team_attendance_${startDate}_to_${endDate}.csv`);
    } catch (error) {
      console.error('Export failed', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const stats = {
      present: 0,
      late: 0,
      halfDay: 0,
      totalHours: 0
    };

    filteredAttendances.forEach(record => {
      const status = getStatus(record);
      if (status === 'present') stats.present++;
      else if (status === 'late') stats.late++;
      else if (status === 'half-day') stats.halfDay++;
      stats.totalHours += parseFloat(record.workDuration) || 0;
    });

    return stats;
  };

  const stats = calculateStats();

  // Chart data for attendance distribution
  const attendanceDistributionData = {
    labels: ['Present', 'Late', 'Half Day'],
    datasets: [{
      data: [stats.present, stats.late, stats.halfDay],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(249, 115, 22, 0.8)',
      ],
      borderColor: [
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(249, 115, 22)',
      ],
      borderWidth: 2,
    }],
  };

  // Calculate daily attendance for line chart
  const getDailyAttendance = () => {
    const dailyMap = new Map<string, number>();
    
    filteredAttendances.forEach(record => {
      const dateStr = moment(record.date).format('MMM D');
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
    });
    
    const sortedDates = Array.from(dailyMap.entries()).sort((a, b) => 
      moment(a[0], 'MMM D').diff(moment(b[0], 'MMM D'))
    );
    
    return {
      labels: sortedDates.map(([date]) => date),
      data: sortedDates.map(([, count]) => count)
    };
  };

  const dailyData = getDailyAttendance();

  const dailyAttendanceData = {
    labels: dailyData.labels,
    datasets: [{
      label: 'Daily Attendance',
      data: dailyData.data,
      fill: true,
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      borderColor: 'rgb(79, 70, 229)',
      tension: 0.4,
      pointBackgroundColor: 'rgb(79, 70, 229)',
    }],
  };

  // Calculate employee work hours for bar chart
  const getEmployeeWorkHours = () => {
    const employeeMap = new Map<string, number>();
    
    filteredAttendances.forEach(record => {
      const hours = parseFloat(record.workDuration) || 0;
      employeeMap.set(record.User.name, (employeeMap.get(record.User.name) || 0) + hours);
    });
    
    const sorted = Array.from(employeeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    return {
      labels: sorted.map(([name]) => name),
      data: sorted.map(([, hours]) => Math.round(hours * 10) / 10)
    };
  };

  const employeeData = getEmployeeWorkHours();

  const employeeWorkHoursData = {
    labels: employeeData.labels,
    datasets: [{
      label: 'Total Work Hours',
      data: employeeData.data,
      backgroundColor: 'rgba(79, 70, 229, 0.7)',
      borderColor: 'rgb(79, 70, 229)',
      borderWidth: 1,
      borderRadius: 6,
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
        <h2>📊 Reports & Analytics</h2>
        <button 
          className="btn btn-primary" 
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : '📥 Export CSV'}
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📅 Date Range</span>
        </div>
        <div className="filters">
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="filter-group quick-filters">
            <label>Quick Select</label>
            <div className="btn-group">
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setStartDate(moment().subtract(7, 'days').format('YYYY-MM-DD'));
                  setEndDate(moment().format('YYYY-MM-DD'));
                }}
              >
                Last 7 Days
              </button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setStartDate(moment().subtract(30, 'days').format('YYYY-MM-DD'));
                  setEndDate(moment().format('YYYY-MM-DD'));
                }}
              >
                Last 30 Days
              </button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setStartDate(moment().startOf('month').format('YYYY-MM-DD'));
                  setEndDate(moment().endOf('month').format('YYYY-MM-DD'));
                }}
              >
                This Month
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon total">📋</div>
          <div className="stat-content">
            <h3>{filteredAttendances.length}</h3>
            <p>Total Records</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon present">✓</div>
          <div className="stat-content">
            <h3>{stats.present}</h3>
            <p>On-Time Entries</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon late">⏰</div>
          <div className="stat-content">
            <h3>{stats.late}</h3>
            <p>Late Entries</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon hours">⏱</div>
          <div className="stat-content">
            <h3>{Math.round(stats.totalHours)}</h3>
            <p>Total Work Hours</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>📈 Daily Attendance Trend</h3>
          <div className="chart-wrapper">
            <Line data={dailyAttendanceData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-card">
          <h3>🥧 Attendance Distribution</h3>
          <div className="chart-wrapper doughnut-chart">
            <Doughnut data={attendanceDistributionData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="chart-card full-width">
        <h3>👥 Top Employees by Work Hours</h3>
        <div className="chart-wrapper bar-chart">
          <Bar data={employeeWorkHoursData} options={barOptions} />
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <span className="card-title">📋 Detailed Report Data</span>
          <span className="record-count">{filteredAttendances.length} records</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Status</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendances.slice(0, 20).map((record) => {
                const status = getStatus(record);
                return (
                  <tr key={record.id}>
                    <td>
                      <div className="employee-info">
                        <div className="employee-avatar">
                          {record.User.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{record.User.name}</span>
                      </div>
                    </td>
                    <td>{moment(record.date).format('MMM D, YYYY')}</td>
                    <td>
                      <span className={`status-badge status-${status}`}>
                        {status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>{moment(record.checkInTime).format('h:mm A')}</td>
                    <td>{record.checkOutTime ? moment(record.checkOutTime).format('h:mm A') : '-'}</td>
                    <td>{record.workDuration || '-'} hrs</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAttendances.length > 20 && (
            <div className="table-footer">
              <p>Showing 20 of {filteredAttendances.length} records. Export to CSV for complete data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerReports;
