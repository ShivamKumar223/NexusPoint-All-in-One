import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';
import { useTheme } from '../../context/ThemeContext';
import { IoMenuOutline, IoSunnyOutline, IoMoonOutline } from 'react-icons/io5';
import NotificationPanel from '../common/NotificationPanel';
import './Topbar.css';

const Topbar = () => {
  const { user } = useAuth();
  const { activeMenu, toggleSidebar } = useMenu();
  const { theme, toggleTheme } = useTheme();

  const displayName = user?.ownerName || user?.name || 'User';
  const pageTitle = activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn-icon topbar-menu-btn" onClick={toggleSidebar}>
          <IoMenuOutline size={22} />
        </button>
        <h2 className="topbar-title">{pageTitle}</h2>
      </div>
      <div className="topbar-right">
        <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <IoSunnyOutline size={20} /> : <IoMoonOutline size={20} />}
        </button>
        <NotificationPanel />
        <div className="topbar-user">
          <div className="topbar-avatar">{displayName.charAt(0).toUpperCase()}</div>
          <span className="topbar-username">{displayName}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
