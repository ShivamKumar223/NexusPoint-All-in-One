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

const ModuleList = () => {
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const { setActiveMenu } = useMenu();
  const role = getRole();
  const [modules, setModules] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [statusModal, setStatusModal] = useState({ open: false, module: null });
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => { setActiveMenu('modules'); fetchData(); }, []);

  const fetchData = async () => {
    try {
      if (role === 'project-manager') {
        const pRes = await API.get('/project-manager/projects');
        const projs = pRes.data.data || pRes.data.projects || [];
        setProjects(projs);
        const allModules = [];
        for (const proj of projs) {
          try {
            const mRes = await API.get(`/project-manager/modules/${proj._id}`);
            const mods = mRes.data.data || mRes.data.modules || [];
            allModules.push(...mods.map(m => ({ ...m, projectName: proj.projectName })));
          } catch {}
        }
        setModules(allModules);
      } else if (role === 'team-owner') {
        const res = await API.get('/team-owner/modules');
        setModules(res.data.data || res.data.modules || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async () => {
    try {
      if (role === 'project-manager') {
        await API.patch(`/project-manager/module/${statusModal.module._id}`, { status: newStatus });
      } else {
        await API.get(`/team-owner/module`, { params: { moduleId: statusModal.module._id, newStatus } });
      }
      toast.success('Status updated!');
      setStatusModal({ open: false, module: null });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const filtered = modules.filter(m => {
    const matchSearch = m.moduleName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filters.status || m.status === filters.status;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="spinner" />;

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Modules</h1>
        {role === 'project-manager' && <button className="btn btn-primary" onClick={() => navigate('/modules/create')}><IoAdd size={18} /> New Module</button>}
      </div>
      <SearchFilter searchValue={search} onSearchChange={setSearch} placeholder="Search modules..."
        filters={[{ label: 'All Status', value: 'status', options: [
          { label: 'Pending', value: 'pending' }, { label: 'In Progress', value: 'inprogress' },
          { label: 'Review', value: 'review' }, { label: 'Complete', value: 'complete' }, { label: 'Archive', value: 'archive' },
        ]}]}
        activeFilters={filters} onFilterChange={(key, val) => setFilters({ ...filters, [key]: val })}
      />
      {filtered.length === 0 ? (
        <div className="empty-state"><h3>No modules found</h3><p>{role === 'project-manager' ? 'Create modules for your projects.' : 'No modules assigned to you yet.'}</p></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Module Name</th><th>Description</th><th>Status</th><th>Due Date</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m._id}>
                  <td style={{ fontWeight: 500 }}>{m.moduleName}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.description}</td>
                  <td><span className={`badge badge-${m.status}`}>{m.status}</span></td>
                  <td>{m.completeBy ? new Date(m.completeBy).toLocaleDateString() : '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => { setStatusModal({ open: true, module: m }); setNewStatus(m.status); }}>Update Status</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={statusModal.open} onClose={() => setStatusModal({ open: false, module: null })} title="Update Module Status" size="sm">
        <div className="form-group"><label>New Status</label>
          <select className="form-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
            <option value="pending">Pending</option><option value="inprogress">In Progress</option>
            <option value="review">Review</option><option value="complete">Complete</option><option value="archive">Archive</option>
          </select>
        </div>
        <div className="form-actions"><button className="btn btn-outline" onClick={() => setStatusModal({ open: false, module: null })}>Cancel</button><button className="btn btn-primary" onClick={handleUpdateStatus}>Update</button></div>
      </Modal>
    </div>
  );
};

export default ModuleList;
