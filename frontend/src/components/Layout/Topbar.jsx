import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';
import { useTheme } from '../../context/ThemeContext';
import { IoMenuOutline, IoSunnyOutline, IoMoonOutline, IoNotificationsOutline } from 'react-icons/io5';
import './Topbar.css';

const Topbar = () => {
  const { user, getRole } = useAuth();
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
        <button className="btn-icon topbar-notif">
          <IoNotificationsOutline size={20} />
          <span className="notif-dot" />
        </button>
        <div className="topbar-user">
          <div className="topbar-avatar">{displayName.charAt(0).toUpperCase()}</div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
