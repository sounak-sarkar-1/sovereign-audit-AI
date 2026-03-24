import { Bell, User, LogOut, Moon } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export const Header = ({ onNotificationClick }: { 
  onNotificationClick: () => void;
  isSidebarOpen: boolean;
}) => {
  const { user, clearAuth } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const { meta } = useNotifications({}, true);
  const unreadCount = meta.unreadCount || 0;

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 z-20 sticky top-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-dark truncate max-w-[300px]">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Search placeholder */}
        <div className="hidden md:flex items-center bg-bg-mid rounded-full px-4 py-1.5 w-64">
           <span className="text-sm text-bg-muted">Search audits...</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-bg-mid rounded-full text-bg-muted hover:text-dark transition-colors">
            <Moon size={20} />
          </button>
          
          <button 
            onClick={onNotificationClick}
            className="p-2 hover:bg-bg-mid rounded-full text-bg-muted hover:text-dark transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white border-2 border-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 py-1 px-2 hover:bg-bg-mid rounded-lg transition-colors border border-transparent hover:border-bg-muted/30"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <User size={18} />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-dark leading-tight">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-[10px] text-accent font-bold uppercase tracking-wider">{user?.role || 'Guest'}</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-xl p-2 z-50">
              <button 
                onClick={() => setProfileOpen(false)}
                className="w-full flex items-center gap-2 p-2 hover:bg-bg-mid rounded text-sm text-dark transition-colors"
              >
                <User size={16} />
                Your Profile
              </button>
              <button 
                onClick={clearAuth}
                className="w-full flex items-center gap-2 p-2 hover:bg-bg-mid rounded text-sm text-red-600 transition-colors border-t mt-1 pt-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
