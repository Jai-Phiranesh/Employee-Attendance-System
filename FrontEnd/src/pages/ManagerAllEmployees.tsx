import React, { useState, useEffect } from 'react';
import { getAllAttendances, getEmployeeAttendance, getDepartments } from '../services/attendanceService';
import moment from 'moment';
import { toast } from 'react-toastify';

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
    department?: string;
  };
}

const ManagerAllEmployees: React.FC = () => {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceRes, deptRes] = await Promise.all([
          getAllAttendances(),
          getDepartments()
        ]);
        const attendanceData = attendanceRes.data?.data || attendanceRes.data;
        const deptData = deptRes.data?.data || deptRes.data || [];
        setAttendances(attendanceData);
        setFilteredAttendances(attendanceData);
        setDepartments(deptData);
      } catch (error) {
        console.error('Failed to fetch data', error);
        toast.error('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    filterAttendances();
  }, [searchTerm, startDate, endDate, statusFilter, departmentFilter, attendances]);

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

  const filterAttendances = () => {
    let filtered = [...attendances];

    // Search by employee name
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.User.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.User.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(a => moment(a.date).isSameOrAfter(moment(startDate)));
    }
    if (endDate) {
      filtered = filtered.filter(a => moment(a.date).isSameOrBefore(moment(endDate)));
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => getStatus(a) === statusFilter);
    }

    // Filter by department
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(a => a.User.department === departmentFilter);
    }

    setFilteredAttendances(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    setDepartmentFilter('all');
  };

  // Get unique employees for summary
  const uniqueEmployeeIds = new Set(attendances.map(a => a.User.id));
  const uniqueEmployeeCount = uniqueEmployeeIds.size;

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
        <h2>👥 All Employees Attendance</h2>
        <div className="header-stats">
          <span className="stat-pill">{uniqueEmployeeCount} Employees</span>
          <span className="stat-pill">{filteredAttendances.length} Records</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">🔍 Filters</span>
          <button className="btn btn-outline btn-sm" onClick={clearFilters}>
            Clear All
          </button>
        </div>
        <div className="filters">
          <div className="filter-group">
            <label>Search Employee</label>
            <input
              type="text"
              placeholder="Name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Department</label>
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="all">All Departments</option>
              {departments.map((dept: string) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Date</th>
              <th>Status</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendances.length > 0 ? (
              filteredAttendances.map((record) => {
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
                    <td>{record.User.department || 'N/A'}</td>
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
              })
            ) : (
              <tr>
                <td colSpan={7} className="empty-state">
                  <p>No attendance records found matching your filters</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerAllEmployees;
