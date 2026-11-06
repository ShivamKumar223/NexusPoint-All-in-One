import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import {
  IoAddOutline, IoTrashOutline, IoCalendarOutline, IoPeopleOutline,
  IoSearchOutline, IoFunnelOutline, IoCreateOutline, IoLayersOutline
} from 'react-icons/io5';
import Modal from '../../components/common/Modal';
import '../shared/Shared.css';

const STATUS_OPTIONS = ['pending', 'inprogress', 'review', 'complete', 'archive'];
const FILTER_OPTIONS = ['all', ...STATUS_OPTIONS];

const statusColor = (s) => {
  const map = { pending: 'warning', inprogress: 'info', review: 'purple', complete: 'success', archive: 'secondary' };
  return map[s] || 'secondary';
};

const ModuleList = () => {
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const { broadcastNotification } = useNotifications();
  const role = getRole();

  const [modules, setModules] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const [statusModal, setStatusModal] = useState(null); // { moduleId, currentStatus }
  const [newStatus, setNewStatus] = useState('');

  const fetchData = async () => {
    try {
      if (role === 'project-manager') {
        const projRes = await api.get('/project-manager/projects');
        const projs = projRes.data.data || [];
        setProjects(projs);
        const allMods = [];
        for (const p of projs) {
          try {
            const modRes = await api.get(`/project-manager/modules/${p._id}`);
            const mods = (modRes.data.data || []).map(m => ({ ...m, projectName: p.projectName }));
            allMods.push(...mods);
          } catch { /* skip */ }
        }
        setModules(allMods);
      } else if (role === 'team-owner') {
        const res = await api.get('/team-owner/modules');
        setModules(res.data.data || []);
      }
    } catch {
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [role]);

  const handleDelete = async () => {
    try {
      await api.delete(`/project-manager/module/${deleteId}`);
      toast.success('Module deleted');
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error('Failed to delete module');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await api.patch(`/team-owner/module/${statusModal.moduleId}`, { newStatus });
      // Notify PM after team owner updates module status
      broadcastNotification([], {
        title: 'Module Status Updated',
        message: `Module status updated to "${newStatus}"`,
        type: 'success'
      });
      toast.success('Status updated!');
      setStatusModal(null);
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = modules.filter(m => {
    const matchSearch = m.moduleName?.toLowerCase().includes(search.toLowerCase()) ||
      m.description?.toLowerCase().includes(search.toLowerCase()) ||
      m.projectName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="page-loading">Loading modules...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Modules</h1>
          <p className="page-subtitle">{modules.length} module{modules.length !== 1 ? 's' : ''}</p>
        </div>
        {role === 'project-manager' && (
          <Link to="/modules/create" className="btn btn-primary">
            <IoAddOutline size={18} /> New Module
          </Link>
        )}
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <IoSearchOutline size={16} className="search-icon" />
          <input className="search-input" placeholder="Search modules..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          <IoFunnelOutline size={16} />
          <select className="form-select filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {FILTER_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <IoLayersOutline size={48} />
          <h3>No modules found</h3>
          <p>{role === 'project-manager' ? 'Create a module for your projects.' : 'No modules assigned yet.'}</p>
          {role === 'project-manager' && <Link to="/modules/create" className="btn btn-primary"><IoAddOutline size={16} /> Create Module</Link>}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Module Name</th>
                {role === 'project-manager' && <th>Project</th>}
                <th>Status</th>
                <th>Teams</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(mod => (
                <tr key={mod._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/modules/${mod._id}`)}>
                  <td>
                    <div className="table-primary">{mod.moduleName}</div>
                    <div className="table-secondary">{mod.description}</div>
                  </td>
                  {role === 'project-manager' && <td>{mod.projectName || '—'}</td>}
                  <td><span className={`badge badge-${statusColor(mod.status)}`}>{mod.status || 'pending'}</span></td>
                  <td><IoPeopleOutline size={13} /> {mod.teams?.length || 0}</td>
                  <td><IoCalendarOutline size={13} /> {mod.completeBy ? new Date(mod.completeBy).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="action-btns" onClick={e => e.stopPropagation()}>
                      {role === 'team-owner' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setStatusModal({ moduleId: mod._id, currentStatus: mod.status }); setNewStatus(mod.status); }}
                        >
                          <IoCreateOutline size={13} /> Update Status
                        </button>
                      )}
                      {role === 'project-manager' && (
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(mod._id)}>
                          <IoTrashOutline size={13} /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Update Modal (Team Owner) */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Update Module Status">
        <div className="form-group">
          <label className="form-label">New Status</label>
          <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setStatusModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleStatusUpdate}>Update</button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Module">
        <p>Are you sure you want to delete this module?</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default ModuleList;
