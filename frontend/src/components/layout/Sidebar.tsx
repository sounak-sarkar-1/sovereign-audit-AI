import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Map, 
  FileText, 
  Settings, 
  ClipboardCheck, 
  AlertTriangle, 
  BarChart3, 
  History,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileCheck,
  Briefcase,
  TrendingUp,
  Activity,
  User,
  Key,
  MessageSquare,
  Library,
  Shield,
  Layout,
  CheckCircle2,
  Clock,
  Search,
  Play,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth';
import { useQuery } from '@tanstack/react-query';
import { exceptionService } from '../../services/exceptionService';
import { clarificationService } from '../../services/clarificationService';
import { exceptionalRequestService } from '../../services/exceptionalRequestService';
import { clientService } from '../../services/clientService';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Button } from "../../components/ui/button";

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: FileCheck, label: 'Audit Oversight', path: '/admin/audit-oversight' },
  { icon: History, label: 'Audit Logs', path: '/admin/audit-logs' },
  { icon: Shield, label: 'Mappings', path: '/admin/mappings' },
  { icon: AlertTriangle, label: 'Exceptional Requests', path: '/admin/exceptional-requests' },
  { icon: Users, label: 'User Management', path: '/admin/users' },
  { icon: Map, label: 'Business Units', path: '/admin/business-units' },
  { icon: FileText, label: 'Audit Templates', path: '/admin/templates' },
  { icon: Play, label: 'AI Model Config', path: '/admin/ai-models' },
  { icon: ShieldCheck, label: 'Access Control', path: '/admin/access-control' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const managerNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/manager/dashboard' },
  { icon: ClipboardList, label: 'Audit Portfolio', path: '/manager/audits' },
  { icon: MessageSquare, label: 'Clarifications', path: '/manager/clarifications' },
  { icon: Map, label: 'Heatmap', path: '/manager/heatmap' },
  { icon: Library, label: 'Template Library', path: '/admin/templates' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const auditorNavItems = [
  { icon: LayoutDashboard, label: 'Task Dashboard', path: '/auditor/dashboard' },
  { icon: Briefcase, label: 'Audit Assignments', path: '/auditor/dashboard' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const clientNavItems = [
  { icon: Activity, label: 'Executive Cockpit', path: '/client/dashboard' },
  { icon: ClipboardList, label: 'Audit Inventory', path: '/client/audits' },
  { icon: TrendingUp, label: 'Compliance Insights', path: '/client/insights' },
  { icon: Search, label: 'AI Search', path: '/client/search' },
  { icon: MessageSquare, label: 'Clarification Inbox', path: '/client/clarifications' },
  { icon: FileText, label: 'Report Hub', path: '/client/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = ({ isOpen, onToggle }: { isOpen: boolean, onToggle: () => void }) => {
  const { user, clearAuth } = useAuthStore();
  
  const { data: exceptions } = useQuery({
    queryKey: ['all-pending-exceptions'],
    queryFn: () => exceptionService.getExceptions('all', 'pending'),
    enabled: user?.role === 'manager',
  });

  const { data: clarificationThreads } = useQuery({
    queryKey: ['all-pending-clarifications'],
    queryFn: () => clarificationService.getClarifications('responded'),
    enabled: user?.role === 'manager',
  });

  const { data: pendingRequests } = useQuery({
    queryKey: ['all-pending-exceptional-requests'],
    queryFn: () => exceptionalRequestService.getRequests('pending'),
    enabled: user?.role === 'admin',
  });

  const { data: clientClarifications } = useQuery({
    queryKey: ['client-pending-clarifications'],
    queryFn: () => clientService.getClarifications({ status: 'pending' }),
    enabled: user?.role === 'client',
  });

  const pendingExceptionCount = (exceptions as any)?.data?.length || (exceptions as any)?.length || 0;
  const pendingClarificationCount = user?.role === 'client' 
    ? (clientClarifications as any)?.length || 0
    : (clarificationThreads as any)?.data?.length || (clarificationThreads as any)?.length || 0;
  const pendingRequestCount = (pendingRequests as any)?.data?.length || (pendingRequests as any)?.length || 0;

  const navItems = user?.role === 'admin' 
    ? adminNavItems 
    : user?.role === 'manager' 
      ? managerNavItems 
      : user?.role === 'client'
        ? clientNavItems
        : auditorNavItems;

  return (
    <aside 
      className={cn(
        "bg-white dark:bg-[#1a0d35] h-full transition-all duration-300 flex flex-col z-30 shadow-sidebar border-r border-bg-mid dark:border-[#3d2a5a]",
        isOpen ? "w-60" : "w-16"
      )}
    >
      <div className="h-14 flex items-center justify-between px-5">
        <div className={cn("flex items-center gap-2 overflow-hidden", !isOpen && "hidden")}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-card">S</div>
          <span className="font-semibold text-dark dark:text-white whitespace-nowrap">Sovereign Audit</span>
        </div>
        <button 
          onClick={onToggle}
          className="p-1.5 hover:bg-bg-warm dark:hover:bg-[#261840] rounded-full text-bg-muted transition-colors"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-5 overflow-y-auto hide-scrollbar space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center h-10 px-4 mx-2 transition-all duration-150 relative group rounded-full",
              isActive 
                ? "bg-bg-warm dark:bg-[#261840] text-dark dark:text-accent font-medium shadow-sm" 
                : "text-bg-muted hover:text-dark dark:hover:text-white hover:bg-bg-warm/50 dark:hover:bg-[#261840]/50",
              !isOpen && "justify-center"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={20} 
                  className={cn(
                    "transition-colors",
                    isActive ? "text-primary dark:text-accent" : "text-bg-muted"
                  )} 
                />
                
                {isOpen && (
                  <div className="ml-3 flex items-center relative flex-1 truncate">
                    {isActive && (
                      <div className="absolute left-[-12px] w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>
                )}

                {/* Status Badges */}
                {item.label === 'Audit Portfolio' && pendingExceptionCount > 0 && (
                  <div className={cn(
                    "bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                    isOpen ? "ml-auto px-2 py-0.5 min-w-[18px]" : "absolute top-1 right-1 w-4 h-4 shadow-sm"
                  )}>
                    {pendingExceptionCount}
                  </div>
                )}
                {(item.label === 'Clarifications' || item.label === 'Clarification Inbox') && pendingClarificationCount > 0 && (
                  <div className={cn(
                    "bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                    isOpen ? "ml-auto px-2 py-0.5 min-w-[18px]" : "absolute top-1 right-1 w-4 h-4 shadow-sm"
                  )}>
                    {pendingClarificationCount}
                  </div>
                )}
                {item.label === 'Exceptional Requests' && pendingRequestCount > 0 && (
                  <div className={cn(
                    "bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                    isOpen ? "ml-auto px-2 py-0.5 min-w-[18px]" : "absolute top-1 right-1 w-4 h-4 shadow-sm"
                  )}>
                    {pendingRequestCount}
                  </div>
                )}
                
                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-dark text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-dropdown">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Card */}
      {user && (
        <div className={cn("px-3 pb-3 mt-auto", !isOpen && "px-2")}>
          {isOpen ? (
            <Popover>
              <PopoverTrigger asChild>
                <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#2d1f45] shadow-card border border-bg-mid dark:border-[#3d2a5a] cursor-pointer group transition-all hover:shadow-elevated" data-testid="user-profile-card">
                  <div className="h-14 w-full bg-gradient-to-br from-primary to-accent relative" />
                  <div className="px-4 pb-4 flex flex-col items-center -mt-5">
                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#2d1f45] bg-bg-warm flex items-center justify-center overflow-hidden shadow-sm z-10">
                      <User size={20} className="text-bg-muted" />
                    </div>
                    <div className="mt-1 flex flex-col items-center">
                      <span className="text-sm font-semibold text-dark dark:text-bg-mid truncate w-full text-center">
                        {user.fullName}
                      </span>
                      <span className="text-xs text-bg-muted truncate w-full text-center">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent side="right" align="end" sideOffset={12} className="w-48 p-1 rounded-2xl shadow-dropdown border border-bg-mid">
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" className="w-full justify-start rounded-full text-sm font-normal">
                    <User size={16} className="mr-2" /> Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start rounded-full text-sm font-normal">
                    <Key size={16} className="mr-2" /> Password
                  </Button>
                  <div className="h-px bg-bg-mid my-1" />
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start rounded-full text-sm font-normal text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={clearAuth}
                  >
                    <LogOut size={16} className="mr-2" /> Logout
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <div className="w-10 h-10 mx-auto rounded-full bg-bg-warm dark:bg-[#2d1f45] border border-bg-mid dark:border-[#3d2a5a] cursor-pointer flex items-center justify-center overflow-hidden shadow-sm hover:shadow-elevated transition-all">
                  <User className="text-bg-muted" size={18} />
                </div>
              </PopoverTrigger>
              <PopoverContent side="right" align="end" sideOffset={12} className="w-48 p-1 rounded-2xl shadow-dropdown border border-bg-mid">
                <div className="px-3 py-2 border-b border-bg-mid mb-1">
                  <div className="text-xs font-semibold text-dark">{user.fullName}</div>
                  <div className="text-[10px] text-bg-muted truncate">{user.email}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" className="w-full justify-start rounded-full text-sm font-normal">
                    <User size={16} className="mr-2" /> Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start rounded-full text-sm font-normal text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={clearAuth}
                  >
                    <LogOut size={16} className="mr-2" /> Logout
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </aside>
  );
};
