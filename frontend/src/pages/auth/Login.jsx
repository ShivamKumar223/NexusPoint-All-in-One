import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { IoCodeSlash } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import './Auth.css';

const profileEndpoints = {
  'master-Admin': '/master-admin/profile',
  'admin': '/admin/profile',
  'project-manager': '/project-manager/profile',
  'team-owner': '/team-owner/profile',
  'developer': '/employee/profile',
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const selectedRole = location.state?.role || 'master-Admin';
  const [form, setForm] = useState({ email: '', password: '', organizationId: '', memberId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isMasterAdmin = selectedRole === 'master-Admin';
  const roleLabel = isMasterAdmin ? 'Master Admin' : selectedRole.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isMasterAdmin) {
        await API.post('/master-admin/login', { email: form.email, password: form.password });
      } else {
        await API.post('/project-manager/login', { organizationId: form.organizationId, memberId: form.memberId, password: form.password });
      }
      const profileUrl = profileEndpoints[selectedRole];
      const profileRes = await API.get(profileUrl);
      const userData = profileRes.data.data || profileRes.data.user || profileRes.data;
      if (isMasterAdmin) userData.role = 'master-Admin';
      login(userData);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Login failed. Check your credentials.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><img src="/icon3.png" alt="" style={{ height:"50px"}} /><span>NexusPoint</span></div>
        <h1>{roleLabel} Login</h1>
        <p className="auth-subtitle">Enter your credentials to continue</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {isMasterAdmin ? (
            <>
              <div className="form-group"><label>Email</label><input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter email" required /></div>
              <div className="form-group"><label>Password</label><input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter password" required /></div>
            </>
          ) : (
            <>
              <div className="form-group"><label>Organization ID</label><input className="form-input" name="organizationId" value={form.organizationId} onChange={handleChange} placeholder="Enter organization ID" required /></div>
              <div className="form-group"><label>Member ID</label><input className="form-input" name="memberId" value={form.memberId} onChange={handleChange} placeholder="Enter member ID" required /></div>
              <div className="form-group"><label>Password</label><input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter password" required /></div>
            </>
          )}
          <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="auth-footer">
          {isMasterAdmin && <p>New here? <Link to="/signup">Register Organization</Link></p>}
          <p style={{ marginTop: '0.5rem' }}><Link to="/">← Back to role selection</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
