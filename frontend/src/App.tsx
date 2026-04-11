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
import ManagerSettings from './pages/manager/ManagerSettings';
import AuditorDashboard from './pages/auditor/AuditorDashboard';
import AuditorWorkspace from './pages/auditor/AuditorWorkspace';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminMappings from './pages/admin/AdminMappings';
import BusinessUnitsList from './pages/admin/BusinessUnitsList';
import AccessControl from './pages/admin/AccessControl';
import AdminAuditDetail from './pages/admin/AdminAuditDetail';
import Settings from './pages/admin/Settings';
import EngagementChat from './pages/shared/EngagementChat';

// Client Imports
import ExecutiveCockpit from './pages/client/ExecutiveCockpit';
import ClientInsights from './pages/client/Insights';
import ClientNlSearch from './pages/client/NlSearch';
import ClientClarifications from './pages/client/ClarificationsInbox';
import ClientReportReview from './pages/client/ReportReview';
import ClientAuditList from './pages/client/ClientAuditList';
import ClientAuditDetail from './pages/client/ClientAuditDetail';
import ClientReportsList from './pages/client/ClientReportsList';
import CorrectiveActionPlans from './pages/client/CorrectiveActionPlans';
import ClientSettings from './pages/client/ClientSettings';

import { useAuthStore } from './stores/auth';
import { Toaster } from 'sonner';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const NavigateToDashboard = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <FirstLoginGuard>
                  <MainLayout>
                    <Routes>
                      {/* Admin Routes */}
                      <Route path="admin/*" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <Routes>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="users" element={<UsersList />} />
                            <Route path="users/:id" element={<UserDetail />} />
                            <Route path="business-units" element={<BusinessUnitsList />} />
                            <Route path="ai-models" element={<AiModelsList />} />
                            <Route path="admin/templates" element={<TemplateLibraryList />} />
                            <Route path="templates" element={<TemplateLibraryList />} />
                            <Route path="templates/new" element={<TemplateEditor />} />
                            <Route path="templates/:id" element={<TemplateEditor />} />
                            <Route path="audit-oversight" element={<AuditOversight />} />
                            <Route path="audits/:id" element={<AdminAuditDetail />} />
                            <Route path="exceptional-requests" element={<ExceptionalRequestsList />} />
                            <Route path="access-control" element={<AccessControl />} />
                            <Route path="mappings" element={<AdminMappings />} />
                            <Route path="audit-logs" element={<AdminAuditLogs />} />
                          </Routes>
                        </ProtectedRoute>
                      } />

                      {/* Manager Routes */}
                      <Route path="manager/*" element={
                        <ProtectedRoute allowedRoles={['manager']}>
                          <Routes>
                            <Route path="audits" element={<KanbanBoard />} />
                            <Route path="dashboard" element={<Navigate to="/manager/audits" replace />} />
                            <Route path="audits/new" element={<NewAuditForm />} />
                            <Route path="audits/:id" element={<AuditDetail />} />
                            <Route path="audits/:id/edit" element={<AuditDetail editMode={true} />} />
                            <Route path="heatmap" element={<HeatmapPage />} />
                            <Route path="clarifications" element={<ClarificationsPage />} />
                            <Route path="chats/:id" element={<EngagementChat />} />
                            <Route path="settings" element={<ManagerSettings />} />
                          </Routes>
                        </ProtectedRoute>
                      } />

                      {/* Auditor Routes */}
                      <Route path="auditor/*" element={
                        <ProtectedRoute allowedRoles={['auditor']}>
                          <Routes>
                            <Route path="dashboard" element={<AuditorDashboard />} />
                            <Route path="workspace/:id" element={<AuditorWorkspace />} />
                            <Route path="chats/:id" element={<EngagementChat />} />
                          </Routes>
                        </ProtectedRoute>
                      } />
                      
                      {/* Client Routes */}
                      <Route path="client/*" element={
                        <ProtectedRoute allowedRoles={['client']}>
                          <Routes>
                            <Route path="dashboard" element={<ExecutiveCockpit />} />
                            <Route path="audits" element={<ClientAuditList />} />
                            <Route path="audits/:id" element={<ClientAuditDetail />} />
                            <Route path="insights" element={<ClientInsights />} />
                            <Route path="search" element={<ClientNlSearch />} />
                            <Route path="clarifications" element={<ClientClarifications />} />
                            <Route path="reports" element={<ClientReportsList />} />
                            <Route path="reports/:id/review" element={<ClientReportReview />} />
                            <Route path="corrective-actions" element={<CorrectiveActionPlans />} />
                            <Route path="chat/:id" element={<EngagementChat />} />
                            <Route path="settings" element={<ClientSettings />} />
                          </Routes>
                        </ProtectedRoute>
                      } />

                      {/* Basic Settings */}
                      <Route path="settings" element={<Settings />} />

                      <Route path="/" element={<NavigateToDashboard />} />
                      
                      {/* Redirect old /dashboard to root */}
                      <Route path="dashboard" element={<Navigate to="/" replace />} />
                      
                      <Route path="*" element={<div>404 Not Found</div>} />
                    </Routes>
                  </MainLayout>
                </FirstLoginGuard>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}

export default App;
