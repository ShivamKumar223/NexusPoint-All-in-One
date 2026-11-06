import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { IoNotificationsOutline, IoCheckmarkDone, IoTrash, IoClose, IoInformationCircle, IoCheckmarkCircle, IoWarning } from 'react-icons/io5';
import './NotificationPanel.css';

const typeIcon = {
  info: <IoInformationCircle style={{ color: 'var(--info)' }} />,
  success: <IoCheckmarkCircle style={{ color: 'var(--success)' }} />,
  warning: <IoWarning style={{ color: 'var(--warning)' }} />,
};

const NotificationPanel = () => {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = (id) => { markRead(id); };

  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="notif-wrapper" ref={panelRef}>
      <button className="btn-icon notif-trigger" onClick={() => setOpen(o => !o)}>
        <IoNotificationsOutline size={20} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span className="notif-panel-title">Notifications</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {unreadCount > 0 && (
                <button className="btn-icon" title="Mark all read" onClick={markAllRead}>
                  <IoCheckmarkDone size={16} />
                </button>
              )}
              {notifications.length > 0 && (
                <button className="btn-icon" title="Clear all" onClick={clearAll}>
                  <IoTrash size={16} />
                </button>
              )}
              <button className="btn-icon" onClick={() => setOpen(false)}>
                <IoClose size={16} />
              </button>
            </div>
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <IoNotificationsOutline size={32} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.read ? 'notif-unread' : ''}`}
                  onClick={() => handleMarkRead(n.id)}
                >
                  <span className="notif-type-icon">{typeIcon[n.type] || typeIcon.info}</span>
                  <div className="notif-content">
                    <p className="notif-title">{n.title}</p>
                    <p className="notif-message">{n.message}</p>
                    <span className="notif-time">{timeAgo(n.timestamp)}</span>
                  </div>
                  {!n.read && <span className="notif-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
