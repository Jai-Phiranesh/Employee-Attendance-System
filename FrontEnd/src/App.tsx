import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';

// Import pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ProfilePage from './pages/ProfilePage';
import AttendanceHistory from './pages/AttendanceHistory';
import ManagerAllEmployees from './pages/ManagerAllEmployees';
import ManagerTeamCalendar from './pages/ManagerTeamCalendar';
import ManagerReports from './pages/ManagerReports';
import Layout from './components/Layout';

const App: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
          
          {/* Employee Routes */}
          <Route 
            path="/employee/dashboard" 
            element={isAuthenticated && user?.role === 'employee' ? <EmployeeDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/employee/history" 
            element={isAuthenticated && user?.role === 'employee' ? <AttendanceHistory /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/employee/profile" 
            element={isAuthenticated && user?.role === 'employee' ? <ProfilePage /> : <Navigate to="/login" />} 
          />

          {/* Manager Routes */}
          <Route 
            path="/manager/dashboard" 
            element={isAuthenticated && user?.role === 'manager' ? <ManagerDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/manager/employees" 
            element={isAuthenticated && user?.role === 'manager' ? <ManagerAllEmployees /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/manager/calendar" 
            element={isAuthenticated && user?.role === 'manager' ? <ManagerTeamCalendar /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/manager/reports" 
            element={isAuthenticated && user?.role === 'manager' ? <ManagerReports /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/manager/profile" 
            element={isAuthenticated && user?.role === 'manager' ? <ProfilePage /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/" 
            element={
              <Navigate to={
                isAuthenticated 
                  ? (user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard') 
                  : '/login'
              } />
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
