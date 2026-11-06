import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { IoFolderOpen, IoPeopleCircle, IoLayers, IoFolder, IoTrendingUp } from 'react-icons/io5';
import ProgressBar from '../../components/common/ProgressBar';
import OrgInfo from '../../components/common/OrgInfo';
import '../../components/common/OrgInfo.css';
import './Dashboard.css';

const ProjectManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          API.get('/project-manager/projects').catch(() => ({ data: { data: [] } })),
          API.get('/project-manager/teams').catch(() => ({ data: { data: [] } })),
        ]);
        setProjects(pRes.data.data || pRes.data.projects || []);
        setTeams(tRes.data.data || tRes.data.teams || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const sc = { pending: 0, inprogress: 0, review: 0, complete: 0, archive: 0 };
  projects.forEach(p => { if (sc[p.status] !== undefined) sc[p.status]++; });
  const progress = projects.length > 0 ? (sc.complete / projects.length) * 100 : 0;

  if (loading) return <div className="spinner" />;

  return (
    <div className="dashboard-page">
      <div className="welcome-banner"><h1>Welcome, {user?.name || 'PM'}!</h1><p>Project Manager Dashboard</p></div>
      <OrgInfo />
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff' }}><IoFolder size={22} /></div><div className="stat-info"><h3>{projects.length}</h3><p>My Projects</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(210,153,34,0.15)', color: '#d29922' }}><IoPeopleCircle size={22} /></div><div className="stat-info"><h3>{teams.length}</h3><p>My Teams</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(63,185,80,0.15)', color: '#3fb950' }}><IoTrendingUp size={22} /></div><div className="stat-info"><h3>{sc.inprogress}</h3><p>In Progress</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(88,166,255,0.15)', color: '#58a6ff' }}><IoLayers size={22} /></div><div className="stat-info"><h3>{sc.complete}</h3><p>Completed</p></div></div>
      </div>
      <div className="card" style={{ marginBottom: '1.5rem' }}><ProgressBar value={progress} label="Project Completion" color="#3fb950" /></div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Status Overview</h2>
      <div className="status-overview">
        <div className="status-card"><div className="count" style={{ color: 'var(--warning)' }}>{sc.pending}</div><div className="label">Pending</div></div>
        <div className="status-card"><div className="count" style={{ color: 'var(--info)' }}>{sc.inprogress}</div><div className="label">In Progress</div></div>
        <div className="status-card"><div className="count" style={{ color: '#a855f7' }}>{sc.review}</div><div className="label">Review</div></div>
        <div className="status-card"><div className="count" style={{ color: 'var(--success)' }}>{sc.complete}</div><div className="label">Complete</div></div>
        <div className="status-card"><div className="count" style={{ color: 'var(--text-muted)' }}>{sc.archive}</div><div className="label">Archived</div></div>
      </div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Quick Actions</h2>
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => navigate('/projects/create')}><div className="action-icon" style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff' }}><IoFolderOpen /></div>New Project</button>
        <button className="quick-action-btn" onClick={() => navigate('/teams/create')}><div className="action-icon" style={{ background: 'rgba(210,153,34,0.15)', color: '#d29922' }}><IoPeopleCircle /></div>New Team</button>
        <button className="quick-action-btn" onClick={() => navigate('/modules/create')}><div className="action-icon" style={{ background: 'rgba(63,185,80,0.15)', color: '#3fb950' }}><IoLayers /></div>New Module</button>
        <button className="quick-action-btn" onClick={() => navigate('/projects')}><div className="action-icon" style={{ background: 'rgba(88,166,255,0.15)', color: '#58a6ff' }}><IoFolder /></div>View Projects</button>
      </div>
      <div className="recent-section">
        <h2>Recent Projects</h2>
        <div className="recent-list">
          {projects.slice(0, 5).map(p => (<div key={p._id} className="recent-item"><div className="recent-item-info"><h4>{p.projectName}</h4><p>{p.description?.substring(0, 50)}</p></div><span className={`badge badge-${p.status}`}>{p.status}</span></div>))}
          {projects.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No projects yet. Create your first project!</p>}
        </div>
      </div>
    </div>
  );
};

export default ProjectManagerDashboard;
