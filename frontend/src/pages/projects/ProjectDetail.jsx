import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import {
  IoArrowBack, IoCalendarOutline, IoLayersOutline, IoPeopleOutline,
  IoCreateOutline, IoTrashOutline, IoCheckmarkCircle, IoTimeOutline,
  IoEllipsisHorizontal, IoAddOutline
} from 'react-icons/io5';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import '../shared/Shared.css';

const STATUS_OPTIONS = ['pending', 'inprogress', 'review', 'complete', 'archive'];

const statusColor = (s) => {
  const map = { pending: 'warning', inprogress: 'info', review: 'purple', complete: 'success', archive: 'secondary' };
  return map[s] || 'secondary';
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { broadcastNotification } = useNotifications();

  const [project, setProject] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [deleteModuleId, setDeleteModuleId] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ projectName: '', description: '', completeBy: '', status: '' });
  const [orgTeams, setOrgTeams] = useState([]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/project-manager/project/${projectId}`);
      setProject(res.data.data);
      setNewStatus(res.data.data.status);
      setEditForm({
        projectName: res.data.data.projectName,
        description: res.data.data.description,
        completeBy: res.data.data.completeBy ? res.data.data.completeBy.split('T')[0] : '',
        status: res.data.data.status
      });
    } catch {
      toast.error('Failed to load project');
    }
  };

  const fetchModules = async () => {
    try {
      const res = await api.get(`/project-manager/modules/${projectId}`);
      setModules(res.data.data || []);
    } catch {
      setModules([]);
    }
  };

  const fetchOrgTeams = async () => {
    try {
      const res = await api.get('/project-manager/org-teams');
      setOrgTeams(res.data.data || []);
    } catch {
      setOrgTeams([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProject(), fetchModules(), fetchOrgTeams()]).finally(() => setLoading(false));
  }, [projectId]);

  const handleStatusUpdate = async () => {
    try {
      await api.patch(`/project-manager/project-status/${projectId}`, { newStatus });
      toast.success('Status updated!');
      setStatusModal(false);
      fetchProject();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/project-manager/project/${projectId}`, editForm);
      toast.success('Project updated!');
      setEditModal(false);
      fetchProject();
    } catch {
      toast.error('Failed to update project');
    }
  };

  const handleDeleteModule = async () => {
    try {
      await api.delete(`/project-manager/module/${deleteModuleId}`);
      toast.success('Module deleted');
      setDeleteModuleId(null);
      fetchModules();
    } catch {
      toast.error('Failed to delete module');
    }
  };

  const getProgress = () => {
    if (!modules.length) return 0;
    const done = modules.filter(m => m.status === 'complete').length;
    return Math.round((done / modules.length) * 100);
  };

  const getTeamName = (teamId) => {
    const t = orgTeams.find(t => t._id === teamId || String(t._id) === String(teamId));
    return t ? t.teamName : teamId;
  };

  if (loading) return <div className="page-loading">Loading project...</div>;
  if (!project) return <div className="page-empty">Project not found.</div>;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-icon" onClick={() => navigate('/projects')} title="Back">
            <IoArrowBack size={20} />
          </button>
          <div>
            <h1 className="page-title">{project.projectName}</h1>
            <p className="page-subtitle">{project.description}</p>
          </div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => setStatusModal(true)}>
            <IoEllipsisHorizontal size={16} /> Update Status
          </button>
          <button className="btn btn-primary" onClick={() => setEditModal(true)}>
            <IoCreateOutline size={16} /> Edit
          </button>
        </div>
      </div>

      {/* Meta cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <span className="stat-label"><IoTimeOutline size={14} /> Due Date</span>
          <span className="stat-value" style={{ fontSize: '1rem' }}>
            {project.completeBy ? new Date(project.completeBy).toLocaleDateString() : 'N/A'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Status</span>
          <span className={`badge badge-${statusColor(project.status)}`}>{project.status}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label"><IoLayersOutline size={14} /> Modules</span>
          <span className="stat-value">{modules.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label"><IoCheckmarkCircle size={14} /> Progress</span>
          <span className="stat-value">{getProgress()}%</span>
        </div>
      </div>

      <ProgressBar value={getProgress()} label="Project Progress" />

      {/* Tabs */}
      <div className="tab-bar">
        {['overview', 'modules', 'teams'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="detail-card">
            <h3>Project Details</h3>
            <p><strong>Name:</strong> {project.projectName}</p>
            <p><strong>Description:</strong> {project.description}</p>
            <p><strong>Status:</strong> <span className={`badge badge-${statusColor(project.status)}`}>{project.status}</span></p>
            <p><strong>Due Date:</strong> {project.completeBy ? new Date(project.completeBy).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}</p>
            <p><strong>Teams Assigned:</strong> {project.teams?.length || 0}</p>
          </div>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="tab-content">
          <div className="section-header">
            <h3>Modules ({modules.length})</h3>
            <Link to="/modules/create" className="btn btn-primary btn-sm">
              <IoAddOutline size={16} /> Add Module
            </Link>
          </div>
          {modules.length === 0 ? (
            <div className="empty-state">
              <IoLayersOutline size={40} />
              <p>No modules yet. <Link to="/modules/create">Create a module</Link></p>
            </div>
          ) : (
            <div className="card-grid">
              {modules.map(mod => (
                <div key={mod._id} className="item-card">
                  <div className="item-card-header">
                    <h4 className="item-card-title">{mod.moduleName}</h4>
                    <span className={`badge badge-${statusColor(mod.status)}`}>{mod.status}</span>
                  </div>
                  <p className="item-card-desc">{mod.description}</p>
                  <div className="item-card-meta">
                    <span><IoCalendarOutline size={13} /> {mod.completeBy ? new Date(mod.completeBy).toLocaleDateString() : 'No deadline'}</span>
                    <span><IoPeopleOutline size={13} /> {mod.teams?.length || 0} teams</span>
                  </div>
                  <div className="item-card-actions">
                    <button className="btn-icon text-danger" onClick={() => setDeleteModuleId(mod._id)} title="Delete">
                      <IoTrashOutline size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="tab-content">
          <h3>Assigned Teams ({project.teams?.length || 0})</h3>
          {(!project.teams || project.teams.length === 0) ? (
            <div className="empty-state">
              <IoPeopleOutline size={40} />
              <p>No teams assigned to this project.</p>
            </div>
          ) : (
            <div className="card-grid">
              {project.teams.map((team, i) => {
                const teamObj = typeof team === 'object' ? team : orgTeams.find(t => String(t._id) === String(team));
                return (
                  <div key={i} className="item-card">
                    <div className="item-card-header">
                      <h4 className="item-card-title">{teamObj?.teamName || getTeamName(team)}</h4>
                    </div>
                    <p className="item-card-desc">{teamObj?.description || ''}</p>
                    <div className="item-card-meta">
                      <span><IoPeopleOutline size={13} /> {teamObj?.members?.length || 0} members</span>
                    </div>
                    <Link to={`/teams/${teamObj?._id || team}`} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
                      View Team
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Status Modal */}
      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Project Status">
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

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Project">
        <form onSubmit={handleEditSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input className="form-input" value={editForm.projectName} onChange={e => setEditForm(p => ({ ...p, projectName: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Complete By</label>
            <input type="date" className="form-input" value={editForm.completeBy} onChange={e => setEditForm(p => ({ ...p, completeBy: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setEditModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Delete Module Confirm */}
      <Modal isOpen={!!deleteModuleId} onClose={() => setDeleteModuleId(null)} title="Delete Module">
        <p>Are you sure you want to delete this module? This cannot be undone.</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setDeleteModuleId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDeleteModule}>Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
