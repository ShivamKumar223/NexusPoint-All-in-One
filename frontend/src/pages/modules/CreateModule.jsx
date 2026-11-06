import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { IoArrowBack, IoPeopleOutline, IoWarningOutline } from 'react-icons/io5';
import '../shared/Shared.css';

const STATUS_OPTIONS = ['pending', 'inprogress', 'review', 'complete', 'archive'];

const CreateModule = () => {
  const navigate = useNavigate();
  const { broadcastNotification } = useNotifications();

  const [form, setForm] = useState({ moduleName: '', description: '', completeBy: '', status: 'pending' });
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectTeams, setProjectTeams] = useState([]); // teams belonging to selected project
  const [allOrgTeams, setAllOrgTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, teamsRes] = await Promise.all([
          api.get('/project-manager/projects'),
          api.get('/project-manager/org-teams'),
        ]);
        setProjects(projRes.data.data || []);
        setAllOrgTeams(teamsRes.data.data || []);
      } catch { toast.error('Failed to load data'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // When project changes → resolve its teams from org teams list
  useEffect(() => {
    setSelectedTeams([]);
    if (!selectedProjectId) { setProjectTeams([]); return; }
    setTeamsLoading(true);
    const proj = projects.find(p => String(p._id) === selectedProjectId);
    if (!proj || !proj.teams || proj.teams.length === 0) {
      setProjectTeams([]);
      setTeamsLoading(false);
      return;
    }
    // proj.teams may be populated objects OR plain IDs
    const resolved = proj.teams.map(t => {
      const tid = typeof t === 'object' ? String(t._id) : String(t);
      const full = allOrgTeams.find(ot => String(ot._id) === tid);
      return full || (typeof t === 'object' ? t : { _id: tid, teamName: `Team ${tid.slice(-4)}`, members: [] });
    });
    setProjectTeams(resolved);
    setTeamsLoading(false);
  }, [selectedProjectId, projects, allOrgTeams]);

  const toggleTeam = (teamId) => {
    setSelectedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return toast.error('Please select a project');
    if (selectedTeams.length === 0) return toast.error('Select at least one team for this module');
    setSubmitting(true);
    try {
      await api.post(`/project-manager/module/${selectedProjectId}`, {
        ...form,
        teams: selectedTeams,
      });
      // Notify members of selected teams
      const memberIds = [];
      selectedTeams.forEach(tid => {
        const team = projectTeams.find(t => String(t._id) === tid);
        (team?.members || []).forEach(m => {
          const id = typeof m === 'object' ? String(m._id) : String(m);
          if (!memberIds.includes(id)) memberIds.push(id);
        });
      });
      broadcastNotification(memberIds, {
        title: 'New Module Created',
        message: `Module "${form.moduleName}" has been created and your team is assigned.`,
        type: 'info',
      });
      toast.success('Module created successfully!');
      navigate('/modules');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create module');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-icon" onClick={() => navigate('/modules')}><IoArrowBack size={20} /></button>
          <div>
            <h1 className="page-title">Create Module</h1>
            <p className="page-subtitle">Break a project into manageable modules</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        {/* Project selector */}
        <div className="form-section">
          <h3 className="form-section-title">Select Project</h3>
          <div className="form-group">
            <label className="form-label">Project *</label>
            <select className="form-select" value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)} required>
              <option value="">-- Choose a Project --</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
            </select>
          </div>
        </div>

        {/* Module info */}
        <div className="form-section">
          <h3 className="form-section-title">Module Details</h3>
          <div className="form-group">
            <label className="form-label">Module Name *</label>
            <input className="form-input" placeholder="e.g. Authentication Module"
              value={form.moduleName} onChange={e => setForm(p => ({ ...p, moduleName: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" rows={3} placeholder="Describe this module's scope"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Complete By *</label>
              <input type="date" className="form-input" value={form.completeBy}
                onChange={e => setForm(p => ({ ...p, completeBy: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Team selector — mandatory, from project's teams only */}
        <div className="form-section">
          <h3 className="form-section-title">
            <IoPeopleOutline size={18} /> Assign Teams
            <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>{selectedTeams.length} selected</span>
            <span className="badge badge-danger" style={{ marginLeft: '0.4rem', fontSize: '0.68rem' }}>Required</span>
          </h3>

          {!selectedProjectId ? (
            <div className="alert alert-info">Select a project first to see its available teams.</div>
          ) : teamsLoading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading teams...</p>
          ) : projectTeams.length === 0 ? (
            <div className="alert alert-warning">
              <IoWarningOutline size={16} />
              This project has no teams assigned yet. <a href="/projects">Edit the project</a> to add teams first.
            </div>
          ) : (
            <>
              {selectedTeams.length === 0 && (
                <div className="alert alert-warning" style={{ marginBottom: '0.75rem' }}>
                  <IoWarningOutline size={15} /> At least one team must be selected.
                </div>
              )}
              <div className="member-select-grid">
                {projectTeams.map(team => {
                  const isSelected = selectedTeams.includes(String(team._id));
                  return (
                    <label key={team._id} className={`member-select-card ${isSelected ? 'selected' : ''}`}>
                      <input type="checkbox" checked={isSelected}
                        onChange={() => toggleTeam(String(team._id))} style={{ display: 'none' }} />
                      <div className="member-select-avatar" style={{ background: 'var(--accent)' }}>
                        {(team.teamName || 'T').charAt(0).toUpperCase()}
                      </div>
                      <div className="member-select-info">
                        <div className="member-select-name">{team.teamName}</div>
                        <div className="member-select-meta">
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {team.members?.length || 0} members
                          </span>
                        </div>
                        {team.description && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {team.description}
                          </div>
                        )}
                      </div>
                      <div className={`member-select-check ${isSelected ? 'checked' : ''}`}>✓</div>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/modules')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting || selectedTeams.length === 0}>
            {submitting ? 'Creating...' : 'Create Module'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateModule;
