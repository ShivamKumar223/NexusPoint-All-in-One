import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { IoArrowBack, IoPeopleOutline } from 'react-icons/io5';
import '../shared/Shared.css';

const STATUS_OPTIONS = ['pending', 'inprogress', 'review', 'complete', 'archive'];

const CreateModule = () => {
  const navigate = useNavigate();
  const { broadcastNotification } = useNotifications();

  const [form, setForm] = useState({
    moduleName: '',
    description: '',
    completeBy: '',
    status: 'pending'
  });
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectTeams, setProjectTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allOrgTeams, setAllOrgTeams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, teamsRes] = await Promise.all([
          api.get('/project-manager/projects'),
          api.get('/project-manager/org-teams'),
        ]);
        setProjects(projRes.data.data || []);
        setAllOrgTeams(teamsRes.data.data || []);
      } catch {
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // When project changes, derive teams from that project's team list
  useEffect(() => {
    if (!selectedProjectId) { setProjectTeams([]); setSelectedTeams([]); return; }
    setTeamsLoading(true);
    try {
      const proj = projects.find(p => String(p._id) === selectedProjectId);
      if (!proj || !proj.teams || proj.teams.length === 0) {
        setProjectTeams([]);
      } else {
        // Map team IDs to full team objects from org teams
        const teams = proj.teams.map(t => {
          const teamObj = allOrgTeams.find(ot => String(ot._id) === String(t._id || t));
          return teamObj || { _id: t._id || t, teamName: 'Unknown Team', members: [] };
        });
        setProjectTeams(teams);
      }
    } finally {
      setTeamsLoading(false);
    }
    setSelectedTeams([]);
  }, [selectedProjectId, projects, allOrgTeams]);

  const toggleTeam = (teamId) => {
    setSelectedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return toast.error('Please select a project');
    setSubmitting(true);
    try {
      const res = await api.post(`/project-manager/module/${selectedProjectId}`, {
        ...form,
        teams: selectedTeams
      });
      // Broadcast to members of selected teams
      const memberIds = [];
      selectedTeams.forEach(teamId => {
        const team = projectTeams.find(t => String(t._id) === teamId);
        if (team?.members) {
          team.members.forEach(m => {
            const id = typeof m === 'object' ? String(m._id) : String(m);
            if (!memberIds.includes(id)) memberIds.push(id);
          });
        }
      });
      broadcastNotification(memberIds, {
        title: 'New Module Created',
        message: `Module "${form.moduleName}" has been created for your project.`,
        type: 'info'
      });
      toast.success('Module created successfully!');
      navigate('/modules');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create module');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading">Loading projects...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-icon" onClick={() => navigate('/modules')} title="Back">
            <IoArrowBack size={20} />
          </button>
          <div>
            <h1 className="page-title">Create Module</h1>
            <p className="page-subtitle">Break a project into manageable modules</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3 className="form-section-title">Module Information</h3>

          <div className="form-group">
            <label className="form-label">Select Project *</label>
            <select
              className="form-select"
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              required
            >
              <option value="">-- Choose a Project --</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.projectName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Module Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Authentication Module"
              value={form.moduleName}
              onChange={e => setForm(p => ({ ...p, moduleName: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              placeholder="Describe what this module covers"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              required
              rows={3}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Complete By</label>
              <input
                type="date"
                className="form-input"
                value={form.completeBy}
                onChange={e => setForm(p => ({ ...p, completeBy: e.target.value }))}
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

        {/* Team selector — only teams from selected project */}
        {selectedProjectId && (
          <div className="form-section">
            <h3 className="form-section-title">
              <IoPeopleOutline size={18} /> Assign Teams
              <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>{selectedTeams.length} selected</span>
            </h3>
            {teamsLoading ? (
              <p>Loading teams...</p>
            ) : projectTeams.length === 0 ? (
              <div className="alert alert-warning">No teams are assigned to this project yet. Edit the project to add teams first.</div>
            ) : (
              <div className="member-select-grid">
                {projectTeams.map(team => {
                  const isSelected = selectedTeams.includes(String(team._id));
                  return (
                    <label key={team._id} className={`member-select-card ${isSelected ? 'selected' : ''}`}>
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
                      </div>
                      <div className={`member-select-check ${isSelected ? 'checked' : ''}`}>✓</div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/modules')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Module'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateModule;
