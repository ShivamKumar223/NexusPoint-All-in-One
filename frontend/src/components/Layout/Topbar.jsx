import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { IoMenuOutline, IoSunnyOutline, IoMoonOutline, IoLogOutOutline, IoKeyOutline, IoPersonOutline, IoCloseOutline, IoShieldCheckmarkOutline, IoBriefcaseOutline, IoCodeSlashOutline } from 'react-icons/io5';
import NotificationPanel from '../common/NotificationPanel';
import './Topbar.css';

const UserProfile = ({ onClose }) => {
  const { user, getRole, logout } = useAuth();
  const { profileData } = useAppData();
  const navigate = useNavigate();
  const role = getRole();

  const [tab, setTab] = useState('profile'); // 'profile' | 'password'
  const [pwForm, setPwForm] = useState({ newPassword: '', confirm: '' });
  const [submitting, setSubmitting] = useState(false);

  const isMasterAdmin = role === 'master-Admin';

  // Determine which endpoint to use for password update
  const pwEndpointMap = {
    'master-Admin': '/master-admin/update-password',
    'admin': '/admin/update-password',
    'project-manager': '/project-manager/update-password',
    'team-owner': '/team-owner/update-password',
    'developer': '/employee/update-password',
  };

  // Use profileData from cache, fallback to user from auth
  const profile = profileData || user;
  const displayName = profile?.ownerName || profile?.name || user?.name || 'User';
  const roles = Array.isArray(profile?.role) ? profile.role : (profile?.role ? [profile.role] : [role]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    setSubmitting(true);
    try {
      const endpoint = pwEndpointMap[role] || '/employee/update-password';
      await api.patch(endpoint, { newPassword: pwForm.newPassword });
      toast.success('Password updated successfully!');
      setPwForm({ newPassword: '', confirm: '' });
      setTab('profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-panel">
      <div className="profile-panel-header">
        <div className="profile-avatar-lg">{displayName.charAt(0).toUpperCase()}</div>
        <div className="profile-panel-info">
          <div className="profile-panel-name">{displayName}</div>
          <div className="profile-panel-role">{role}</div>
          {profile?.organizationName && <div className="profile-panel-org">{profile.organizationName}</div>}
        </div>
        <button className="btn-icon" onClick={onClose}><IoCloseOutline size={20} /></button>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button className={`profile-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
          <IoPersonOutline size={15} /> Profile
        </button>
        <button className={`profile-tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
          <IoKeyOutline size={15} /> Change Password
        </button>
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="profile-panel-body">
          {!isMasterAdmin && profile?.memberId && (
            <div className="profile-field">
              <span className="profile-field-label"><IoPersonOutline size={13} /> Member ID</span>
              <span className="profile-field-value mono">{profile.memberId}</span>
            </div>
          )}
          {profile?.email && (
            <div className="profile-field">
              <span className="profile-field-label">Email</span>
              <span className="profile-field-value">{profile.email}</span>
            </div>
          )}
          {profile?.designation && (
            <div className="profile-field">
              <span className="profile-field-label"><IoBriefcaseOutline size={13} /> Designation</span>
              <span className="profile-field-value">{profile.designation}</span>
            </div>
          )}
          {!isMasterAdmin && roles.length > 0 && (
            <div className="profile-field">
              <span className="profile-field-label"><IoShieldCheckmarkOutline size={13} /> Role</span>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {roles.map((r, i) => <span key={i} className="badge badge-info">{r}</span>)}
              </div>
            </div>
          )}
          {profile?.skills?.length > 0 && (
            <div className="profile-field">
              <span className="profile-field-label"><IoCodeSlashOutline size={13} /> Skills</span>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {profile.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
              </div>
            </div>
          )}
          {profile?.organizationName && (
            <div className="profile-field">
              <span className="profile-field-label">Organization</span>
              <span className="profile-field-value">{profile.organizationName}</span>
            </div>
          )}
          {profile?.organizationId && (
            <div className="profile-field">
              <span className="profile-field-label">Org ID</span>
              <span className="profile-field-value mono" style={{ fontSize: '0.72rem' }}>
                {String(profile.organizationId).substring(0, 20)}...
              </span>
            </div>
          )}
          <button className="btn btn-danger w-full" style={{ marginTop: '1rem' }} onClick={handleLogout}>
            <IoLogOutOutline size={16} /> Logout
          </button>
        </div>
      )}

      {/* Change Password Tab */}
      {tab === 'password' && (
        <div className="profile-panel-body">
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">New Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Minimum 8 characters"
                value={pwForm.newPassword}
                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter new password"
                value={pwForm.confirm}
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                required
              />
            </div>
            {pwForm.newPassword && pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
              <p style={{ color: 'var(--danger)', fontSize: '0.8rem', margin: 0 }}>Passwords do not match</p>
            )}
            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const Topbar = () => {
  const { user } = useAuth();
  const { activeMenu, toggleSidebar } = useMenu();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const displayName = user?.ownerName || user?.name || 'User';
  const pageTitle = activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1);

  // Close profile panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn-icon topbar-menu-btn" onClick={toggleSidebar}>
          <IoMenuOutline size={22} />
        </button>
        <h2 className="topbar-title">{pageTitle}</h2>
      </div>
      <div className="topbar-right">
        <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <IoSunnyOutline size={20} /> : <IoMoonOutline size={20} />}
        </button>
        <NotificationPanel />
        <div className="topbar-user-wrapper" ref={profileRef}>
          <button className="topbar-user-btn" onClick={() => setProfileOpen(o => !o)} title="Profile">
            <div className="topbar-avatar">{displayName.charAt(0).toUpperCase()}</div>
            <span className="topbar-username">{displayName}</span>
          </button>
          {profileOpen && <UserProfile onClose={() => setProfileOpen(false)} />}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
