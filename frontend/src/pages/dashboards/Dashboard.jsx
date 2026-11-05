import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';
import { useEffect } from 'react';
import MasterAdminDashboard from './MasterAdminDashboard';
import AdminDashboard from './AdminDashboard';
import ProjectManagerDashboard from './ProjectManagerDashboard';
import TeamOwnerDashboard from './TeamOwnerDashboard';
import DeveloperDashboard from './DeveloperDashboard';

const Dashboard = () => {
  const { getRole } = useAuth();
  const { setActiveMenu } = useMenu();
  const role = getRole();

  useEffect(() => { setActiveMenu('dashboard'); }, []);

  switch (role) {
    case 'master-Admin': return <MasterAdminDashboard />;
    case 'admin': return <AdminDashboard />;
    case 'project-manager': return <ProjectManagerDashboard />;
    case 'team-owner': return <TeamOwnerDashboard />;
    case 'developer': return <DeveloperDashboard />;
    default: return <div className="empty-state"><h3>Unknown Role</h3><p>Please login again.</p></div>;
  }
};

export default Dashboard;
