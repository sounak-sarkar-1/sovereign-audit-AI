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
                      <Route path="admin/dashboard" element={<AdminDashboard />} />
                      <Route path="admin/users" element={<UsersList />} />
                      <Route path="admin/users/:id" element={<UserDetail />} />
                      <Route path="admin/business-units" element={<BusinessUnitsList />} />
                      <Route path="admin/ai-models" element={<AiModelsList />} />
                      <Route path="admin/templates" element={<TemplateLibraryList />} />
                      <Route path="admin/templates/new" element={<TemplateEditor />} />
                      <Route path="admin/templates/:id" element={<TemplateEditor />} />
                      <Route path="admin/audit-oversight" element={<AuditOversight />} />
                      <Route path="admin/audits/:id" element={<AdminAuditDetail />} />
                      <Route path="admin/exceptional-requests" element={<ExceptionalRequestsList />} />
                      <Route path="admin/access-control" element={<AccessControl />} />
                      <Route path="admin/mappings" element={<AdminMappings />} />
                      <Route path="admin/audit-logs" element={<AdminAuditLogs />} />

                      {/* Manager Routes */}
                      <Route path="manager/audits" element={<KanbanBoard />} />
                      <Route path="manager/dashboard" element={<Navigate to="/manager/audits" replace />} />
                      <Route path="manager/audits/new" element={<NewAuditForm />} />
                      <Route path="manager/audits/:id" element={<AuditDetail />} />
                      <Route path="manager/audits/:id/edit" element={<AuditDetail editMode={true} />} />
                      <Route path="manager/heatmap" element={<HeatmapPage />} />
                      <Route path="manager/clarifications" element={<ClarificationsPage />} />
                      <Route path="manager/chats/:id" element={<EngagementChat />} />
                      <Route path="manager/settings" element={<ManagerSettings />} />

                      {/* Auditor Routes */}
                      <Route path="auditor/dashboard" element={<AuditorDashboard />} />
                      <Route path="auditor/workspace/:id" element={<AuditorWorkspace />} />
                      <Route path="auditor/chats/:id" element={<EngagementChat />} />
                      
                      {/* Client Routes */}
                      <Route path="client/dashboard" element={<ExecutiveCockpit />} />
                      <Route path="client/audits" element={<ClientAuditList />} />
                      <Route path="client/audits/:id" element={<ClientAuditDetail />} />
                      <Route path="client/insights" element={<ClientInsights />} />
                      <Route path="client/search" element={<ClientNlSearch />} />
                      <Route path="client/clarifications" element={<ClientClarifications />} />
                      <Route path="client/reports" element={<ClientReportsList />} />
                      <Route path="client/reports/:id/review" element={<ClientReportReview />} />
                      <Route path="client/corrective-actions" element={<CorrectiveActionPlans />} />
                      <Route path="client/chat/:id" element={<EngagementChat />} />
                      <Route path="client/settings" element={<ClientSettings />} />

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
    </QueryClientProvider>
  );
}

export default App;
