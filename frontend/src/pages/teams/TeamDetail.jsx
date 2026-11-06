import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import {
  IoArrowBack, IoPeopleOutline, IoPersonOutline,
  IoBriefcaseOutline, IoCodeSlashOutline, IoShieldCheckmarkOutline
} from 'react-icons/io5';
import '../shared/Shared.css';

const roleColor = (role) => {
  const map = { 'team-owner': 'success', 'developer': 'info', 'project-manager': 'purple', admin: 'warning' };
  return map[role] || 'secondary';
};

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { getRole } = useAuth();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = getRole();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        // Try PM endpoint first
        const endpoint = role === 'project-manager'
          ? `/project-manager/team/${teamId}`
          : `/team-owner/team`;
        const res = await api.get(endpoint);
        // For team-owner, find in list; for PM get direct
        if (role === 'project-manager') {
          setTeam(res.data.data);
        } else {
          setTeam(res.data.data);
        }
      } catch {
        toast.error('Failed to load team');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [teamId, role]);

  if (loading) return <div className="page-loading">Loading team...</div>;
  if (!team) return <div className="page-empty">Team not found.</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-icon" onClick={() => navigate('/teams')} title="Back">
            <IoArrowBack size={20} />
          </button>
          <div>
            <h1 className="page-title">{team.teamName}</h1>
            <p className="page-subtitle">{team.description}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <span className="stat-label"><IoPeopleOutline size={14} /> Members</span>
          <span className="stat-value">{team.members?.length || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Created</span>
          <span className="stat-value" style={{ fontSize: '0.9rem' }}>{new Date(team.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Members */}
      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <h3>Team Members</h3>
      </div>

      {(!team.members || team.members.length === 0) ? (
        <div className="empty-state">
          <IoPeopleOutline size={40} />
          <p>No members in this team.</p>
        </div>
      ) : (
        <div className="card-grid">
          {team.members.map((member, i) => {
            const isObj = typeof member === 'object' && member !== null;
            const name = isObj ? member.name : `Member ${i + 1}`;
            const designation = isObj ? member.designation : '';
            const memberRole = isObj ? (Array.isArray(member.role) ? member.role[0] : member.role) : '';
            const memberId = isObj ? member.memberId : '';
            const skills = isObj ? member.skills : [];

            return (
              <div key={i} className="item-card member-card">
                <div className="member-avatar-lg">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="member-info">
                  <h4 className="member-name">{name}</h4>
                  {memberId && <p className="member-id-text"><IoPersonOutline size={12} /> {memberId}</p>}
                  {designation && (
                    <p className="member-designation">
                      <IoBriefcaseOutline size={12} /> {designation}
                    </p>
                  )}
                  {memberRole && (
                    <span className={`badge badge-${roleColor(memberRole)}`}>
                      <IoShieldCheckmarkOutline size={11} /> {memberRole}
                    </span>
                  )}
                  {skills && skills.length > 0 && (
                    <div className="member-skills">
                      {skills.map((s, si) => (
                        <span key={si} className="skill-tag"><IoCodeSlashOutline size={11} /> {s}</span>
                      ))}
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
