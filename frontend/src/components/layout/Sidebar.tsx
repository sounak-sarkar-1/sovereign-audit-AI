import { NavLink } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard, 
  Map, 
  FileText, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ClipboardList,
  Library,
  MessageSquare,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth';
import { useQuery } from '@tanstack/react-query';
import { exceptionService } from '../../services/exceptionService';
import { clarificationService } from '../../services/clarificationService';
import { exceptionalRequestService } from '../../services/exceptionalRequestService';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Eye, label: 'Audit Oversight', path: '/admin/audits' },
  { icon: AlertTriangle, label: 'Exceptional Requests', path: '/admin/exceptional-requests' },
  { icon: Users, label: 'User Management', path: '/admin/users' },
  { icon: Map, label: 'Business Units', path: '/admin/business-units' },
  { icon: FileText, label: 'Audit Templates', path: '/admin/templates' },
  { icon: ShieldCheck, label: 'Access Control', path: '/admin/roles' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const managerNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: ClipboardList, label: 'Audit Portfolio', path: '/manager/audits' },
  { icon: MessageSquare, label: 'Clarifications', path: '/manager/clarifications' },
  { icon: Map, label: 'Heatmap', path: '/manager/heatmap' },
  { icon: Library, label: 'Template Library', path: '/admin/templates' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const auditorNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: ClipboardList, label: 'My Audits', path: '/auditor/audits' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];


export const Sidebar = ({ isOpen, onToggle }: { isOpen: boolean, onToggle: () => void }) => {
  const { user } = useAuthStore();
  
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

  const pendingExceptionCount = exceptions?.length || 0;
  const pendingClarificationCount = clarificationThreads?.length || 0;
  const pendingRequestCount = pendingRequests?.length || 0;

  const navItems = user?.role === 'admin' 
    ? adminNavItems 
    : user?.role === 'manager' 
      ? managerNavItems 
      : auditorNavItems;

  return (
    <aside 
      className={cn(
        "bg-dark text-white h-full transition-all duration-300 flex flex-col z-30",
        isOpen ? "w-60" : "w-16"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <div className={cn("flex items-center gap-2 overflow-hidden", !isOpen && "hidden")}>
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold">S</div>
          <span className="font-semibold whitespace-nowrap">Sovereign Audit</span>
        </div>
        <button 
          onClick={onToggle}
          className="p-1 hover:bg-white/10 rounded-md"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto hide-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }: { isActive: boolean }) => cn(
              "flex items-center h-12 px-4 transition-colors relative group",
              isActive ? "text-accent bg-white/5" : "text-white/70 hover:text-white hover:bg-white/5",
              !isOpen && "justify-center"
            )}
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <item.icon size={20} />
                {isOpen && <span className="ml-3 font-medium truncate">{item.label}</span>}
                {item.label === 'Audit Portfolio' && pendingExceptionCount > 0 && (
                  <div className={cn(
                    "bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                    isOpen ? "ml-auto px-2 py-0.5 min-w-[20px]" : "absolute top-2 right-2 w-4 h-4 shadow-sm"
                  )}>
                    {pendingExceptionCount}
                  </div>
                )}
                {item.label === 'Clarifications' && pendingClarificationCount > 0 && (
                  <div className={cn(
                    "bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                    isOpen ? "ml-auto px-2 py-0.5 min-w-[20px]" : "absolute top-2 right-2 w-4 h-4 shadow-sm"
                  )}>
                    {pendingClarificationCount}
                  </div>
                )}
                {item.label === 'Exceptional Requests' && pendingRequestCount > 0 && (
                  <div className={cn(
                    "bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                    isOpen ? "ml-auto px-2 py-0.5 min-w-[20px]" : "absolute top-2 right-2 w-4 h-4 shadow-sm"
                  )}>
                    {pendingRequestCount}
                  </div>
                )}
                {isActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-accent rounded-l-full" />}
                
                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-dark text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg border border-white/10">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 mb-2">
        <div className={cn("flex items-center gap-2 overflow-hidden", !isOpen && "hidden text-center justify-center")}>
          <div className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Version 1.0</div>
        </div>
      </div>
    </aside>
  );
};
