import { useNavigate } from 'react-router-dom';
import { IoCodeSlash, IoShieldCheckmark, IoPersonCircle, IoGitBranch, IoPeopleCircle, IoCode } from 'react-icons/io5';
import './Auth.css';

const roles = [
  { key: 'master-Admin', label: 'Master Admin', desc: 'Organization Owner', icon: IoShieldCheckmark, color: '#6c63ff', bg: 'rgba(108,99,255,0.15)', path: '/signup' },
  { key: 'admin', label: 'Admin', desc: 'Manage members & projects', icon: IoPersonCircle, color: '#58a6ff', bg: 'rgba(88,166,255,0.15)', path: '/login' },
  { key: 'project-manager', label: 'Project Manager', desc: 'Manage projects & modules', icon: IoGitBranch, color: '#3fb950', bg: 'rgba(63,185,80,0.15)', path: '/login' },
  { key: 'team-owner', label: 'Team Owner', desc: 'Manage tasks & modules', icon: IoPeopleCircle, color: '#d29922', bg: 'rgba(210,153,34,0.15)', path: '/login' },
  { key: 'developer', label: 'Developer', desc: 'Work on assigned tasks', icon: IoCode, color: '#f85149', bg: 'rgba(248,81,73,0.15)', path: '/login' },
];

const CategoryPage = () => {
  const navigate = useNavigate();
  const handleSelect = (role) => {
    navigate(role.path, { state: { role: role.key } });
  };

  return (
    <div className="category-page">
      <div className="category-content">
        <div className="auth-brand"><IoCodeSlash /><span>Smart DevColab</span></div>
        <h1>Welcome</h1>
        <p>Choose your role to continue</p>
        <div className="role-grid">
          {roles.map(role => {
            const Icon = role.icon;
            return (
              <div key={role.key} className="role-card" onClick={() => handleSelect(role)}>
                <div className="role-icon" style={{ background: role.bg, color: role.color }}><Icon /></div>
                <h3>{role.label}</h3>
                <p>{role.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
