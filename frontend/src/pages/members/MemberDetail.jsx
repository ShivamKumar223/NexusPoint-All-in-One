import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import {
  IoArrowBack, IoPersonOutline, IoBriefcaseOutline,
  IoShieldCheckmarkOutline, IoCodeSlashOutline, IoCalendarOutline
} from 'react-icons/io5';
import '../shared/Shared.css';

const roleColor = r => ({ admin:'warning', 'project-manager':'purple', 'team-owner':'success', developer:'info' }[r] || 'secondary');

const MemberDetail = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const role = getRole();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  // Track where to go back (from teams page or members page)
  const backPath = role === 'team-owner' || role === 'developer' ? '/teams' : '/members';
  const backLabel = role === 'team-owner' || role === 'developer' ? 'Teams' : 'Members';

  useEffect(() => {
    const fetch = async () => {
      try {
        let members = [];

        if (role === 'master-Admin') {
          const res = await api.get('/master-admin/members');
          members = res.data.data || [];
        } else if (role === 'admin') {
          const res = await api.get('/admin/members');
          members = res.data.data || [];
        } else if (role === 'project-manager') {
          const res = await api.get('/project-manager/org-members');
          members = res.data.data || [];
        } else if (role === 'team-owner') {
          // Get teams list (now returns array of Team objects with members populated)
          const res = await api.get('/team-owner/team');
          const teams = Array.isArray(res.data.data) ? res.data.data : [res.data.data].filter(Boolean);
          // Collect all members from all teams
          teams.forEach(t => { if (t?.members) members.push(...t.members); });
        } else if (role === 'developer') {
          // Same structure for developer
          const res = await api.get('/employee/team');
          const teams = Array.isArray(res.data.data) ? res.data.data : [res.data.data].filter(Boolean);
          teams.forEach(t => { if (t?.members) members.push(...t.members); });
        }

        // Find by MongoDB _id or the string memberId field
        const found = members.find(m =>
          String(m._id) === memberId || m.memberId === memberId
        );
        setMember(found || null);
      } catch (err) {
        toast.error('Failed to load member');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [memberId, role]);

  if (loading) return <div className="page-loading">Loading member...</div>;
  if (!member) return <div className="page-empty">Member not found.</div>;

  const roles = Array.isArray(member.role) ? member.role : [member.role].filter(Boolean);
  const displayName = member.name || 'Member';

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to={backPath}>{backLabel}</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{displayName}</span>
      </nav>

      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-icon" onClick={() => navigate(-1)}><IoArrowBack size={20} /></button>
          <div>
            <h1 className="page-title">{displayName}</h1>
            <p className="page-subtitle">{member.designation}</p>
          </div>
        </div>
      </div>

      <div className="detail-layout">
        {/* Avatar card */}
        <div className="detail-avatar-card">
          <div className="detail-avatar">{displayName.charAt(0).toUpperCase()}</div>
          <h2 className="detail-avatar-name">{displayName}</h2>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {roles.map((r, i) => (
              <span key={i} className={`badge badge-${roleColor(r)}`}>{r}</span>
            ))}
          </div>
          {member.memberId && (
            <code style={{ fontSize: '0.78rem', color: 'var(--accent)', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              {member.memberId}
            </code>
          )}
        </div>

        {/* Info card */}
        <div className="detail-info-card">
          <h3 className="detail-section-title">Member Information</h3>

          {member.memberId && (
            <div className="detail-field">
              <span className="detail-field-label"><IoPersonOutline size={14} /> Member ID</span>
              <span className="detail-field-value mono">{member.memberId}</span>
            </div>
          )}
          <div className="detail-field">
            <span className="detail-field-label"><IoBriefcaseOutline size={14} /> Designation</span>
            <span className="detail-field-value">{member.designation || '—'}</span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label"><IoShieldCheckmarkOutline size={14} /> Role(s)</span>
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {roles.length > 0
                ? roles.map((r, i) => <span key={i} className={`badge badge-${roleColor(r)}`}>{r}</span>)
                : <span className="detail-field-value">—</span>
              }
            </div>
          </div>
          <div className="detail-field">
            <span className="detail-field-label"><IoCalendarOutline size={14} /> Joined</span>
            <span className="detail-field-value">
              {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}
            </span>
          </div>
          {member.skills?.length > 0 && (
            <div className="detail-field" style={{ alignItems: 'flex-start' }}>
              <span className="detail-field-label"><IoCodeSlashOutline size={14} /> Skills</span>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {member.skills.map((s, i) => (
                  <span key={i} className="skill-tag">{s}</span>
                ))}
              </div>
            </div>
          )}
          {member.email && (
            <div className="detail-field">
              <span className="detail-field-label">Email</span>
              <span className="detail-field-value">{member.email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
