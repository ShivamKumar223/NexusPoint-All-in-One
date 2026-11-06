import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { IoArrowBack, IoPeopleOutline } from 'react-icons/io5';
import '../shared/Shared.css';

const CreateTask = () => {
  const navigate = useNavigate();
  const { broadcastNotification } = useNotifications();

  const [form, setForm] = useState({ taskName: '', description: '', completeBy: '' });
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [moduleMembers, setModuleMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allOrgTeams, setAllOrgTeams] = useState([]);
  const [allOrgMembers, setAllOrgMembers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modulesRes = await api.get('/team-owner/modules');
        setModules(modulesRes.data.data || []);
        // Try to get team/member data via team endpoint
        try {
          const teamRes = await api.get('/team-owner/team');
          const teamData = teamRes.data.data;
          // teamData might be an enrollment or team object — handle both
          if (teamData && teamData.members) setAllOrgMembers(teamData.members);
          if (teamData && Array.isArray(teamData)) setAllOrgTeams(teamData);
        } catch { /* ignore */ }
      } catch {
        toast.error('Failed to load modules');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // When module changes, derive available members from module's teams
  useEffect(() => {
    if (!selectedModuleId) { setModuleMembers([]); setSelectedMembers([]); return; }
    setMembersLoading(true);
    try {
      const mod = modules.find(m => String(m._id) === selectedModuleId);
      if (!mod || !mod.teams || mod.teams.length === 0) {
        // Fall back to team members if available
        setModuleMembers(allOrgMembers || []);
      } else {
        // Find members from module's teams in allOrgTeams
        const members = [];
        mod.teams.forEach(teamId => {
          const team = allOrgTeams.find(t => String(t._id) === String(teamId._id || teamId));
          if (team?.members) {
            team.members.forEach(m => {
              if (!members.find(ex => String(ex._id) === String(m._id || m))) {
                members.push(m);
              }
            });
          }
        });
        setModuleMembers(members.length > 0 ? members : allOrgMembers);
      }
    } finally {
      setMembersLoading(false);
    }
    setSelectedMembers([]);
  }, [selectedModuleId, modules, allOrgTeams, allOrgMembers]);

  const toggleMember = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedModuleId) return toast.error('Please select a module');
    if (selectedMembers.length === 0) return toast.error('Select at least one member');
    setSubmitting(true);
    try {
      await api.post(`/team-owner/task/${selectedModuleId}`, {
        ...form,
        members: selectedMembers
      });
      broadcastNotification(selectedMembers, {
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${form.taskName}"`,
        type: 'info'
      });
      toast.success('Task created successfully!');
      navigate('/tasks');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading">Loading modules...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-icon" onClick={() => navigate('/tasks')} title="Back">
            <IoArrowBack size={20} />
          </button>
          <div>
            <h1 className="page-title">Create Task</h1>
            <p className="page-subtitle">Assign a task to your team members</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3 className="form-section-title">Task Information</h3>

          <div className="form-group">
            <label className="form-label">Select Module *</label>
            <select
              className="form-select"
              value={selectedModuleId}
              onChange={e => setSelectedModuleId(e.target.value)}
              required
            >
              <option value="">-- Choose a Module --</option>
              {modules.map(mod => (
                <option key={mod._id} value={mod._id}>{mod.moduleName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Task Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Implement Login API"
              value={form.taskName}
              onChange={e => setForm(p => ({ ...p, taskName: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the task requirements and acceptance criteria"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              required
              rows={4}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Complete By</label>
            <input
              type="date"
              className="form-input"
              value={form.completeBy}
              onChange={e => setForm(p => ({ ...p, completeBy: e.target.value }))}
            />
          </div>
        </div>

        {/* Member selector */}
        {selectedModuleId && (
          <div className="form-section">
            <h3 className="form-section-title">
              <IoPeopleOutline size={18} /> Assign Members
              <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>{selectedMembers.length} selected</span>
            </h3>
            {membersLoading ? (
              <p>Loading members...</p>
            ) : moduleMembers.length === 0 ? (
              <div className="alert alert-warning">No members found. Ensure the module has teams with members.</div>
            ) : (
              <div className="member-select-grid">
                {moduleMembers.map((member, i) => {
                  const isObj = typeof member === 'object' && member !== null;
                  const memberId = isObj ? String(member._id) : String(member);
                  const name = isObj ? member.name : `Member ${i + 1}`;
                  const designation = isObj ? member.designation : '';
                  const roles = isObj ? (Array.isArray(member.role) ? member.role : [member.role]) : [];
                  const isSelected = selectedMembers.includes(memberId);

                  return (
                    <label key={memberId} className={`member-select-card ${isSelected ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMember(memberId)}
                        style={{ display: 'none' }}
                      />
                      <div className="member-select-avatar">{name.charAt(0).toUpperCase()}</div>
                      <div className="member-select-info">
                        <div className="member-select-name">{name}</div>
                        <div className="member-select-meta">
                          {designation && <span className="member-select-designation">{designation}</span>}
                          {roles.map((r, ri) => (
                            <span key={ri} className="badge badge-sm badge-info">{r}</span>
                          ))}
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
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/tasks')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
