import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  History, 
  Search, 
  User, 
  Database, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function AdminAuditLogs() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState<string>('all');
  const [entityType, setEntityType] = useState<string>('all');

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page, search, action, entityType],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (search) params.append('search', search);
      if (action !== 'all') params.append('action', action);
      if (entityType !== 'all') params.append('entityType', entityType);

      const response = await api.get(`/admin/audit-logs?${params.toString()}`);
      return response.data;
    },
  });

  const logs = logsData?.data || [];
  const meta = logsData?.meta || { totalPages: 1, total: 0 };

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('add')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (action.includes('update') || action.includes('edit')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (action.includes('delete') || action.includes('remove')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white flex items-center gap-3">
            <History className="text-primary dark:text-accent" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground font-medium">System-wide activity monitoring and compliance tracking.</p>
        </div>
      </div>

      <Card className="p-4 border-bg-mid dark:border-[#3d2a5a] bg-bg-warm/10 dark:bg-[#1a0d35]/50 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-bg-muted" size={18} />
            <Input 
              placeholder="Search by ID or payload content..." 
              className="pl-10 h-10 rounded-lg"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={action} onValueChange={(v) => { setAction(v); setPage(1); }}>
              <SelectTrigger className="w-[160px] h-10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-primary" />
                  <SelectValue placeholder="Action Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
              </SelectContent>
            </Select>

            <Select value={entityType} onValueChange={(v) => { setEntityType(v); setPage(1); }}>
              <SelectTrigger className="w-[160px] h-10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-accent" />
                  <SelectValue placeholder="Entity Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="audit">Audit</SelectItem>
                <SelectItem value="business_unit">Business Unit</SelectItem>
                <SelectItem value="ai_model">AI Model</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" className="h-10 px-3 text-bg-muted hover:text-dark dark:hover:text-white" onClick={() => {
              setSearch('');
              setAction('all');
              setEntityType('all');
              setPage(1);
            }}>
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <div className="bg-white dark:bg-[#120822] rounded-2xl border border-bg-mid dark:border-[#3d2a5a] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-warm/20 dark:bg-[#1a0d35] border-b border-bg-mid dark:border-[#3d2a5a]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-bg-muted">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-bg-muted">Actor</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-bg-muted">Action</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-bg-muted">Entity</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-bg-muted">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-mid dark:divide-[#3d2a5a]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 h-16 bg-bg-warm/5"></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-bg-muted italic">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-bg-warm/20 dark:hover:bg-[#1a0d35]/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark dark:text-white/90">
                        {format(new Date(log.createdAt), 'MMM d, yyyy')}
                      </div>
                      <div className="text-[10px] text-bg-muted font-bold">
                        {format(new Date(log.createdAt), 'HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-dark dark:text-white/90 uppercase tracking-tight">
                            {log.actorUser?.fullName || 'System'}
                          </div>
                          <div className="text-[10px] text-bg-muted uppercase font-black tracking-widest leading-none">
                            {log.actorRole}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={cn("rounded-full px-3 text-[10px] font-black uppercase tracking-widest", getActionColor(log.actionType))}>
                        {log.actionType.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-bold dark:text-white/70 uppercase tracking-tight">{log.entityType.replace(/_/g, ' ')}</span>
                         <span className="text-[10px] text-bg-muted font-mono">{log.entityId?.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-bg-muted hover:text-primary transition-colors">
                              <Info size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="bg-dark text-white border-none p-3 max-w-xs shadow-2xl">
                            <pre className="text-[10px] overflow-auto max-h-[200px] whitespace-pre-wrap">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                            <div className="mt-2 pt-2 border-t border-white/10 text-[9px] uppercase font-bold tracking-widest opacity-50">
                              IP: {log.ipAddress || 'Unknown'}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                       </TooltipProvider>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="px-6 py-4 bg-bg-warm/10 dark:bg-[#1a0d35] flex items-center justify-between border-t border-bg-mid dark:border-[#3d2a5a]">
            <div className="text-xs text-bg-muted font-bold">
              Showing {logs.length} of {meta.total} records
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="h-8 w-8 p-0 rounded-lg border-bg-mid"
              >
                <ChevronLeft size={16} />
              </Button>
              <div className="text-xs font-bold dark:text-white px-2">
                Page {page} of {meta.totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === meta.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="h-8 w-8 p-0 rounded-lg border-bg-mid"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
