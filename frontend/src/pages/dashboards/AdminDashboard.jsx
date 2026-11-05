import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { IoPersonAdd, IoFolderOpen, IoPeopleCircle, IoPeople, IoFolder, IoTrendingUp } from 'react-icons/io5';
import ProgressBar from '../../components/common/ProgressBar';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, pRes, tRes] = await Promise.all([
          API.get('/admin/members').catch(() => ({ data: { data: [] } })),
          API.get('/admin/projects').catch(() => ({ data: { projects: [] } })),
          API.get('/admin/teams').catch(() => ({ data: { data: [] } })),
        ]);
        setMembers(mRes.data.data || mRes.data.members || []);
        setProjects(pRes.data.data || pRes.data.projects || []);
        setTeams(tRes.data.data || tRes.data.teams || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const completed = projects.filter(p => p.status === 'complete').length;
  const progress = projects.length > 0 ? (completed / projects.length) * 100 : 0;

  if (loading) return <div className="spinner" />;

  return (
    <div className="dashboard-page">
      <div className="welcome-banner"><h1>Welcome, {user?.name || 'Admin'}!</h1><p>Admin Dashboard — Manage your organization</p></div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff' }}><IoPeople size={22} /></div><div className="stat-info"><h3>{members.length}</h3><p>Total Members</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(63,185,80,0.15)', color: '#3fb950' }}><IoFolder size={22} /></div><div className="stat-info"><h3>{projects.length}</h3><p>Total Projects</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(210,153,34,0.15)', color: '#d29922' }}><IoPeopleCircle size={22} /></div><div className="stat-info"><h3>{teams.length}</h3><p>Total Teams</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(88,166,255,0.15)', color: '#58a6ff' }}><IoTrendingUp size={22} /></div><div className="stat-info"><h3>{projects.filter(p => p.status !== 'archive' && p.status !== 'complete').length}</h3><p>Active Projects</p></div></div>
      </div>
      <div className="card" style={{ marginBottom: '1.5rem' }}><ProgressBar value={progress} label="Project Completion" color="#3fb950" /></div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Quick Actions</h2>
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => navigate('/members/create')}><div className="action-icon" style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff' }}><IoPersonAdd /></div>Create Member</button>
        <button className="quick-action-btn" onClick={() => navigate('/projects/create')}><div className="action-icon" style={{ background: 'rgba(63,185,80,0.15)', color: '#3fb950' }}><IoFolderOpen /></div>Create Project</button>
        <button className="quick-action-btn" onClick={() => navigate('/teams/create')}><div className="action-icon" style={{ background: 'rgba(210,153,34,0.15)', color: '#d29922' }}><IoPeopleCircle /></div>Create Team</button>
        <button className="quick-action-btn" onClick={() => navigate('/members')}><div className="action-icon" style={{ background: 'rgba(88,166,255,0.15)', color: '#58a6ff' }}><IoPeople /></div>View Members</button>
      </div>
      <div className="recent-section">
        <h2>Recent Projects</h2>
        <div className="recent-list">
          {projects.slice(0, 5).map(p => (
            <div key={p._id} className="recent-item"><div className="recent-item-info"><h4>{p.projectName}</h4><p>{p.description?.substring(0, 50)}</p></div><span className={`badge badge-${p.status}`}>{p.status}</span></div>
          ))}
          {projects.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No projects yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
