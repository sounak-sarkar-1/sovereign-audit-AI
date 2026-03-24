import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute, FirstLoginGuard } from './components/Guard';
import LoginPage from './pages/auth/Login';
import ResetPasswordPage from './pages/auth/ResetPassword';
import UsersList from './pages/admin/UsersList';
import UserDetail from './pages/admin/UserDetail';
import { AiModelsList } from './pages/admin/AiModelsList';
import TemplateLibraryList from './pages/admin/TemplateLibraryList';
import TemplateEditor from './pages/admin/TemplateEditor';
import ExceptionalRequestsList from './pages/admin/ExceptionalRequestsList';
import AuditOversight from './pages/admin/AuditOversight';
import KanbanBoard from './pages/manager/KanbanBoard';
import NewAuditForm from './pages/manager/NewAuditForm';
import AuditDetail from './pages/manager/AuditDetail';
import HeatmapPage from './pages/manager/HeatmapPage';
import ClarificationsPage from './pages/manager/ClarificationsPage';
import AuditorDashboard from './pages/auditor/AuditorDashboard';
import AuditorWorkspace from './pages/auditor/AuditorWorkspace';
import { useAuthStore } from './stores/auth';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            <Route element={<FirstLoginGuard />}>
              <Route path="/*" element={
                <MainLayout>
                  <Routes>
                    <Route path="dashboard" element={<DashboardSwitcher />} />
                    <Route path="admin/users" element={<UsersList />} />
                    <Route path="admin/users/:userId" element={<UserDetail />} />
                    <Route path="admin/ai-models" element={<AiModelsList />} />
                    <Route path="admin/exceptional-requests" element={<ExceptionalRequestsList />} />
                    <Route path="admin/audits" element={<AuditOversight />} />
                    <Route path="admin/templates" element={<TemplateLibraryList />} />
                    <Route path="admin/templates/create" element={<TemplateEditor />} />
                    <Route path="admin/templates/:id/edit" element={<TemplateEditor />} />
                    <Route path="admin/templates/:id" element={<TemplateEditor />} />
                    
                    {/* Manager Routes */}
                    <Route path="manager/audits" element={<KanbanBoard />} />
                    <Route path="manager/audits/new" element={<NewAuditForm />} />
                    <Route path="manager/audits/:id" element={<AuditDetail />} />
                    <Route path="manager/heatmap" element={<HeatmapPage />} />
                    <Route path="manager/clarifications" element={<ClarificationsPage />} />
                    
                    {/* Auditor Routes */}
                    <Route path="auditor/audits" element={<AuditorDashboard />} />
                    <Route path="auditor/audits/:id" element={<AuditorWorkspace />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<div>404 Not Found</div>} />
                  </Routes>
                </MainLayout>
              } />
            </Route>
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

function DashboardSwitcher() {
  const { user } = useAuthStore();
  if (user?.role === 'admin') return <div>Admin Dashboard (TBD)</div>;
  if (user?.role === 'manager') return <KanbanBoard />;
  if (user?.role === 'auditor') return <AuditorDashboard />;
  return <div>Access Denied</div>;
}

export default App;
