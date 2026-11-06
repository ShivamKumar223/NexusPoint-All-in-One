import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import {
  IoArrowBack, IoCalendarOutline, IoLayersOutline, IoPeopleOutline,
  IoCreateOutline, IoTrashOutline, IoAddOutline, IoEllipsisHorizontal
} from 'react-icons/io5';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import '../shared/Shared.css';

const STATUS_OPTIONS = ['pending', 'inprogress', 'review', 'complete', 'archive'];
const statusColor = s => ({ pending:'warning', inprogress:'info', review:'purple', complete:'success', archive:'secondary' }[s] || 'secondary');

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const { broadcastNotification } = useNotifications();
  const role = getRole();

  const [project, setProject] = useState(null);
  const [modules, setModules] = useState([]);
  const [allOrgTeams, setAllOrgTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [deleteModuleId, setDeleteModuleId] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  const fetchProject = async () => {
    try {
      let res;
      if (role === 'master-Admin') res = await api.get(`/master-admin/project/${projectId}`);
      else if (role === 'admin') res = await api.get(`/admin/project/${projectId}`);
      else res = await api.get(`/project-manager/project/${projectId}`);
      const p = res.data.data;
      setProject(p);
      setNewStatus(p.status);
      setEditForm({ projectName: p.projectName, description: p.description, completeBy: p.completeBy ? p.completeBy.split('T')[0] : '', status: p.status });
    } catch { toast.error('Failed to load project'); }
  };

  const fetchModules = async () => {
    try {
      // Only PM has the modules endpoint
      if (role !== 'project-manager') { setModules([]); return; }
      const res = await api.get(`/project-manager/modules/${projectId}`);
      setModules(res.data.data || []);
    } catch { setModules([]); }
  };

  const fetchOrgTeams = async () => {
    try {
      let res;
      if (role === 'master-Admin') res = await api.get('/master-admin/teams');
      else if (role === 'admin') res = await api.get('/admin/teams');
      else res = await api.get('/project-manager/org-teams');
      setAllOrgTeams(res.data.data || []);
    } catch { setAllOrgTeams([]); }
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
    } catch { toast.error('Failed to update status'); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/project-manager/project/${projectId}`, editForm);
      toast.success('Project updated!');
      setEditModal(false);
      fetchProject();
    } catch { toast.error('Failed to update project'); }
  };

  const handleDeleteModule = async () => {
    try {
      await api.delete(`/project-manager/module/${deleteModuleId}`);
      toast.success('Module deleted');
      setDeleteModuleId(null);
      fetchModules();
    } catch { toast.error('Failed to delete module'); }
  };

  const getProgress = () => {
    if (!modules.length) return 0;
    return Math.round((modules.filter(m => m.status === 'complete').length / modules.length) * 100);
  };

  const resolveTeam = (t) => {
    if (typeof t === 'object' && t !== null && t.teamName) return t;
    const tid = typeof t === 'object' ? String(t._id) : String(t);
    return allOrgTeams.find(ot => String(ot._id) === tid) || { _id: tid, teamName: `Team`, members: [] };
  };

  if (loading) return <div className="page-loading">Loading project...</div>;
  if (!project) return <div className="page-empty">Project not found.</div>;

  const isPM = role === 'project-manager';

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/projects">Projects</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{project.projectName}</span>
      </nav>

      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-icon" onClick={() => navigate('/projects')}><IoArrowBack size={20} /></button>
          <div>
            <h1 className="page-title">{project.projectName}</h1>
            <p className="page-subtitle">{project.description}</p>
          </div>
        </div>
        <div className="page-header-actions">
          {isPM && (
            <>
              <button className="btn btn-secondary" onClick={() => setStatusModal(true)}>
                <IoEllipsisHorizontal size={16} /> Status
              </button>
              <button className="btn btn-primary" onClick={() => setEditModal(true)}>
                <IoCreateOutline size={16} /> Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        <div className="stat-card">
          <span className="stat-label">Status</span>
          <span className={`badge badge-${statusColor(project.status)}`}>{project.status}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label"><IoCalendarOutline size={14} /> Due</span>
          <span className="stat-value" style={{ fontSize:'0.9rem' }}>{project.completeBy ? new Date(project.completeBy).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label"><IoLayersOutline size={14} /> Modules</span>
          <span className="stat-value">{modules.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label"><IoPeopleOutline size={14} /> Teams</span>
          <span className="stat-value">{project.teams?.length || 0}</span>
        </div>
      </div>

      <ProgressBar value={getProgress()} label="Module Completion Progress" showLabel />

      {/* Tabs */}
      <div className="tab-bar" style={{ marginTop:'1.25rem' }}>
        {['overview','modules','teams'].map(t => (
          <button key={t} className={`tab-btn ${activeTab===t?'active':''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="detail-info-card tab-content">
          <div className="detail-field"><span className="detail-field-label">Name</span><span className="detail-field-value">{project.projectName}</span></div>
          <div className="detail-field"><span className="detail-field-label">Description</span><span className="detail-field-value">{project.description}</span></div>
          <div className="detail-field"><span className="detail-field-label">Status</span><span className={`badge badge-${statusColor(project.status)}`}>{project.status}</span></div>
          <div className="detail-field"><span className="detail-field-label">Due Date</span><span className="detail-field-value">{project.completeBy ? new Date(project.completeBy).toLocaleDateString() : '—'}</span></div>
          <div className="detail-field"><span className="detail-field-label">Created</span><span className="detail-field-value">{new Date(project.createdAt).toLocaleDateString()}</span></div>
        </div>
      )}

      {/* Modules */}
      {activeTab === 'modules' && (
        <div className="tab-content">
          <div className="section-header">
            <h3>Modules ({modules.length})</h3>
            {isPM && <Link to="/modules/create" className="btn btn-primary btn-sm"><IoAddOutline size={15} /> Add Module</Link>}
          </div>
          {modules.length === 0 ? (
            <div className="empty-state"><IoLayersOutline size={40} /><p>No modules yet.</p></div>
          ) : (
            <div className="card-grid">
              {modules.map(mod => (
                <div key={mod._id} className="item-card" style={{ cursor:'pointer' }}
                  onClick={() => navigate(`/modules/${mod._id}`)}>
                  <div className="item-card-header">
                    <h4 className="item-card-title">{mod.moduleName}</h4>
                    <span className={`badge badge-${statusColor(mod.status)}`}>{mod.status}</span>
                  </div>
                  <p className="item-card-desc">{mod.description}</p>
                  <div className="item-card-meta">
                    <span><IoCalendarOutline size={12} /> {mod.completeBy ? new Date(mod.completeBy).toLocaleDateString() : '—'}</span>
                    <span><IoPeopleOutline size={12} /> {mod.teams?.length || 0} teams</span>
                  </div>
                  {isPM && (
                    <div className="item-card-actions" onClick={e => e.stopPropagation()}>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteModuleId(mod._id)}>
                        <IoTrashOutline size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Teams */}
      {activeTab === 'teams' && (
        <div className="tab-content">
          <h3 style={{ marginBottom:'1rem' }}>Assigned Teams ({project.teams?.length || 0})</h3>
          {(!project.teams || project.teams.length === 0) ? (
            <div className="empty-state"><IoPeopleOutline size={40} /><p>No teams assigned.</p></div>
          ) : (
            <div className="card-grid">
              {project.teams.map((t, i) => {
                const teamObj = resolveTeam(t);
                return (
                  <div key={i} className="item-card" style={{ cursor:'pointer' }}
                    onClick={() => navigate(`/teams/${teamObj._id}`)}>
                    <div className="item-card-header">
                      <h4 className="item-card-title">{teamObj.teamName}</h4>
                      <span className="badge badge-info"><IoPeopleOutline size={12} /> {teamObj.members?.length || 0}</span>
                    </div>
                    {teamObj.description && <p className="item-card-desc">{teamObj.description}</p>}
                    <div className="item-card-actions">
                      <span className="btn btn-secondary btn-sm">View Team →</span>
                    </div>
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
            <input className="form-input" value={editForm.projectName || ''} onChange={e => setEditForm(p => ({ ...p, projectName: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={editForm.description || ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Complete By</label>
            <input type="date" className="form-input" value={editForm.completeBy || ''} onChange={e => setEditForm(p => ({ ...p, completeBy: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={editForm.status || 'pending'} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
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
        <p>Are you sure you want to delete this module?</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setDeleteModuleId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDeleteModule}>Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
