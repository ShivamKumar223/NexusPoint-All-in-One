import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { IoArrowBack } from 'react-icons/io5';
import '../shared/Shared.css';

const CreateModule = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ projectId: '', moduleName: '', description: '', completeBy: '', status: 'pending' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get('/project-manager/projects');
        setProjects(res.data.data || res.data.projects || []);
      } catch (err) { console.error(err); }
    };
    fetchProjects();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.projectId) { toast.error('Please select a project'); return; }
    setLoading(true);
    try {
      await API.post(`/project-manager/module/${form.projectId}`, {
        moduleName: form.moduleName, description: form.description,
        completeBy: form.completeBy, status: form.status,
      });
      toast.success('Module created!');
      navigate('/modules');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create module'); }
    finally { setLoading(false); }
  };

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Create New Module</h1>
        <button className="btn btn-outline" onClick={() => navigate('/modules')}><IoArrowBack size={16} /> Back</button>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Select Project</label>
            <select className="form-input" name="projectId" value={form.projectId} onChange={handleChange} required>
              <option value="">-- Select a project --</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Module Name</label><input className="form-input" name="moduleName" value={form.moduleName} onChange={handleChange} placeholder="Enter module name" required /></div>
          <div className="form-group"><label>Description</label><textarea className="form-input" name="description" value={form.description} onChange={handleChange} placeholder="Describe the module" required /></div>
          <div className="form-row">
            <div className="form-group"><label>Due Date</label><input className="form-input" name="completeBy" type="date" value={form.completeBy} onChange={handleChange} required /></div>
            <div className="form-group"><label>Status</label>
              <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                <option value="pending">Pending</option><option value="inprogress">In Progress</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/modules')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Module'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModule;
