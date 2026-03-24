import { 
  X, 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  MessageSquare, 
  FileText, 
  Archive, 
  UserPlus, 
  ShieldAlert,
  Clock,
  Check
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/stores/auth';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/services/notificationService';

export const NotificationDrawer = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user: _currentUser } = useAuthStore();
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, isLoading } = useNotifications();

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }

    // Deep linking logic
    let targetPath = '';
    const { type, relatedEntityType, relatedEntityId, metadata } = notif;
    const role = _currentUser?.role;

    if (relatedEntityType === 'ExceptionRequest' || relatedEntityType === 'exception_request') {
      if (role === 'manager') targetPath = `/manager/audits/${metadata?.auditId}/exceptions`;
      else if (role === 'auditor') targetPath = `/auditor/exceptions`;
    } else if (relatedEntityType === 'ClarificationRequest') {
      if (role === 'client') targetPath = `/client/clarifications`;
      else if (role === 'manager') targetPath = `/manager/audits/${metadata?.auditId}/clarifications`;
    } else if (relatedEntityType === 'Audit') {
      if (role === 'client') targetPath = `/client/audits/${relatedEntityId}`;
    } else if (relatedEntityType === 'AuditReport') {
      if (role === 'manager') targetPath = `/manager/audits/${metadata?.auditId}/reports`;
      else if (role === 'client') targetPath = `/client/reports`;
    } else if (relatedEntityType === 'ExceptionalActionRequest' || relatedEntityType === 'exceptional_action_request') {
      if (role === 'admin') targetPath = `/admin/exceptional-requests`;
      else if (role === 'manager') targetPath = `/manager/audits/${metadata?.auditId}`;
    } else if (type === 'user_created' && role === 'admin') {
       targetPath = '/admin/users';
    }

    if (targetPath) {
      navigate(targetPath);
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'exception_raised': return <AlertTriangle className="text-amber-500" size={18} />;
      case 'exception_approved': return <CheckCircle className="text-green-500" size={18} />;
      case 'exception_rejected': return <XCircle className="text-red-500" size={18} />;
      case 'clarification_request':
      case 'clarification_responded': return <MessageSquare className="text-blue-500" size={18} />;
      case 'report_ready':
      case 'report_sent_to_client': return <FileText className="text-purple-500" size={18} />;
      case 'audit_closed': return <Archive className="text-gray-500" size={18} />;
      case 'user_created': return <UserPlus className="text-cyan-500" size={18} />;
      case 'exceptional_request_raised':
      case 'exceptional_request_resolved': return <ShieldAlert className="text-rose-500" size={18} />;
      default: return <Bell className="text-primary" size={18} />;
    }
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black/40 z-50 transition-opacity flex justify-end",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      <div 
        className={cn(
          "w-full max-w-sm bg-white h-full transition-transform duration-300 transform shadow-2xl flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-16 border-b flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            <h2 className="font-semibold text-dark">Notifications</h2>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="p-1.5 hover:bg-bg-mid rounded-md text-bg-muted hover:text-primary transition-all group"
                title="Mark all as read"
              >
                <Check size={18} />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-bg-mid rounded-md transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-bg-muted">Loading notifications...</div>
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notif: Notification) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    "p-4 hover:bg-bg-mid cursor-pointer transition-colors relative",
                    !notif.isRead && "bg-primary/5 border-l-4 border-l-primary"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="mt-1 shrink-0">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className={cn("text-sm font-semibold truncate", !notif.isRead ? "text-dark" : "text-bg-muted")}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-bg-muted whitespace-nowrap mt-0.5 flex items-center gap-1">
                          <Clock size={10} />
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-bg-muted line-clamp-2 mt-1">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full">
              <div className="w-16 h-16 rounded-full bg-bg-mid flex items-center justify-center text-bg-muted mb-4">
                <Bell size={32} />
              </div>
              <h3 className="font-semibold text-dark">All Caught Up</h3>
              <p className="text-sm text-bg-muted mt-1 max-w-[200px]">You don't have any new notifications at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
