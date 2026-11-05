import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import SearchFilter from '../../components/common/SearchFilter';
import { IoAdd } from 'react-icons/io5';
import '../shared/Shared.css';

const ProjectList = () => {
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const { setActiveMenu } = useMenu();
  const role = getRole();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(() => { setActiveMenu('projects'); fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const url = role === 'master-Admin' || role === 'admin' ? '/admins/projects' : '/project-manager/projects';
      const res = await API.get(url);
      setProjects(res.data.data || res.data.projects || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = projects.filter(p => {
    const matchSearch = p.projectName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filters.status || p.status === filters.status;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="spinner" />;

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => navigate('/projects/create')}><IoAdd size={18} /> New Project</button>
      </div>
      <SearchFilter searchValue={search} onSearchChange={setSearch} placeholder="Search projects..."
        filters={[{ label: 'All Status', value: 'status', options: [
          { label: 'Pending', value: 'pending' }, { label: 'In Progress', value: 'inprogress' },
          { label: 'Review', value: 'review' }, { label: 'Complete', value: 'complete' }, { label: 'Archive', value: 'archive' },
        ]}]}
        activeFilters={filters} onFilterChange={(key, val) => setFilters({ ...filters, [key]: val })}
      />
      {filtered.length === 0 ? (
        <div className="empty-state"><h3>No projects found</h3><p>Create your first project!</p></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Project Name</th><th>Description</th><th>Status</th><th>Start Date</th><th>Due Date</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 500 }}>{p.projectName}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</td>
                  <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  <td>{p.startFrom ? new Date(p.startFrom).toLocaleDateString() : '—'}</td>
                  <td>{p.completeBy ? new Date(p.completeBy).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
