import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { logout } from '../redux/authSlice';
import { toast } from 'react-toastify';

const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.info('👋 Logged out successfully!');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const employeeLinks = [
    { path: '/employee/dashboard', label: '🏠 Dashboard', icon: '🏠' },
    { path: '/employee/history', label: '📅 History', icon: '📅' },
    { path: '/employee/profile', label: '👤 Profile', icon: '👤' },
  ];

  const managerLinks = [
    { path: '/manager/dashboard', label: '🏠 Dashboard', icon: '🏠' },
    { path: '/manager/employees', label: '👥 Employees', icon: '👥' },
    { path: '/manager/calendar', label: '📅 Calendar', icon: '📅' },
    { path: '/manager/reports', label: '📊 Reports', icon: '📊' },
    { path: '/manager/profile', label: '👤 Profile', icon: '👤' },
  ];

  const navLinks = user?.role === 'manager' ? managerLinks : employeeLinks;

  return (
    <nav>
      <div className="nav-brand">
        <h1>📋 Attendance System</h1>
      </div>
      
      {isAuthenticated && (
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      )}

      <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {isAuthenticated ? (
          <>
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className={isActive(link.path) ? 'active' : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="nav-user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-btn">
                🚪 Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className={isActive('/login') ? 'active' : ''}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className={isActive('/register') ? 'active' : ''}>
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
