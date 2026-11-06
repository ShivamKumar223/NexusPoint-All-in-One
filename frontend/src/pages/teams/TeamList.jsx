import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import {
  IoAddOutline, IoTrashOutline, IoPeopleOutline,
  IoSearchOutline, IoEyeOutline
} from 'react-icons/io5';
import Modal from '../../components/common/Modal';
import '../shared/Shared.css';

const TeamList = () => {
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const role = getRole();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetchTeams = async () => {
    try {
      let res;
      if (role === 'project-manager') {
        res = await api.get('/project-manager/teams');
        setTeams(res.data.data || []);
      } else if (role === 'team-owner') {
        // Returns array of Team objects (after backend fix)
        res = await api.get('/team-owner/team');
        const data = res.data.data;
        setTeams(Array.isArray(data) ? data : (data ? [data] : []));
      } else if (role === 'developer') {
        // Same endpoint format
        res = await api.get('/employee/team');
        const data = res.data.data;
        setTeams(Array.isArray(data) ? data : (data ? [data] : []));
      } else {
        // admin/master-admin
        const endpoint = role === 'master-Admin' ? '/master-admin/teams' : '/admin/teams';
        res = await api.get(endpoint);
        setTeams(res.data.data || []);
      }
    } catch {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, [role]);

  const handleDelete = async () => {
    try {
      await api.delete(`/project-manager/team/${deleteId}`);
      toast.success('Team deleted');
      setDeleteId(null);
      fetchTeams();
    } catch {
      toast.error('Failed to delete team');
    }
  };

  const filtered = teams.filter(t =>
    t.teamName?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page-loading">Loading teams...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Teams</h1>
          <p className="page-subtitle">{teams.length} team{teams.length !== 1 ? 's' : ''}</p>
        </div>
        {role === 'project-manager' && (
          <Link to="/teams/create" className="btn btn-primary">
            <IoAddOutline size={18} /> New Team
          </Link>
        )}
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <IoSearchOutline size={16} className="search-icon" />
          <input className="search-input" placeholder="Search teams..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <IoPeopleOutline size={48} />
          <h3>No teams found</h3>
          <p>{role === 'project-manager' ? 'Create your first team.' : 'No team assigned yet.'}</p>
          {role === 'project-manager' && <Link to="/teams/create" className="btn btn-primary"><IoAddOutline size={16} /> Create Team</Link>}
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(team => (
            <div key={team._id} className="item-card">
              <div className="item-card-header">
                <h3 className="item-card-title">{team.teamName}</h3>
                <span className="badge badge-info"><IoPeopleOutline size={12} /> {team.members?.length || 0}</span>
              </div>
              <p className="item-card-desc">{team.description}</p>
              {team.members && team.members.length > 0 && (
                <div className="member-chips">
                  {team.members.slice(0, 4).map((m, i) => {
                    const isObj = typeof m === 'object' && m !== null;
                    const name = isObj ? m.name : `M${i + 1}`;
                    return (
                      <span key={i} className="member-chip" title={name}>
                        {name.charAt(0).toUpperCase()}
                      </span>
                    );
                  })}
                  {team.members.length > 4 && (
                    <span className="member-chip">+{team.members.length - 4}</span>
                  )}
                </div>
              )}
              <div className="item-card-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/teams/${team._id}`)}
                >
                  <IoEyeOutline size={14} /> View
                </button>
                {role === 'project-manager' && (
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(team._id)}>
                    <IoTrashOutline size={14} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Team">
        <p>Are you sure you want to delete this team?</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default TeamList;
