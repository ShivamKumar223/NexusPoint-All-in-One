import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoCodeSlash } from 'react-icons/io5';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ organizationName: '', ownerName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await API.post('/master-admin/register', { organizationName: form.organizationName, ownerName: form.ownerName, email: form.email, password: form.password });
      toast.success('Organization registered successfully!');
      setTimeout(() => navigate('/login', { state: { role: 'master-Admin' } }), 1500);
    } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><IoCodeSlash /><span>Smart DevColab</span></div>
        <h1>Register Organization</h1>
        <p className="auth-subtitle">Create your organization as Master Admin</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Organization Name</label><input className="form-input" name="organizationName" value={form.organizationName} onChange={handleChange} placeholder="Enter organization name" required /></div>
          <div className="form-group"><label>Owner Name</label><input className="form-input" name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="Enter your name" required /></div>
          <div className="form-group"><label>Email</label><input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter email" required /></div>
          <div className="form-group"><label>Password</label><input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create password" required /></div>
          <div className="form-group"><label>Confirm Password</label><input className="form-input" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" required /></div>
          <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register Organization'}</button>
        </form>
        <div className="auth-footer">Already registered? <Link to="/login" state={{ role: 'master-Admin' }}>Login here</Link></div>
      </div>
    </div>
  );
};

export default Signup;
