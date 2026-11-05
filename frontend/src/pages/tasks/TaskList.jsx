import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import SearchFilter from '../../components/common/SearchFilter';
import Modal from '../../components/common/Modal';
import { IoAdd } from 'react-icons/io5';
import '../shared/Shared.css';

const TaskList = () => {
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const { setActiveMenu } = useMenu();
  const role = getRole();
  const [tasks, setTasks] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [statusModal, setStatusModal] = useState({ open: false, task: null });
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => { setActiveMenu('tasks'); fetchData(); }, []);

  const fetchData = async () => {
    try {
      if (role === 'team-owner') {
        const modRes = await API.get('/team-owner/modules');
        const mods = modRes.data.data || modRes.data.modules || [];
        setModules(mods);
        const allTasks = [];
        for (const mod of mods) {
          try {
            const tRes = await API.get(`/team-owner/tasks/${mod._id}`);
            const ts = tRes.data.data || tRes.data.tasks || [];
            allTasks.push(...ts.map(t => ({ ...t, moduleName: mod.moduleName })));
          } catch {}
        }
        setTasks(allTasks);
      } else if (role === 'developer') {
        const res = await API.get('/employee/tasks');
        setTasks(res.data.data || res.data.tasks || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async () => {
    try {
      if (role === 'developer') {
        await API.patch('/employee/update', { taskId: statusModal.task._id, newStatus });
      } else {
        await API.patch(`/team-owner/task/${statusModal.task._id}`, { status: newStatus });
      }
      toast.success('Status updated!');
      setStatusModal({ open: false, task: null });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.taskName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filters.status || t.status === filters.status;
    return matchSearch && matchStatus;
  });

  const statusFilters = [
    { label: 'All Status', value: 'status', options: [
      { label: 'Pending', value: 'pending' },
      { label: 'In Progress', value: 'inprogress' },
      { label: 'Review', value: 'review' },
      { label: 'Complete', value: 'complete' },
      { label: 'Archive', value: 'archive' },
    ]}
  ];

  if (loading) return <div className="spinner" />;

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Tasks</h1>
        {role === 'team-owner' && (
          <button className="btn btn-primary" onClick={() => navigate('/tasks/create')}>
            <IoAdd size={18} /> New Task
          </button>
        )}
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search tasks..."
        filters={statusFilters}
        activeFilters={filters}
        onFilterChange={(key, val) => setFilters({ ...filters, [key]: val })}
      />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks found</h3>
          <p>{role === 'developer' ? 'No tasks assigned to you yet.' : 'Create tasks for your modules.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Description</th>
                {tasks[0]?.moduleName && <th>Module</th>}
                <th>Status</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t._id}>
                  <td style={{ fontWeight: 500 }}>{t.taskName}</td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</td>
                  {t.moduleName && <td><span className="badge badge-review">{t.moduleName}</span></td>}
                  <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                  <td>{t.completeBy ? new Date(t.completeBy).toLocaleDateString() : '—'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => { setStatusModal({ open: true, task: t }); setNewStatus(t.status); }}
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={statusModal.open} onClose={() => setStatusModal({ open: false, task: null })} title="Update Task Status" size="sm">
        <div className="form-group">
          <label>New Status</label>
          <select className="form-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="inprogress">In Progress</option>
            <option value="review">Review</option>
            <option value="complete">Complete</option>
            <option value="archive">Archive</option>
          </select>
        </div>
        <div className="form-actions">
          <button className="btn btn-outline" onClick={() => setStatusModal({ open: false, task: null })}>Cancel</button>
          <button className="btn btn-primary" onClick={handleUpdateStatus}>Update</button>
        </div>
      </Modal>
    </div>
  );
};

export default TaskList;
