import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import {
  IoArrowBack, IoPeopleOutline, IoPersonOutline,
  IoBriefcaseOutline, IoCodeSlashOutline, IoShieldCheckmarkOutline
} from 'react-icons/io5';
import '../shared/Shared.css';

const roleColor = r => ({ admin:'warning', 'project-manager':'purple', 'team-owner':'success', developer:'info' }[r] || 'secondary');

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const role = getRole();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        let res;
        if (role === 'master-Admin') {
          res = await api.get(`/master-admin/team/${teamId}`);
          setTeam(res.data.data);
        } else if (role === 'admin') {
          res = await api.get(`/admin/team/${teamId}`);
          setTeam(res.data.data);
        } else if (role === 'project-manager') {
          res = await api.get(`/project-manager/team/${teamId}`);
          setTeam(res.data.data);
        } else {
          // team-owner / developer — get their teams list and find by id
          const endpoint = role === 'developer' ? '/employee/team' : '/team-owner/team';
          res = await api.get(endpoint);
          const data = res.data.data;
          // data is now an array of Team objects
          const teams = Array.isArray(data) ? data : (data ? [data] : []);
          const found = teams.find(t => String(t._id) === teamId);
          setTeam(found || teams[0] || null); // fallback to first team
        }
      } catch { toast.error('Failed to load team'); }
      finally { setLoading(false); }
    };
    fetchTeam();
  }, [teamId, role]);

  if (loading) return <div className="page-loading">Loading team...</div>;
  if (!team) return <div className="page-empty">Team not found.</div>;

  const members = team.members || [];

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/teams">Teams</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{team.teamName}</span>
      </nav>

      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-icon" onClick={() => navigate('/teams')}><IoArrowBack size={20} /></button>
          <div>
            <h1 className="page-title">{team.teamName}</h1>
            <p className="page-subtitle">{team.description}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        <div className="stat-card">
          <span className="stat-label"><IoPeopleOutline size={14} /> Members</span>
          <span className="stat-value">{members.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Created</span>
          <span className="stat-value" style={{ fontSize:'0.85rem' }}>
            {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : '—'}
          </span>
        </div>
      </div>

      {/* Members */}
      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <h3>Team Members ({members.length})</h3>
      </div>

      {members.length === 0 ? (
        <div className="empty-state"><IoPeopleOutline size={40} /><p>No members in this team.</p></div>
      ) : (
        <div className="card-grid">
          {members.map((member, i) => {
            const isObj = typeof member === 'object' && member !== null;
            const name = isObj ? member.name : `Member ${i + 1}`;
            const designation = isObj ? member.designation : '';
            const memberRole = isObj ? (Array.isArray(member.role) ? member.role[0] : member.role) : '';
            const memberId = isObj ? (member._id || member.memberId) : member;
            const memberStrId = isObj ? member.memberId : '';
            const skills = isObj ? (member.skills || []) : [];

            return (
              <div key={i} className="item-card member-card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/members/${memberId}`)}>
                <div className="member-avatar-lg">{name.charAt(0).toUpperCase()}</div>
                <div className="member-info">
                  <h4 className="member-name">{name}</h4>
                  {memberStrId && (
                    <p className="member-id-text"><IoPersonOutline size={12} /> {memberStrId}</p>
                  )}
                  {designation && (
                    <p className="member-designation"><IoBriefcaseOutline size={12} /> {designation}</p>
                  )}
                  {memberRole && (
                    <span className={`badge badge-${roleColor(memberRole)}`} style={{ marginTop:'0.25rem' }}>
                      <IoShieldCheckmarkOutline size={11} /> {memberRole}
                    </span>
                  )}
                  {skills.length > 0 && (
                    <div className="member-skills" style={{ marginTop:'0.4rem' }}>
                      {skills.slice(0, 3).map((s, si) => (
                        <span key={si} className="skill-tag"><IoCodeSlashOutline size={10} /> {s}</span>
                      ))}
                      {skills.length > 3 && <span className="skill-tag">+{skills.length - 3}</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamDetail;
