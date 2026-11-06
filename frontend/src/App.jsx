import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

import ProjectList from './pages/projects/ProjectList';
import CreateProject from './pages/projects/CreateProject';
import ProjectDetail from './pages/projects/ProjectDetail';

import TeamList from './pages/teams/TeamList';
import CreateTeam from './pages/teams/CreateTeam';
import TeamDetail from './pages/teams/TeamDetail';

import ModuleList from './pages/modules/ModuleList';
import CreateModule from './pages/modules/CreateModule';

import TaskList from './pages/tasks/TaskList';
import CreateTask from './pages/tasks/CreateTask';

import TodoPage from './pages/todo/TodoPage';

const App = () => {
  return (
    <AuthProvider>
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

              {/* Members — master-Admin & admin */}
              <Route path="/members" element={
                <ProtectedRoute allowedRoles={['master-Admin', 'admin']}><MemberList /></ProtectedRoute>
              } />
              <Route path="/members/create" element={
                <ProtectedRoute allowedRoles={['master-Admin', 'admin']}><CreateMember /></ProtectedRoute>
              } />

              {/* Projects — all roles that can see projects */}
              <Route path="/projects" element={
                <ProtectedRoute allowedRoles={['master-Admin', 'admin', 'project-manager']}><ProjectList /></ProtectedRoute>
              } />
              <Route path="/projects/create" element={
                <ProtectedRoute allowedRoles={['project-manager']}><CreateProject /></ProtectedRoute>
              } />
              <Route path="/projects/:projectId" element={
                <ProtectedRoute allowedRoles={['master-Admin', 'admin', 'project-manager']}><ProjectDetail /></ProtectedRoute>
              } />

              {/* Teams */}
              <Route path="/teams" element={
                <ProtectedRoute allowedRoles={['master-Admin', 'admin', 'project-manager', 'team-owner', 'developer']}><TeamList /></ProtectedRoute>
              } />
              <Route path="/teams/create" element={
                <ProtectedRoute allowedRoles={['project-manager']}><CreateTeam /></ProtectedRoute>
              } />
              <Route path="/teams/:teamId" element={
                <ProtectedRoute><TeamDetail /></ProtectedRoute>
              } />

              {/* Modules — project-manager & team-owner */}
              <Route path="/modules" element={
                <ProtectedRoute allowedRoles={['project-manager', 'team-owner']}><ModuleList /></ProtectedRoute>
              } />
              <Route path="/modules/create" element={
                <ProtectedRoute allowedRoles={['project-manager']}><CreateModule /></ProtectedRoute>
              } />

              {/* Tasks — team-owner & developer */}
              <Route path="/tasks" element={
                <ProtectedRoute allowedRoles={['team-owner', 'developer']}><TaskList /></ProtectedRoute>
              } />
              <Route path="/tasks/create" element={
                <ProtectedRoute allowedRoles={['team-owner']}><CreateTask /></ProtectedRoute>
              } />

              {/* Todo — PM, team-owner & developer */}
              <Route path="/todo" element={
                <ProtectedRoute allowedRoles={['project-manager', 'team-owner', 'developer']}><TodoPage /></ProtectedRoute>
              } />

            </Route>
          </Routes>
        </MenuProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
