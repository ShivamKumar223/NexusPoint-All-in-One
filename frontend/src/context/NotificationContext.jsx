import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

// Local notification store – persisted per user in localStorage
const getKey = (userId) => `sdc_notifs_${userId}`;

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Load saved notifications for this user
  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    const key = getKey(user._id || user.userId || user.memberId || user.email);
    const saved = localStorage.getItem(key);
    setNotifications(saved ? JSON.parse(saved) : []);
  }, [user]);

  // Save whenever notifications change
  useEffect(() => {
    if (!user) return;
    const key = getKey(user._id || user.userId || user.memberId || user.email);
    localStorage.setItem(key, JSON.stringify(notifications));
  }, [notifications, user]);

  // Add a new notification (called from feature pages after mutations)
  const addNotification = useCallback((notif) => {
    const entry = {
      id: Date.now() + Math.random(),
      ...notif,                          // { title, message, type: 'info'|'success'|'warning' }
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [entry, ...prev].slice(0, 50)); // cap at 50
  }, []);

  // Broadcast a notification to all members in a list
  // Since we can't push to other users (no WS backend), we write to their localStorage keys
  const broadcastNotification = useCallback((memberIds, notif) => {
    memberIds.forEach(id => {
      const key = getKey(id);
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const entry = {
        id: Date.now() + Math.random(),
        ...notif,
        timestamp: new Date().toISOString(),
        read: false,
      };
      localStorage.setItem(key, JSON.stringify([entry, ...existing].slice(0, 50)));
    });
    // Also add to self
    addNotification(notif);
  }, [addNotification]);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, addNotification,
      broadcastNotification, markRead, markAllRead, clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
