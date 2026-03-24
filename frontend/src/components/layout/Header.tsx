import { Bell, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export const Header = ({ onNotificationClick, isSidebarOpen: _isSidebarOpen }: { 
  onNotificationClick: () => void;
  isSidebarOpen: boolean;
}) => {
  const { tenantSlug } = useAuthStore();
  const { meta } = useNotifications({}, true);
  const unreadCount = meta.unreadCount || 0;
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <header className={cn(
      "h-14 bg-white dark:bg-[#1a0d35] border-b border-bg-mid dark:border-[#3d2a5a] flex items-center justify-between px-6 z-20 sticky top-0 transition-colors"
    )}>
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-xs text-bg-muted font-medium">
          <span>Sovereign Audit</span>
          <span className="text-bg-muted/50">›</span>
          <span className="text-dark dark:text-bg-mid">Dashboard</span>
        </div>
        <h1 className="text-xl font-bold text-dark dark:text-white leading-tight">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Tenant Slug Badge */}
        {tenantSlug && (
          <div className="hidden sm:flex items-center bg-[#f0eaff] dark:bg-[#261840] text-primary dark:text-accent text-xs font-medium px-3 py-1 rounded-full shadow-sm">
            {tenantSlug}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 hover:bg-bg-warm dark:hover:bg-[#261840] rounded-full text-bg-muted hover:text-dark dark:hover:text-white transition-all shadow-sm active:scale-95"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {/* Notification Bell */}
          <button 
            onClick={onNotificationClick}
            className="p-2 hover:bg-bg-warm dark:hover:bg-[#261840] rounded-full text-bg-muted hover:text-dark dark:hover:text-white transition-all relative shadow-sm active:scale-95"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2 items-center justify-center rounded-full bg-primary ring-2 ring-white dark:ring-[#1a0d35]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
