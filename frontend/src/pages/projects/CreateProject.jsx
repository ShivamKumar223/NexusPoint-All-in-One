import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { IoArrowBack, IoPeopleOutline, IoWarningOutline, IoCheckmarkCircle } from 'react-icons/io5';
import '../shared/Shared.css';

const STATUS_OPTIONS = ['pending', 'inprogress', 'review', 'complete', 'archive'];

const CreateProject = () => {
  const navigate = useNavigate();
  const { broadcastNotification } = useNotifications();

  const [form, setForm] = useState({
    projectName: '',
    description: '',
    completeBy: '',
    status: 'pending'
  });
  const [orgTeams, setOrgTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [existingProjects, setExistingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, projectsRes] = await Promise.all([
          api.get('/project-manager/org-teams'),
          api.get('/project-manager/projects'),
        ]);
        setOrgTeams(teamsRes.data.data || []);
        setExistingProjects(projectsRes.data.data || []);
      } catch {
        setOrgTeams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTeamProject = (teamId) => {
    return existingProjects.find(p =>
      p.teams?.some(t => String(t._id || t) === String(teamId))
    );
  };

  const toggleTeam = (teamId) => {
    setSelectedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTeams.length === 0) return toast.error('Select at least one team');
    setSubmitting(true);
    try {
      const res = await api.post('/project-manager/project', {
        ...form,
        teams: selectedTeams
      });
      // Broadcast to all members of selected teams
      const memberIds = [];
      selectedTeams.forEach(teamId => {
        const team = orgTeams.find(t => String(t._id) === teamId);
        if (team?.members) {
          team.members.forEach(m => {
            const id = typeof m === 'object' ? String(m._id) : String(m);
            if (!memberIds.includes(id)) memberIds.push(id);
          });
        }
      });
      broadcastNotification(memberIds, {
        title: 'New Project Created',
        message: `A new project "${form.projectName}" has been created and your team is involved.`,
        type: 'info'
      });
      toast.success('Project created successfully!');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeams = orgTeams.filter(t =>
    t.teamName.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page-loading">Loading teams...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-icon" onClick={() => navigate('/projects')} title="Back">
            <IoArrowBack size={20} />
          </button>
          <div>
            <h1 className="page-title">Create Project</h1>
            <p className="page-subtitle">Set up a new project and assign teams</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3 className="form-section-title">Project Information</h3>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              className="form-input"
              placeholder="e.g. E-Commerce Platform"
              value={form.projectName}
              onChange={e => setForm(p => ({ ...p, projectName: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the project goals and scope"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              required
              rows={4}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Complete By *</label>
              <input
                type="date"
                className="form-input"
                value={form.completeBy}
                onChange={e => setForm(p => ({ ...p, completeBy: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Team Selector */}
        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">
              <IoPeopleOutline size={18} /> Assign Teams
              <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>{selectedTeams.length} selected</span>
            </h3>
          </div>
          <input
            className="form-input"
            placeholder="Search teams..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          {filteredTeams.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <IoPeopleOutline size={32} />
              <p>No teams found. <a href="/teams/create">Create a team first.</a></p>
            </div>
          ) : (
            <div className="member-select-grid">
              {filteredTeams.map(team => {
                const isSelected = selectedTeams.includes(String(team._id));
                const assignedProject = getTeamProject(team._id);
                return (
                  <label
                    key={team._id}
                    className={`member-select-card ${isSelected ? 'selected' : ''} ${assignedProject ? 'in-team' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTeam(String(team._id))}
                      style={{ display: 'none' }}
                    />
                    <div className="member-select-avatar" style={{ background: 'var(--accent-color)' }}>
                      {team.teamName.charAt(0).toUpperCase()}
                    </div>
                    <div className="member-select-info">
                      <div className="member-select-name">{team.teamName}</div>
                      <div className="member-select-meta">
                        <span>{team.members?.length || 0} members</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {team.description}
                      </div>
                      {assignedProject && (
                        <div className="member-team-badge">
                          <IoWarningOutline size={11} /> Assigned to: <strong>{assignedProject.projectName}</strong>
                        </div>
                      )}
                    </div>
                    <div className={`member-select-check ${isSelected ? 'checked' : ''}`}>✓</div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/projects')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
