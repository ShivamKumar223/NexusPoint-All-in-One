import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { IoArrowBack, IoPersonOutline, IoWarningOutline, IoPeopleOutline } from 'react-icons/io5';
import '../shared/Shared.css';

const CreateTeam = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { broadcastNotification } = useNotifications();

  const [form, setForm] = useState({ teamName: '', description: '' });
  const [orgMembers, setOrgMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [existingTeams, setExistingTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, teamsRes] = await Promise.all([
          api.get('/project-manager/org-members'),
          api.get('/project-manager/org-teams'),
        ]);
        setOrgMembers(membersRes.data.data || []);
        setExistingTeams(teamsRes.data.data || []);
      } catch {
        toast.error('Failed to load members');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getMemberTeam = (memberId) => {
    return existingTeams.find(t =>
      t.members?.some(m => String(m._id || m) === String(memberId))
    );
  };

  const toggleMember = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const hasTeamOwner = selectedMembers.some(id => {
    const m = orgMembers.find(m => String(m._id) === String(id));
    if (!m) return false;
    const roles = Array.isArray(m.role) ? m.role : [m.role];
    return roles.includes('team-owner');
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedMembers.length === 0) return toast.error('Select at least one member');
    if (!hasTeamOwner) return toast.error('Team must have at least one Team Owner');
    setSubmitting(true);
    try {
      const res = await api.post('/project-manager/team', {
        ...form,
        members: selectedMembers
      });
      // Broadcast notification to selected members
      broadcastNotification(selectedMembers, {
        title: 'Added to Team',
        message: `You have been added to team "${form.teamName}"`,
        type: 'success'
      });
      toast.success('Team created successfully!');
      navigate('/teams');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMembers = orgMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.designation.toLowerCase().includes(search.toLowerCase()) ||
    (Array.isArray(m.role) ? m.role.join(' ') : m.role).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page-loading">Loading members...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-icon" onClick={() => navigate('/teams')} title="Back">
            <IoArrowBack size={20} />
          </button>
          <div>
            <h1 className="page-title">Create Team</h1>
            <p className="page-subtitle">Build a new team from your organization members</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        {/* Basic Info */}
        <div className="form-section">
          <h3 className="form-section-title">Team Information</h3>
          <div className="form-group">
            <label className="form-label">Team Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Frontend Team"
              value={form.teamName}
              onChange={e => setForm(p => ({ ...p, teamName: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the team's purpose and responsibilities"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              required
              rows={3}
            />
          </div>
        </div>

        {/* Member Selector */}
        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">
              <IoPeopleOutline size={18} /> Select Members
              <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>{selectedMembers.length} selected</span>
            </h3>
          </div>

          {!hasTeamOwner && selectedMembers.length > 0 && (
            <div className="alert alert-warning">
              <IoWarningOutline size={16} /> At least one member must have the <strong>Team Owner</strong> role.
            </div>
          )}

          <input
            className="form-input"
            placeholder="Search by name, designation or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />

          <div className="member-select-grid">
            {filteredMembers.map(member => {
              const roles = Array.isArray(member.role) ? member.role : [member.role];
              const isSelected = selectedMembers.includes(String(member._id));
              const memberTeam = getMemberTeam(member._id);
              const isTeamOwner = roles.includes('team-owner');

              return (
                <label
                  key={member._id}
                  className={`member-select-card ${isSelected ? 'selected' : ''} ${memberTeam ? 'in-team' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleMember(String(member._id))}
                    style={{ display: 'none' }}
                  />
                  <div className="member-select-avatar">{member.name.charAt(0).toUpperCase()}</div>
                  <div className="member-select-info">
                    <div className="member-select-name">{member.name}</div>
                    <div className="member-select-meta">
                      <span className="member-select-designation">{member.designation}</span>
                      {roles.map((r, i) => (
                        <span key={i} className={`badge badge-sm ${isTeamOwner ? 'badge-success' : 'badge-info'}`}>{r}</span>
                      ))}
                    </div>
                    {memberTeam && (
                      <div className="member-team-badge">
                        <IoPersonOutline size={11} /> Already in: <strong>{memberTeam.teamName}</strong>
                      </div>
                    )}
                  </div>
                  <div className={`member-select-check ${isSelected ? 'checked' : ''}`}>✓</div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/teams')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeam;
