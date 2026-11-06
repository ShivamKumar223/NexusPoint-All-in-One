import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';

/**
 * AppDataContext — global cache for frequently-used, non-sensitive data
 * Stores: orgMembers, orgTeams, orgProjects per session (invalidated on logout)
 */
const AppDataContext = createContext();

export const AppDataProvider = ({ children }) => {
  const { user, isAuthenticated, getRole } = useAuth();
  const role = getRole?.();

  const [orgMembers, setOrgMembers] = useState([]);
  const [orgTeams, setOrgTeams] = useState([]);
  const [orgProjects, setOrgProjects] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Clear cache when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setOrgMembers([]);
      setOrgTeams([]);
      setOrgProjects([]);
      setProfileData(null);
    }
  }, [isAuthenticated]);

  // Fetch profile for current role
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated || !role) return;
    try {
      const endpointMap = {
        'master-Admin': '/master-admin/profile',
        'admin': '/admin/profile',
        'project-manager': '/project-manager/profile',
        'team-owner': '/team-owner/profile',
        'developer': '/employee/profile',
      };
      const endpoint = endpointMap[role];
      if (!endpoint) return;
      const res = await api.get(endpoint);
      setProfileData(res.data.data);
    } catch { /* silently fail */ }
  }, [isAuthenticated, role]);

  // Fetch all org members (for roles that can see them)
  const fetchOrgMembers = useCallback(async (force = false) => {
    if (!isAuthenticated || (orgMembers.length > 0 && !force)) return orgMembers;
    setLoadingMembers(true);
    try {
      let res;
      if (role === 'master-Admin') res = await api.get('/master-admin/members');
      else if (role === 'admin') res = await api.get('/admin/members');
      else if (role === 'project-manager') res = await api.get('/project-manager/org-members');
      else return [];
      const data = res.data.data || [];
      setOrgMembers(data);
      return data;
    } catch { return []; }
    finally { setLoadingMembers(false); }
  }, [isAuthenticated, role, orgMembers.length]);

  // Fetch all org teams
  const fetchOrgTeams = useCallback(async (force = false) => {
    if (!isAuthenticated || (orgTeams.length > 0 && !force)) return orgTeams;
    setLoadingTeams(true);
    try {
      let res;
      if (role === 'master-Admin') res = await api.get('/master-admin/teams');
      else if (role === 'admin') res = await api.get('/admin/teams');
      else if (role === 'project-manager') res = await api.get('/project-manager/org-teams');
      else return [];
      const data = res.data.data || [];
      setOrgTeams(data);
      return data;
    } catch { return []; }
    finally { setLoadingTeams(false); }
  }, [isAuthenticated, role, orgTeams.length]);

  // Fetch all org projects
  const fetchOrgProjects = useCallback(async (force = false) => {
    if (!isAuthenticated || (orgProjects.length > 0 && !force)) return orgProjects;
    setLoadingProjects(true);
    try {
      let res;
      if (role === 'master-Admin') res = await api.get('/master-admin/projects');
      else if (role === 'admin') res = await api.get('/admin/projects');
      else if (role === 'project-manager') res = await api.get('/project-manager/projects');
      else return [];
      const data = res.data.data || [];
      setOrgProjects(data);
      return data;
    } catch { return []; }
    finally { setLoadingProjects(false); }
  }, [isAuthenticated, role, orgProjects.length]);

  // Invalidate / refetch specific cache
  const invalidate = useCallback((type) => {
    if (type === 'members') setOrgMembers([]);
    if (type === 'teams') setOrgTeams([]);
    if (type === 'projects') setOrgProjects([]);
    if (type === 'profile') setProfileData(null);
  }, []);

  // Auto-fetch profile on login
  useEffect(() => {
    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated, fetchProfile]);

  return (
    <AppDataContext.Provider value={{
      orgMembers, orgTeams, orgProjects, profileData,
      loadingMembers, loadingTeams, loadingProjects,
      fetchOrgMembers, fetchOrgTeams, fetchOrgProjects, fetchProfile,
      invalidate,
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);
