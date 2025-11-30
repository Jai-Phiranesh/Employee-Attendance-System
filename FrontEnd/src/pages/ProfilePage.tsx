import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getMe } from '../services/attendanceService';
import { toast } from 'react-toastify';

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: response } = await getMe();
        setProfileData(response?.data || response);
      } catch (error) {
        console.error('Failed to fetch profile', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const userData = profileData || user;
  const initials = userData?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="profile-container">
      <div className="page-header">
        <h2>My Profile</h2>
      </div>

      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <h2>{userData?.name}</h2>
          <p>{userData?.role === 'manager' ? 'Manager' : 'Employee'} • {userData?.department || 'No Department'}</p>
        </div>
      </div>

      <div className="profile-details">
        <div className="profile-row">
          <span className="profile-label">Full Name</span>
          <span className="profile-value">{userData?.name}</span>
        </div>
        <div className="profile-row">
          <span className="profile-label">Email</span>
          <span className="profile-value">{userData?.email}</span>
        </div>
        <div className="profile-row">
          <span className="profile-label">Department</span>
          <span className="profile-value">
            <span className="department-badge">{userData?.department || 'Not Assigned'}</span>
          </span>
        </div>
        <div className="profile-row">
          <span className="profile-label">Role</span>
          <span className="profile-value">
            <span className={`status-badge ${userData?.role === 'manager' ? 'status-present' : 'status-late'}`}>
              {userData?.role === 'manager' ? 'Manager' : 'Employee'}
            </span>
          </span>
        </div>
        <div className="profile-row">
          <span className="profile-label">Employee ID</span>
          <span className="profile-value">{userData?.employeeId || 'Not Assigned'}</span>
        </div>
        <div className="profile-row">
          <span className="profile-label">Member Since</span>
          <span className="profile-value">
            {userData?.createdAt 
              ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
