import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';
import API from '../../api/axios';
import SearchFilter from '../../components/common/SearchFilter';
import { IoAdd } from 'react-icons/io5';
import '../shared/Shared.css';

const TeamList = () => {
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const { setActiveMenu } = useMenu();
  const role = getRole();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { setActiveMenu('teams'); fetchTeams(); }, []);

  const fetchTeams = async () => {
    try {
      const url = role === 'master-Admin' || role === 'admin' ? '/admins/teams' : '/project-manager/teams';
      const res = await API.get(url);
      setTeams(res.data.data || res.data.teams || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = teams.filter(t => t.teamName?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="spinner" />;

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Teams</h1>
        {(role === 'master-Admin' || role === 'admin' || role === 'project-manager') && (
          <button className="btn btn-primary" onClick={() => navigate('/teams/create')}><IoAdd size={18} /> New Team</button>
        )}
      </div>
      <SearchFilter searchValue={search} onSearchChange={setSearch} placeholder="Search teams..." />
      {filtered.length === 0 ? (
        <div className="empty-state"><h3>No teams found</h3><p>Create your first team!</p></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Team Name</th><th>Description</th><th>Members</th></tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t._id}>
                  <td style={{ fontWeight: 500 }}>{t.teamName}</td>
                  <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</td>
                  <td><span className="badge badge-inprogress">{t.members?.length || 0} members</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeamList;
