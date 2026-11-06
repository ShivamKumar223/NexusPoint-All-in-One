import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import {
  IoArrowBack, IoPeopleOutline, IoCalendarOutline,
  IoCreateOutline, IoPersonOutline, IoBriefcaseOutline
} from 'react-icons/io5';
import Modal from '../../components/common/Modal';
import '../shared/Shared.css';

const STATUS_OPTIONS = ['pending', 'inprogress', 'review', 'complete', 'archive'];
const statusColor = s => ({ pending:'warning', inprogress:'info', review:'purple', complete:'success', archive:'secondary' }[s] || 'secondary');

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const { broadcastNotification } = useNotifications();
  const role = getRole();

  const [task, setTask] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (role === 'team-owner') {
          // Fetch modules then tasks to find this task
          const mr = await api.get('/team-owner/modules');
          const mods = mr.data.data || [];
          for (const mod of mods) {
            try {
              const tr = await api.get(`/team-owner/tasks/${mod._id}`);
              const ts = tr.data.data || [];
              const found = ts.find(t => String(t._id) === taskId);
              if (found) { setTask({ ...found, moduleName: mod.moduleName }); setNewStatus(found.status || 'pending'); break; }
            } catch { continue; }
          }
        } else if (role === 'developer') {
          // getMyTasks now returns plain Task objects with moduleName injected
          const tr = await api.get('/employee/tasks');
          const tasks = tr.data.data || [];
          const found = tasks.find(t => String(t._id) === taskId);
          if (found) {
            setTask(found);
            setNewStatus(found.status || 'pending');
          }
        }
        // Fetch team members for sidebar — teams endpoint now returns array of Team objects
        try {
          const teamRes = await api.get(role === 'developer' ? '/employee/team' : '/team-owner/team');
          const data = teamRes.data.data;
          // data is now an array of teams — collect all members
          const teams = Array.isArray(data) ? data : (data ? [data] : []);
          const allMembers = [];
          teams.forEach(t => {
            (t.members || []).forEach(m => {
              if (!allMembers.find(ex => String(ex._id) === String(m._id || m))) allMembers.push(m);
            });
          });
          setTeamMembers(allMembers);
        } catch { /* no team data */ }
      } catch { toast.error('Failed to load task'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [taskId, role]);

  const handleStatusUpdate = async () => {
    try {
      if (role === 'developer') {
        await api.patch('/employee/update', { taskId, newStatus });
        // Notify team members
        const memberIds = teamMembers.map(m => String(m._id || m));
        broadcastNotification(memberIds, {
          title: 'Task Status Updated',
          message: `Task "${task?.taskName}" is now "${newStatus}"`,
          type: 'success',
        });
      } else if (role === 'team-owner') {
        await api.patch(`/team-owner/task/${taskId}`, { status: newStatus });
      }
      setTask(prev => ({ ...prev, status: newStatus }));
      toast.success('Status updated!');
      setStatusModal(false);
    } catch { toast.error('Failed to update status'); }
  };

  const getMemberObj = (m) => {
    if (typeof m === 'object' && m !== null) return m;
    return teamMembers.find(tm => String(tm._id) === String(m));
  };

  if (loading) return <div className="page-loading">Loading task...</div>;
  if (!task) return <div className="page-empty">Task not found.</div>;

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/tasks">Tasks</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{task.taskName}</span>
      </nav>

      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-icon" onClick={() => navigate('/tasks')}><IoArrowBack size={20} /></button>
          <div>
            <h1 className="page-title">{task.taskName}</h1>
            {task.moduleName && <p className="page-subtitle">Module: {task.moduleName}</p>}
          </div>
        </div>
        <div className="page-header-actions">
          <span className={`badge badge-${statusColor(task.status)}`}>{task.status || 'pending'}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setStatusModal(true)}>
            <IoCreateOutline size={15} /> Update Status
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        <div className="stat-card">
          <span className="stat-label"><IoPeopleOutline size={14} /> Assigned</span>
          <span className="stat-value">{task.members?.length || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label"><IoCalendarOutline size={14} /> Due</span>
          <span className="stat-value" style={{ fontSize:'0.9rem' }}>
            {task.completeBy ? new Date(task.completeBy).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>

      {/* Overview */}
      <div className="detail-info-card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="detail-section-title">Task Details</h3>
        <div className="detail-field"><span className="detail-field-label">Description</span><span className="detail-field-value">{task.description || '—'}</span></div>
        <div className="detail-field"><span className="detail-field-label">Status</span><span className={`badge badge-${statusColor(task.status)}`}>{task.status || 'pending'}</span></div>
        <div className="detail-field"><span className="detail-field-label">Due Date</span><span className="detail-field-value">{task.completeBy ? new Date(task.completeBy).toLocaleDateString() : '—'}</span></div>
      </div>

      {/* Assigned Members */}
      <div className="section-header" style={{ marginBottom:'1rem' }}>
        <h3>Assigned Members ({task.members?.length || 0})</h3>
      </div>
      {(!task.members || task.members.length === 0) ? (
        <div className="empty-state"><IoPeopleOutline size={36} /><p>No members assigned.</p></div>
      ) : (
        <div className="card-grid">
          {task.members.map((m, i) => {
            const member = getMemberObj(m);
            const name = member?.name || `Member ${i + 1}`;
            const memberId = member?._id || m;
            return (
              <div key={i} className="item-card member-card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/members/${memberId}`)}>
                <div className="member-avatar-lg">{name.charAt(0).toUpperCase()}</div>
                <div className="member-info">
                  <h4 className="member-name">{name}</h4>
                  {member?.memberId && <p className="member-id-text"><IoPersonOutline size={12} /> {member.memberId}</p>}
                  {member?.designation && <p className="member-designation"><IoBriefcaseOutline size={12} /> {member.designation}</p>}
                  <span className="badge badge-info" style={{ marginTop:'0.25rem', fontSize:'0.72rem' }}>
                    {Array.isArray(member?.role) ? member.role[0] : member?.role || 'developer'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Modal */}
      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Task Status">
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

export default TaskDetail;
