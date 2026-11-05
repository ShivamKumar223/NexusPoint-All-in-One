import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { IoArrowBack } from 'react-icons/io5';
import '../shared/Shared.css';

const CreateTeam = () => {
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const role = getRole();
  const [form, setForm] = useState({ teamName: '', description: '' });
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await API.get('/admins/members');
        setMembers(res.data.data || res.data.members || []);
      } catch (err) { console.error(err); }
    };
    if (role === 'master-Admin' || role === 'admin') fetchMembers();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMember = (id) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = role === 'project-manager' ? '/project-manager/team' : '/project-manager/team';
      await API.post(url, { ...form, members: selectedMembers });
      toast.success('Team created!');
      navigate('/teams');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create team'); }
    finally { setLoading(false); }
  };

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Create New Team</h1>
        <button className="btn btn-outline" onClick={() => navigate('/teams')}><IoArrowBack size={16} /> Back</button>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Team Name</label><input className="form-input" name="teamName" value={form.teamName} onChange={handleChange} placeholder="Enter team name" required /></div>
          <div className="form-group"><label>Description</label><textarea className="form-input" name="description" value={form.description} onChange={handleChange} placeholder="Describe the team" required /></div>
          {members.length > 0 && (
            <div className="form-group">
              <label>Select Members</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {members.map(m => (
                  <button type="button" key={m._id} onClick={() => toggleMember(m._id)}
                    className={`btn btn-sm ${selectedMembers.includes(m._id) ? 'btn-primary' : 'btn-outline'}`}>
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/teams')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Team'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;
