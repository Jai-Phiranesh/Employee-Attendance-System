import api from './api';

// Auth
export const register = (userData: any) => api.post('/auth/register', userData);
export const login = (credentials: any) => api.post('/auth/login', credentials);
export const getMe = () => api.get('/auth/me');

// Attendance (Employee)
export const checkIn = () => api.post('/attendance/checkin');
export const checkOut = () => api.post('/attendance/checkout');
export const getMyHistory = () => api.get('/attendance/my-history');
export const getMySummary = () => api.get('/attendance/my-summary');
export const getToday = () => api.get('/attendance/today');

// Attendance (Manager)
export const getAllAttendances = () => api.get('/attendance/all');
export const getEmployeeAttendance = (id: number) => api.get(`/attendance/employee/${id}`);
export const getTeamSummary = () => api.get('/attendance/summary');
export const exportCsv = () => api.get('/attendance/export', { responseType: 'blob' });
export const getTodayStatus = () => api.get('/attendance/today-status');

// Dashboard
export const getEmployeeDashboard = () => api.get('/dashboard/employee');
export const getManagerDashboard = () => api.get('/dashboard/manager');
