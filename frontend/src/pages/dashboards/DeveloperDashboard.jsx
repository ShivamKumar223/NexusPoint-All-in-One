import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { IoCheckbox, IoCalendar, IoCheckmarkCircle, IoPeopleCircle, IoTrendingUp } from 'react-icons/io5';
import ProgressBar from '../../components/common/ProgressBar';
import './Dashboard.css';

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, teamRes] = await Promise.all([
          API.get('/employee/tasks').catch(() => ({ data: { data: [] } })),
          API.get('/employee/team').catch(() => ({ data: { data: [] } })),
        ]);
        setTasks(taskRes.data.data || taskRes.data.tasks || []);
        setTeams(teamRes.data.data || teamRes.data.teams || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const sc = { pending: 0, inprogress: 0, review: 0, complete: 0, archive: 0 };
  tasks.forEach(t => { if (sc[t.status] !== undefined) sc[t.status]++; });
  const progress = tasks.length > 0 ? (sc.complete / tasks.length) * 100 : 0;

  if (loading) return <div className="spinner" />;

  return (
    <div className="dashboard-page">
      <div className="welcome-banner"><h1>Welcome, {user?.name || 'Developer'}!</h1><p>Developer Dashboard</p></div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff' }}><IoCheckbox size={22} /></div><div className="stat-info"><h3>{tasks.length}</h3><p>Assigned Tasks</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(63,185,80,0.15)', color: '#3fb950' }}><IoCheckmarkCircle size={22} /></div><div className="stat-info"><h3>{sc.complete}</h3><p>Completed</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(210,153,34,0.15)', color: '#d29922' }}><IoTrendingUp size={22} /></div><div className="stat-info"><h3>{sc.inprogress}</h3><p>In Progress</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(88,166,255,0.15)', color: '#58a6ff' }}><IoPeopleCircle size={22} /></div><div className="stat-info"><h3>{teams.length}</h3><p>My Teams</p></div></div>
      </div>
      <div className="card" style={{ marginBottom: '1.5rem' }}><ProgressBar value={progress} label="Task Completion" color="#6c63ff" /></div>
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
        <button className="quick-action-btn" onClick={() => navigate('/tasks')}><div className="action-icon" style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff' }}><IoCheckbox /></div>View Tasks</button>
        <button className="quick-action-btn" onClick={() => navigate('/todo')}><div className="action-icon" style={{ background: 'rgba(63,185,80,0.15)', color: '#3fb950' }}><IoCalendar /></div>My Todo</button>
      </div>
      <div className="recent-section">
        <h2>Assigned Tasks</h2>
        <div className="recent-list">
          {tasks.slice(0, 5).map(t => (<div key={t._id} className="recent-item"><div className="recent-item-info"><h4>{t.taskName}</h4><p>{t.description?.substring(0, 50)}</p></div><span className={`badge badge-${t.status}`}>{t.status}</span></div>))}
          {tasks.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No tasks assigned yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
