import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { IoArrowBack } from 'react-icons/io5';
import '../shared/Shared.css';

const CreateMember = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', role: 'developer', memberId: '', password: '', designation: '', skills: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/master-admin/member', {
        name: form.name, role: [form.role], memberId: form.memberId,
        password: form.password, designation: form.designation,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      toast.success('Member created successfully!');
      navigate('/members');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create member'); }
    finally { setLoading(false); }
  };

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Create New Member</h1>
        <button className="btn btn-outline" onClick={() => navigate('/members')}><IoArrowBack size={16} /> Back</button>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label>Full Name</label><input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Enter full name" required /></div>
            <div className="form-group"><label>Role</label>
              <select className="form-input" name="role" value={form.role} onChange={handleChange}>
                <option value="admin">Admin</option><option value="project-manager">Project Manager</option>
                <option value="team-owner">Team Owner</option><option value="developer">Developer</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Member ID</label><input className="form-input" name="memberId" value={form.memberId} onChange={handleChange} placeholder="e.g. DEV-001" required /></div>
            <div className="form-group"><label>Temporary Password</label><input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Set temp password" required /></div>
          </div>
          <div className="form-group"><label>Designation</label><input className="form-input" name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. Frontend Developer" required /></div>
          <div className="form-group"><label>Skills (comma separated)</label><input className="form-input" name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. React, Node.js, MongoDB" required /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/members')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMember;
