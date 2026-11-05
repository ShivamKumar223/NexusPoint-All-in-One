import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../../context/MenuContext';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import SearchFilter from '../../components/common/SearchFilter';
import Modal from '../../components/common/Modal';
import { IoAdd, IoTrash, IoCreate } from 'react-icons/io5';
import '../shared/Shared.css';

const MemberList = () => {
  const navigate = useNavigate();
  const { setActiveMenu } = useMenu();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [editModal, setEditModal] = useState({ open: false, member: null });
  const [editForm, setEditForm] = useState({ name: '', designation: '', skills: '' });

  useEffect(() => { setActiveMenu('members'); fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      const res = await API.get('/master-admin/members');
      setMembers(res.data.data || res.data.members || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      await API.delete(`/master-admin/member/${id}`);
      toast.success('Member deleted');
      fetchMembers();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const openEdit = (member) => {
    setEditForm({ name: member.name, designation: member.designation, skills: member.skills?.join(', ') || '' });
    setEditModal({ open: true, member });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/master-admin/member/${editModal.member._id}`, {
        name: editForm.name, designation: editForm.designation,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      toast.success('Member updated');
      setEditModal({ open: false, member: null });
      fetchMembers();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const filtered = members.filter(m => {
    const matchSearch = m.name?.toLowerCase().includes(search.toLowerCase()) || m.memberId?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filters.role || (Array.isArray(m.role) ? m.role.includes(filters.role) : m.role === filters.role);
    return matchSearch && matchRole;
  });

  if (loading) return <div className="spinner" />;

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Members</h1>
        <button className="btn btn-primary" onClick={() => navigate('/members/create')}><IoAdd size={18} /> Add Member</button>
      </div>
      <SearchFilter searchValue={search} onSearchChange={setSearch} placeholder="Search members..."
        filters={[{ label: 'All Roles', value: 'role', options: [
          { label: 'Admin', value: 'admin' }, { label: 'Project Manager', value: 'project-manager' },
          { label: 'Team Owner', value: 'team-owner' }, { label: 'Developer', value: 'developer' },
        ]}]}
        activeFilters={filters} onFilterChange={(key, val) => setFilters({ ...filters, [key]: val })}
      />
      {filtered.length === 0 ? (
        <div className="empty-state"><h3>No members found</h3><p>Create your first member to get started.</p></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Member ID</th><th>Role</th><th>Designation</th><th>Skills</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m._id}>
                  <td style={{ fontWeight: 500 }}>{m.name}</td>
                  <td><code style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{m.memberId}</code></td>
                  <td>{(Array.isArray(m.role) ? m.role : [m.role]).map(r => <span key={r} className="badge badge-inprogress" style={{ marginRight: 4 }}>{r}</span>)}</td>
                  <td>{m.designation}</td>
                  <td>{m.skills?.slice(0, 3).join(', ')}{m.skills?.length > 3 ? '...' : ''}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn-icon" onClick={() => openEdit(m)} title="Edit"><IoCreate size={16} /></button>
                      <button className="btn-icon" onClick={() => handleDelete(m._id)} title="Delete" style={{ color: 'var(--danger)' }}><IoTrash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, member: null })} title="Edit Member">
        <form onSubmit={handleUpdate}>
          <div className="form-group"><label>Name</label><input className="form-input" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required /></div>
          <div className="form-group"><label>Designation</label><input className="form-input" value={editForm.designation} onChange={e => setEditForm({ ...editForm, designation: e.target.value })} required /></div>
          <div className="form-group"><label>Skills (comma separated)</label><input className="form-input" value={editForm.skills} onChange={e => setEditForm({ ...editForm, skills: e.target.value })} /></div>
          <div className="form-actions"><button type="button" className="btn btn-outline" onClick={() => setEditModal({ open: false, member: null })}>Cancel</button><button type="submit" className="btn btn-primary">Update</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default MemberList;
