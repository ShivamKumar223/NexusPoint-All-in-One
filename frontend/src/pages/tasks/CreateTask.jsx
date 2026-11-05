import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { IoArrowBack } from 'react-icons/io5';
import '../shared/Shared.css';

const CreateTask = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState({ moduleId: '', taskName: '', description: '', completeBy: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await API.get('/team-owner/modules');
        setModules(res.data.data || res.data.modules || []);
      } catch (err) { console.error(err); }
    };
    fetchModules();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.moduleId) { toast.error('Please select a module'); return; }
    setLoading(true);
    try {
      await API.post(`/team-owner/task/${form.moduleId}`, {
        taskName: form.taskName,
        description: form.description,
        completeBy: form.completeBy,
      });
      toast.success('Task created successfully!');
      navigate('/tasks');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create task'); }
    finally { setLoading(false); }
  };

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Create New Task</h1>
        <button className="btn btn-outline" onClick={() => navigate('/tasks')}><IoArrowBack size={16} /> Back</button>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Module</label>
            <select className="form-input" name="moduleId" value={form.moduleId} onChange={handleChange} required>
              <option value="">-- Select a module --</option>
              {modules.map(m => <option key={m._id} value={m._id}>{m.moduleName}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Task Name</label>
            <input className="form-input" name="taskName" value={form.taskName} onChange={handleChange} placeholder="Enter task name" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-input" name="description" value={form.description} onChange={handleChange} placeholder="Describe the task" required />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input className="form-input" name="completeBy" type="date" value={form.completeBy} onChange={handleChange} required />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/tasks')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
