import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import {
  IoAddOutline, IoTrashOutline, IoCalendarOutline, IoPeopleOutline,
  IoSearchOutline, IoFunnelOutline, IoCreateOutline, IoCheckmarkCircle
} from 'react-icons/io5';
import Modal from '../../components/common/Modal';
import '../shared/Shared.css';

const STATUS_OPTIONS = ['pending', 'inprogress', 'review', 'complete', 'archive'];
const FILTER_OPTIONS = ['all', ...STATUS_OPTIONS];

const statusColor = (s) => {
  const map = { pending: 'warning', inprogress: 'info', review: 'purple', complete: 'success', archive: 'secondary' };
  return map[s] || 'secondary';
};

const TaskList = () => {
  const navigate = useNavigate();
  const { getRole, user } = useAuth();
  const { broadcastNotification } = useNotifications();
  const role = getRole();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [myTeamMembers, setMyTeamMembers] = useState([]);

  const fetchData = async () => {
    try {
      if (role === 'team-owner') {
        // Fetch modules first to get tasks per module
        const modRes = await api.get('/team-owner/modules');
        const mods = modRes.data.data || [];
        const allTasks = [];
        for (const mod of mods) {
          try {
            const tRes = await api.get(`/team-owner/tasks/${mod._id}`);
            const tasks = (tRes.data.data || []).map(t => ({ ...t, moduleName: mod.moduleName }));
            allTasks.push(...tasks);
          } catch { /* skip */ }
        }
        setTasks(allTasks);
        // Get team members for assignment context — returns array of teams
        try {
          const teamRes = await api.get('/team-owner/team');
          const teams = Array.isArray(teamRes.data.data) ? teamRes.data.data : [teamRes.data.data].filter(Boolean);
          const allMems = [];
          teams.forEach(t => (t?.members || []).forEach(m => {
            if (!allMems.find(ex => String(ex._id) === String(m._id || m))) allMems.push(m);
          }));
          setMyTeamMembers(allMems);
        } catch { /* ignore */ }
      } else if (role === 'developer') {
        // Developer: getMyTasks returns plain Task objects with moduleName injected
        const res = await api.get('/employee/tasks');
        setTasks(res.data.data || []);
        // Get team members for name resolution
        try {
          const teamRes = await api.get('/employee/team');
          const teams = Array.isArray(teamRes.data.data) ? teamRes.data.data : [teamRes.data.data].filter(Boolean);
          const allMems = [];
          teams.forEach(t => (t?.members || []).forEach(m => {
            if (!allMems.find(ex => String(ex._id) === String(m._id || m))) allMems.push(m);
          }));
          setMyTeamMembers(allMems);
        } catch { /* ignore */ }
      }
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [role]);

  const handleDelete = async () => {
    try {
      await api.delete(`/team-owner/task/${deleteId}`);
      toast.success('Task deleted');
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      if (role === 'developer') {
        await api.patch('/employee/update', { taskId: statusModal.taskId, newStatus });
        // Notify team members about status update
        broadcastNotification(myTeamMembers.map(m => String(m._id || m)), {
          title: 'Task Status Updated',
          message: `Task "${statusModal.taskName}" status updated to "${newStatus}"`,
          type: 'success'
        });
      } else if (role === 'team-owner') {
        await api.patch(`/team-owner/task/${statusModal.taskId}`, { status: newStatus });
      }
      toast.success('Status updated!');
      setStatusModal(null);
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const getMemberName = (memberId) => {
    const m = myTeamMembers.find(tm => String(tm._id || tm) === String(memberId));
    return m?.name || memberId;
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.taskName?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.moduleName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="page-loading">Loading tasks...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        {role === 'team-owner' && (
          <Link to="/tasks/create" className="btn btn-primary">
            <IoAddOutline size={18} /> New Task
          </Link>
        )}
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <IoSearchOutline size={16} className="search-icon" />
          <input className="search-input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
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
          <IoCheckmarkCircle size={48} />
          <h3>No tasks found</h3>
          <p>{role === 'team-owner' ? 'Create tasks for your module assignments.' : 'No tasks assigned yet.'}</p>
          {role === 'team-owner' && <Link to="/tasks/create" className="btn btn-primary"><IoAddOutline size={16} /> Create Task</Link>}
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(task => (
            <div key={task._id} className="item-card" style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/tasks/${task._id}`)}>
              <div className="item-card-header">
                <h3 className="item-card-title">{task.taskName}</h3>
                <span className={`badge badge-${statusColor(task.status)}`}>{task.status || 'pending'}</span>
              </div>
              <p className="item-card-desc">{task.description}</p>
              {task.moduleName && <div className="item-card-tag">Module: {task.moduleName}</div>}
              <div className="item-card-meta">
                <span><IoPeopleOutline size={13} /> {task.members?.length || 0} assigned</span>
                <span><IoCalendarOutline size={13} /> {task.completeBy ? new Date(task.completeBy).toLocaleDateString() : 'No deadline'}</span>
              </div>
              {task.members && task.members.length > 0 && (
                <div className="member-chips">
                  {task.members.map((m, i) => {
                    const id = typeof m === 'object' ? String(m._id) : String(m);
                    const name = typeof m === 'object' ? m.name : getMemberName(id);
                    return <span key={i} className="member-chip">{name.charAt(0).toUpperCase()}{name.slice(1, 8)}</span>;
                  })}
                </div>
              )}
              <div className="item-card-actions" onClick={e => e.stopPropagation()}>
                {(role === 'developer' || role === 'team-owner') && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setStatusModal({ taskId: task._id, taskName: task.taskName }); setNewStatus(task.status || 'pending'); }}
                  >
                    <IoCreateOutline size={13} /> Update Status
                  </button>
                )}
                {role === 'team-owner' && (
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(task._id)}>
                    <IoTrashOutline size={13} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Update Task Status">
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
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Task">
        <p>Are you sure you want to delete this task?</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default TaskList;
