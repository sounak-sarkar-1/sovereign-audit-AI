import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/services/auditService';
import { 
  History, 
  User, 
  Calendar, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  UserPlus, 
  Play,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditTrailProps {
  auditId: string;
}

const AuditTrail: React.FC<AuditTrailProps> = ({ auditId }) => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-trail', auditId],
    queryFn: () => auditService.getAuditTrail(auditId),
  });

  const getActionIcon = (action: string) => {
    if (action.includes('CREATED')) return <FileText size={16} className="text-blue-500" />;
    if (action.includes('ASSIGNED')) return <UserPlus size={16} className="text-accent" />;
    if (action.includes('STARTED')) return <Play size={16} className="text-green-500" />;
    if (action.includes('SUBMITTED')) return <CheckCircle2 size={16} className="text-primary" />;
    if (action.includes('EXCEPTION')) return <AlertCircle size={16} className="text-amber-500" />;
    if (action.includes('CLARIFICATION')) return <MessageSquare size={16} className="text-indigo-500" />;
    return <History size={16} className="text-bg-muted" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12 bg-bg-warm/10 rounded-xl border border-dashed border-bg-mid">
        <p className="text-sm text-bg-muted italic">No activity recorded for this audit yet.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-bg-mid">
      {logs.map((log: any) => (
        <div key={log.id} className="relative">
          {/* Timeline Dot */}
          <div className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-sm z-10">
            {getActionIcon(log.actionType)}
          </div>
          
          <Card className="border-none shadow-card hover:shadow-elevated transition-all rounded-xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-sm font-bold text-dark dark:text-white uppercase tracking-tight">
                    {log.actionType.replace(/_/g, ' ')}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0 border-primary/20 bg-primary/5 text-primary">
                      {log.actorRole}
                    </Badge>
                    <span className="text-[10px] text-bg-muted font-bold flex items-center gap-1">
                      <User size={10} /> {log.actorUser?.fullName || 'System'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-dark/70 dark:text-bg-mid flex items-center gap-1 justify-end">
                    <Calendar size={10} /> {format(new Date(log.createdAt), 'MMM d, yyyy')}
                  </div>
                  <div className="text-[9px] text-bg-muted font-black tracking-widest mt-0.5">
                    {format(new Date(log.createdAt), 'HH:mm:ss')}
                  </div>
                </div>
              </div>

              {log.payload && Object.keys(log.payload).length > 0 && (
                <div className="mt-3 pt-3 border-t border-bg-mid/50 bg-bg-warm/5 rounded-lg p-2">
                   <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {Object.entries(log.payload).slice(0, 4).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex flex-col">
                          <dt className="text-[8px] uppercase font-black text-bg-muted tracking-widest">{key}</dt>
                          <dd className="text-[10px] font-semibold text-dark truncate">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </dd>
                        </div>
                      ))}
                   </dl>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default AuditTrail;
