import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { MenuProvider } from './context/MenuContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';

import CategoryPage from './pages/auth/CategoryPage';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';

import Dashboard from './pages/dashboards/Dashboard';

import MemberList from './pages/members/MemberList';
import CreateMember from './pages/members/CreateMember';
import MemberDetail from './pages/members/MemberDetail';

import ProjectList from './pages/projects/ProjectList';
import CreateProject from './pages/projects/CreateProject';
import ProjectDetail from './pages/projects/ProjectDetail';

import TeamList from './pages/teams/TeamList';
import CreateTeam from './pages/teams/CreateTeam';
import TeamDetail from './pages/teams/TeamDetail';

import ModuleList from './pages/modules/ModuleList';
import CreateModule from './pages/modules/CreateModule';
import ModuleDetail from './pages/modules/ModuleDetail';

import TaskList from './pages/tasks/TaskList';
import CreateTask from './pages/tasks/CreateTask';
import TaskDetail from './pages/tasks/TaskDetail';

import TodoPage from './pages/todo/TodoPage';

const App = () => {
  return (
    <AuthProvider>
      <AppDataProvider>
        <NotificationProvider>
          <MenuProvider>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<CategoryPage />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />

              {/* Protected routes inside dashboard layout */}
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

                <Route path="/dashboard" element={<Dashboard />} />

                {/* Members */}
                <Route path="/members" element={
                  <ProtectedRoute allowedRoles={['master-Admin','admin']}><MemberList /></ProtectedRoute>
                } />
                <Route path="/members/create" element={
                  <ProtectedRoute allowedRoles={['master-Admin','admin']}><CreateMember /></ProtectedRoute>
                } />
                <Route path="/members/:memberId" element={
                  <ProtectedRoute><MemberDetail /></ProtectedRoute>
                } />

                {/* Projects */}
                <Route path="/projects" element={
                  <ProtectedRoute allowedRoles={['master-Admin','admin','project-manager']}><ProjectList /></ProtectedRoute>
                } />
                <Route path="/projects/create" element={
                  <ProtectedRoute allowedRoles={['project-manager']}><CreateProject /></ProtectedRoute>
                } />
                <Route path="/projects/:projectId" element={
                  <ProtectedRoute allowedRoles={['master-Admin','admin','project-manager']}><ProjectDetail /></ProtectedRoute>
                } />

                {/* Teams */}
                <Route path="/teams" element={
                  <ProtectedRoute allowedRoles={['master-Admin','admin','project-manager','team-owner','developer']}><TeamList /></ProtectedRoute>
                } />
                <Route path="/teams/create" element={
                  <ProtectedRoute allowedRoles={['project-manager']}><CreateTeam /></ProtectedRoute>
                } />
                <Route path="/teams/:teamId" element={
                  <ProtectedRoute><TeamDetail /></ProtectedRoute>
                } />

                {/* Modules */}
                <Route path="/modules" element={
                  <ProtectedRoute allowedRoles={['project-manager','team-owner']}><ModuleList /></ProtectedRoute>
                } />
                <Route path="/modules/create" element={
                  <ProtectedRoute allowedRoles={['project-manager']}><CreateModule /></ProtectedRoute>
                } />
                <Route path="/modules/:moduleId" element={
                  <ProtectedRoute allowedRoles={['project-manager','team-owner']}><ModuleDetail /></ProtectedRoute>
                } />

                {/* Tasks */}
                <Route path="/tasks" element={
                  <ProtectedRoute allowedRoles={['team-owner','developer']}><TaskList /></ProtectedRoute>
                } />
                <Route path="/tasks/create" element={
                  <ProtectedRoute allowedRoles={['team-owner']}><CreateTask /></ProtectedRoute>
                } />
                <Route path="/tasks/:taskId" element={
                  <ProtectedRoute allowedRoles={['team-owner','developer']}><TaskDetail /></ProtectedRoute>
                } />

                {/* Todo */}
                <Route path="/todo" element={
                  <ProtectedRoute allowedRoles={['project-manager','team-owner','developer']}><TodoPage /></ProtectedRoute>
                } />

              </Route>
            </Routes>
          </MenuProvider>
        </NotificationProvider>
      </AppDataProvider>
    </AuthProvider>
  );
};

export default App;
