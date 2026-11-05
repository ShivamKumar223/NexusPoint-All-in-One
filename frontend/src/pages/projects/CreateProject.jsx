import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { IoArrowBack } from 'react-icons/io5';
import '../shared/Shared.css';

const CreateProject = () => {
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const role = getRole();
  const [form, setForm] = useState({ projectName: '', description: '', completeBy: '', status: 'pending' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = role === 'master-Admin' || role === 'admin' ? '/admins/projects' : '/project-manager/project';
      // Admin endpoint may differ; use POST for create
      if (role === 'project-manager') {
        await API.post('/project-manager/project', form);
      } else {
        // For admin, the backend may not have a direct create project endpoint
        // Use PM endpoint as fallback
        await API.post('/project-manager/project', form);
      }
      toast.success('Project created!');
      navigate('/projects');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create project'); }
    finally { setLoading(false); }
  };

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Create New Project</h1>
        <button className="btn btn-outline" onClick={() => navigate('/projects')}><IoArrowBack size={16} /> Back</button>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Project Name</label><input className="form-input" name="projectName" value={form.projectName} onChange={handleChange} placeholder="Enter project name" required /></div>
          <div className="form-group"><label>Description</label><textarea className="form-input" name="description" value={form.description} onChange={handleChange} placeholder="Describe the project" required /></div>
          <div className="form-row">
            <div className="form-group"><label>Due Date</label><input className="form-input" name="completeBy" type="date" value={form.completeBy} onChange={handleChange} required /></div>
            <div className="form-group"><label>Status</label>
              <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                <option value="pending">Pending</option><option value="inprogress">In Progress</option>
                <option value="review">Review</option><option value="complete">Complete</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/projects')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
