import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import {
  IoArrowBack, IoPeopleOutline, IoCalendarOutline,
  IoLayersOutline, IoCreateOutline, IoAddOutline
} from 'react-icons/io5';
import Modal from '../../components/common/Modal';
import { useNotifications } from '../../context/NotificationContext';
import '../shared/Shared.css';

const STATUS_OPTIONS = ['pending', 'inprogress', 'review', 'complete', 'archive'];
const statusColor = s => ({ pending:'warning', inprogress:'info', review:'purple', complete:'success', archive:'secondary' }[s] || 'secondary');

const ModuleDetail = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const { broadcastNotification } = useNotifications();
  const role = getRole();

  const [module, setModule] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allOrgTeams, setAllOrgTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch org teams for resolving team names
        if (role === 'project-manager') {
          const tr = await api.get('/project-manager/org-teams');
          setAllOrgTeams(tr.data.data || []);
        }
        // For team owner: get modules list and find the right one
        if (role === 'team-owner') {
          const mr = await api.get('/team-owner/modules');
          const mods = mr.data.data || [];
          const found = mods.find(m => String(m._id) === moduleId);
          if (found) {
            setModule(found);
            setNewStatus(found.status || 'pending');
            // fetch tasks for this module
            try {
              const tr = await api.get(`/team-owner/tasks/${moduleId}`);
              setTasks(tr.data.data || []);
            } catch { setTasks([]); }
          }
        } else if (role === 'project-manager') {
          // PM: get all projects, find which project has this module
          const pr = await api.get('/project-manager/projects');
          const projects = pr.data.data || [];
          for (const p of projects) {
            try {
              const mr = await api.get(`/project-manager/modules/${p._id}`);
              const mods = mr.data.data || [];
              const found = mods.find(m => String(m._id) === moduleId);
              if (found) { setModule({ ...found, projectName: p.projectName, projectId: p._id }); setNewStatus(found.status || 'pending'); break; }
            } catch { continue; }
          }
        }
      } catch { toast.error('Failed to load module'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [moduleId, role]);

  const getTeamObj = (teamId) => allOrgTeams.find(t => String(t._id) === String(teamId?._id || teamId));

  const handleStatusUpdate = async () => {
    try {
      await api.patch(`/team-owner/module/${moduleId}`, { newStatus });
      toast.success('Status updated!');
      setModule(prev => ({ ...prev, status: newStatus }));
      setStatusModal(false);
      broadcastNotification([], { title: 'Module Status Updated', message: `Module "${module?.moduleName}" is now "${newStatus}"`, type: 'info' });
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return <div className="page-loading">Loading module...</div>;
  if (!module) return <div className="page-empty">Module not found.</div>;

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/modules">Modules</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{module.moduleName}</span>
      </nav>

      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-icon" onClick={() => navigate('/modules')}><IoArrowBack size={20} /></button>
          <div>
            <h1 className="page-title">{module.moduleName}</h1>
            {module.projectName && <p className="page-subtitle">Project: {module.projectName}</p>}
          </div>
        </div>
        <div className="page-header-actions">
          <span className={`badge badge-${statusColor(module.status)}`}>{module.status}</span>
          {role === 'team-owner' && (
            <button className="btn btn-secondary btn-sm" onClick={() => setStatusModal(true)}>
              <IoCreateOutline size={15} /> Update Status
            </button>
          )}
          {role === 'team-owner' && (
            <Link to="/tasks/create" className="btn btn-primary btn-sm">
              <IoAddOutline size={15} /> New Task
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        <div className="stat-card">
          <span className="stat-label"><IoPeopleOutline size={14} /> Teams</span>
          <span className="stat-value">{module.teams?.length || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label"><IoLayersOutline size={14} /> Tasks</span>
          <span className="stat-value">{tasks.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label"><IoCalendarOutline size={14} /> Due</span>
          <span className="stat-value" style={{ fontSize:'0.9rem' }}>
            {module.completeBy ? new Date(module.completeBy).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {['overview', 'teams', 'tasks'].map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="detail-info-card tab-content">
          <div className="detail-field"><span className="detail-field-label">Name</span><span className="detail-field-value">{module.moduleName}</span></div>
          <div className="detail-field"><span className="detail-field-label">Description</span><span className="detail-field-value">{module.description}</span></div>
          <div className="detail-field"><span className="detail-field-label">Status</span><span className={`badge badge-${statusColor(module.status)}`}>{module.status}</span></div>
          <div className="detail-field"><span className="detail-field-label">Due Date</span><span className="detail-field-value">{module.completeBy ? new Date(module.completeBy).toLocaleDateString() : '—'}</span></div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="tab-content">
          {(!module.teams || module.teams.length === 0) ? (
            <div className="empty-state"><IoPeopleOutline size={36} /><p>No teams assigned.</p></div>
          ) : (
            <div className="card-grid">
              {module.teams.map((t, i) => {
                const teamObj = typeof t === 'object' ? t : getTeamObj(t);
                const name = teamObj?.teamName || `Team ${i + 1}`;
                const tid = teamObj?._id || t;
                return (
                  <div key={i} className="item-card">
                    <div className="item-card-header">
                      <h4 className="item-card-title">{name}</h4>
                      <span className="badge badge-info"><IoPeopleOutline size={12} /> {teamObj?.members?.length || 0}</span>
                    </div>
                    {teamObj?.description && <p className="item-card-desc">{teamObj.description}</p>}
                    <Link to={`/teams/${tid}`} className="btn btn-secondary btn-sm" style={{ marginTop: 'auto' }}>View Team</Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="tab-content">
          <div className="section-header">
            <h3>Tasks ({tasks.length})</h3>
            {role === 'team-owner' && <Link to="/tasks/create" className="btn btn-primary btn-sm"><IoAddOutline size={15} /> New Task</Link>}
          </div>
          {tasks.length === 0 ? (
            <div className="empty-state"><IoLayersOutline size={36} /><p>No tasks yet.</p></div>
          ) : (
            <div className="card-grid">
              {tasks.map(task => (
                <div key={task._id} className="item-card" style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/tasks/${task._id}`)}>
                  <div className="item-card-header">
                    <h4 className="item-card-title">{task.taskName}</h4>
                    <span className={`badge badge-${statusColor(task.status)}`}>{task.status || 'pending'}</span>
                  </div>
                  <p className="item-card-desc">{task.description}</p>
                  <div className="item-card-meta">
                    <span><IoPeopleOutline size={12} /> {task.members?.length || 0} assigned</span>
                    <span><IoCalendarOutline size={12} /> {task.completeBy ? new Date(task.completeBy).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Update Modal */}
      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Module Status">
        <div className="form-group">
          <label className="form-label">New Status</label>
          <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setStatusModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleStatusUpdate}>Update</button>
        </div>
      </Modal>
    </div>
  );
};

export default ModuleDetail;
