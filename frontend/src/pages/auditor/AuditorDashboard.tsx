import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ClipboardList, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { auditorService } from '@/services/auditorService';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const AuditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: audits, isLoading } = useQuery({
    queryKey: ['auditor-audits'],
    queryFn: () => auditorService.getAudits(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">My Audits</h1>
          <p className="text-muted-foreground">Manage and respond to your assigned audit scope items.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {audits?.map((audit: any) => (
          <div 
            key={audit.id} 
            className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="p-5 border-b bg-muted/30">
              <div className="flex justify-between items-start mb-2">
                <Badge className={cn(
                  audit.status === 'in_progress' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : 
                  audit.status === 'submitted' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' :
                  'bg-green-100 text-green-700 hover:bg-green-100'
                )}>
                  {audit.status.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Ends {format(new Date(audit.endDate), 'MMM dd, yyyy')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-dark line-clamp-1">{audit.name}</h3>
            </div>
            
            <div className="p-5 flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">My Progress</span>
                  <span className="font-medium">{Math.round(audit.stats.completionPercent)}%</span>
                </div>
                <Progress value={audit.stats.completionPercent} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {audit.stats.submittedItems} of {audit.stats.totalItems} items completed
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-green-600">
                  <CheckCircle2 size={16} />
                  <span>{audit.stats.submittedItems} Done</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Clock size={16} />
                  <span>{audit.stats.draftItems} Drafts</span>
                </div>
                {audit.stats.pendingExceptions > 0 && (
                  <div className="flex items-center gap-1.5 text-orange-600">
                    <AlertCircle size={16} />
                    <span>{audit.stats.pendingExceptions} Exceptions</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-muted/10 border-t mt-auto">
              <Button 
                onClick={() => navigate(`/auditor/audits/${audit.id}`)}
                className="w-full text-white bg-primary hover:bg-primary/90 gap-2"
              >
                Open Workspace
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        ))}

        {(!audits || audits.length === 0) && (
          <div className="col-span-full py-20 bg-white rounded-xl border border-dashed flex flex-col items-center justify-center text-muted-foreground">
            <ClipboardList size={48} className="mb-4 opacity-20" />
            <p>No audits assigned to you yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditorDashboard;
