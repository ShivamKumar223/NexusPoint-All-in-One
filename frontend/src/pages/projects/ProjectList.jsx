import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import {
  IoAddOutline, IoTrashOutline, IoCalendarOutline, IoPeopleOutline,
  IoLayersOutline, IoSearchOutline, IoFunnelOutline, IoEyeOutline
} from 'react-icons/io5';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import '../shared/Shared.css';

const STATUS_OPTIONS = ['all', 'pending', 'inprogress', 'review', 'complete', 'archive'];

const statusColor = (s) => {
  const map = { pending: 'warning', inprogress: 'info', review: 'purple', complete: 'success', archive: 'secondary' };
  return map[s] || 'secondary';
};

const ProjectList = () => {
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const role = getRole();

  const [projects, setProjects] = useState([]);
  const [moduleCounts, setModuleCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  const fetchProjects = async () => {
    try {
      let res;
      if (role === 'master-Admin') res = await api.get('/master-admin/projects');
      else if (role === 'admin') res = await api.get('/admin/projects');
      else res = await api.get('/project-manager/projects');
      const projs = res.data?.data || [];
      setProjects(projs);
      // Fetch module counts for progress (PM only — admin/master-admin may not have modules endpoint)
      if (role === 'project-manager') {
        const counts = {};
        await Promise.all(projs.map(async (p) => {
          try {
            const mRes = await api.get(`/project-manager/modules/${p._id}`);
            const mods = mRes.data.data || [];
            counts[p._id] = {
              total: mods.length,
              complete: mods.filter(m => m.status === 'complete').length
            };
          } catch {
            counts[p._id] = { total: 0, complete: 0 };
          }
        }));
        setModuleCounts(counts);
      }
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/project-manager/project/${deleteId}`);
      toast.success('Project deleted');
      setDeleteId(null);
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const getProgress = (projectId) => {
    const c = moduleCounts[projectId];
    if (!c || c.total === 0) return 0;
    return Math.round((c.complete / c.total) * 100);
  };

  const filtered = projects.filter(p => {
    const matchSearch = p.projectName.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="page-loading">Loading projects...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {role === 'project-manager' && (
          <Link to="/projects/create" className="btn btn-primary">
            <IoAddOutline size={18} /> New Project
          </Link>
        )}
      </div>

      {/* Search & Filter */}
      <div className="filter-bar">
        <div className="search-box">
          <IoSearchOutline size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <IoFunnelOutline size={16} />
          <select className="form-select filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <IoLayersOutline size={48} />
          <h3>No projects found</h3>
          <p>{search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first project to get started.'}</p>
          {role === 'project-manager' && <Link to="/projects/create" className="btn btn-primary"><IoAddOutline size={16} /> Create Project</Link>}
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(project => {
            const progress = getProgress(project._id);
            const mc = moduleCounts[project._id] || { total: 0, complete: 0 };
            return (
              <div
                key={project._id}
                className="item-card project-card"
                onClick={() => navigate(`/projects/${project._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="item-card-header">
                  <h3 className="item-card-title">{project.projectName}</h3>
                  <span className={`badge badge-${statusColor(project.status)}`}>{project.status}</span>
                </div>
                <p className="item-card-desc">{project.description}</p>

                <ProgressBar value={progress} label={`${mc.complete}/${mc.total} modules complete`} showLabel />

                <div className="item-card-meta">
                  <span><IoPeopleOutline size={13} /> {project.teams?.length || 0} teams</span>
                  <span><IoLayersOutline size={13} /> {mc.total} modules</span>
                  <span><IoCalendarOutline size={13} /> {project.completeBy ? new Date(project.completeBy).toLocaleDateString() : 'No deadline'}</span>
                </div>

                <div className="item-card-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    <IoEyeOutline size={14} /> View
                  </button>
                  {role === 'project-manager' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteId(project._id)}
                    >
                      <IoTrashOutline size={14} /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Project">
        <p>Are you sure you want to delete this project? All associated data will be lost.</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectList;
