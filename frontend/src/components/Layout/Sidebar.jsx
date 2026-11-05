import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';
import { IoGridOutline, IoGrid, IoPeopleOutline, IoPeople, IoFolderOutline, IoFolder, IoPeopleCircleOutline, IoPeopleCircle, IoLayersOutline, IoLayers, IoCheckboxOutline, IoCheckbox, IoCalendarOutline, IoCalendar, IoLogOutOutline, IoCodeSlash, IoClose } from 'react-icons/io5';
import './Sidebar.css';

const navConfig = {
  'master-Admin': [
    { key: 'dashboard', label: 'Dashboard', icon: IoGridOutline, activeIcon: IoGrid, path: '/dashboard' },
    { key: 'members', label: 'Members', icon: IoPeopleOutline, activeIcon: IoPeople, path: '/members' },
    { key: 'projects', label: 'Projects', icon: IoFolderOutline, activeIcon: IoFolder, path: '/projects' },
    { key: 'teams', label: 'Teams', icon: IoPeopleCircleOutline, activeIcon: IoPeopleCircle, path: '/teams' },
  ],
  'admin': [
    { key: 'dashboard', label: 'Dashboard', icon: IoGridOutline, activeIcon: IoGrid, path: '/dashboard' },
    { key: 'members', label: 'Members', icon: IoPeopleOutline, activeIcon: IoPeople, path: '/members' },
    { key: 'projects', label: 'Projects', icon: IoFolderOutline, activeIcon: IoFolder, path: '/projects' },
    { key: 'teams', label: 'Teams', icon: IoPeopleCircleOutline, activeIcon: IoPeopleCircle, path: '/teams' },
  ],
  'project-manager': [
    { key: 'dashboard', label: 'Dashboard', icon: IoGridOutline, activeIcon: IoGrid, path: '/dashboard' },
    { key: 'projects', label: 'Projects', icon: IoFolderOutline, activeIcon: IoFolder, path: '/projects' },
    { key: 'teams', label: 'Teams', icon: IoPeopleCircleOutline, activeIcon: IoPeopleCircle, path: '/teams' },
    { key: 'modules', label: 'Modules', icon: IoLayersOutline, activeIcon: IoLayers, path: '/modules' },
    { key: 'todo', label: 'Todo', icon: IoCalendarOutline, activeIcon: IoCalendar, path: '/todo' },
  ],
  'team-owner': [
    { key: 'dashboard', label: 'Dashboard', icon: IoGridOutline, activeIcon: IoGrid, path: '/dashboard' },
    { key: 'modules', label: 'Modules', icon: IoLayersOutline, activeIcon: IoLayers, path: '/modules' },
    { key: 'tasks', label: 'Tasks', icon: IoCheckboxOutline, activeIcon: IoCheckbox, path: '/tasks' },
    { key: 'todo', label: 'Todo', icon: IoCalendarOutline, activeIcon: IoCalendar, path: '/todo' },
  ],
  'developer': [
    { key: 'dashboard', label: 'Dashboard', icon: IoGridOutline, activeIcon: IoGrid, path: '/dashboard' },
    { key: 'tasks', label: 'Tasks', icon: IoCheckboxOutline, activeIcon: IoCheckbox, path: '/tasks' },
    { key: 'todo', label: 'Todo', icon: IoCalendarOutline, activeIcon: IoCalendar, path: '/todo' },
  ],
};

const Sidebar = () => {
  const { user, logout, getRole } = useAuth();
  const { activeMenu, setActiveMenu, sidebarOpen, closeSidebar } = useMenu();
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRole();
  const navItems = navConfig[role] || [];

  const handleNav = (item) => {
    setActiveMenu(item.key);
    navigate(item.path);
    if (window.innerWidth <= 1024) closeSidebar();
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const displayName = user?.ownerName || user?.name || 'User';
  const displayRole = role === 'master-Admin' ? 'Master Admin' : role?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <>
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <IoCodeSlash className="brand-icon" />
          <span className="brand-text">Smart DevColab</span>
          <button className="sidebar-close-btn" onClick={closeSidebar}><IoClose size={20} /></button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.path) || activeMenu === item.key;
            const Icon = isActive ? item.activeIcon : item.icon;
            return (
              <button key={item.key} className={`nav-item ${isActive ? 'nav-item-active' : ''}`} onClick={() => handleNav(item)} title={item.label}>
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{displayName.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <p className="user-name">{displayName}</p>
              <span className="user-role-badge">{displayRole}</span>
            </div>
          </div>
          <button className="nav-item nav-logout" onClick={handleLogout}>
            <IoLogOutOutline className="nav-icon" />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
