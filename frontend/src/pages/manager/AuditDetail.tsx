import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Settings, 
  Play, 
  Calendar, 
  Building2, 
  Users, 
  ChevronRight,
  Info,
  Clock,
  MoreVertical,
  AlertTriangle,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { auditService } from '@/services/auditService';
import { AuditStatus } from '@/types/audit';
import { format } from 'date-fns';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import ScopeTab from './ScopeTab';
import AssignmentsTab from './AssignmentsTab';
import ExceptionsTab from './ExceptionsTab';
import ReportsTab from './ReportsTab';

const AuditDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: audit, isLoading } = useQuery({
    queryKey: ['audit', id],
    queryFn: () => auditService.getAudit(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-12 text-center">Loading audit details...</div>;
  if (!audit) return <div className="p-12 text-center">Audit not found</div>;

  const isDraft = audit.status === AuditStatus.DRAFT;
  const canStart = isDraft && (audit.assignments?.length || 0) > 0;

  const getStatusVariant = (status: AuditStatus) => {
    switch (status) {
      case 'draft': return 'draft';
      case 'in_progress': return 'inProgress';
      case 'under_manager_review': return 'underReview';
      case 'pending_client_review': return 'pendingClient';
      case 'closed': return 'closed';
      case 'reopened': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center text-[11px] uppercase tracking-wider font-bold text-bg-muted gap-2">
            <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/manager/audits')}>Audits</span>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-dark dark:text-bg-mid">{audit.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-dark dark:text-white">{audit.name}</h1>
            <Badge variant={getStatusVariant(audit.status)} className="capitalize">
              {audit.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isDraft && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      className="rounded-full shadow-elevated"
                      disabled={!canStart}
                    >
                      <Play className="mr-2 h-4 w-4" /> Start Audit
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canStart && (
                  <TooltipContent>
                    <p>Requires at least one auditor assignment</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full h-9 px-3 border-bg-mid">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
            <Button variant="outline" size="icon" className="rounded-full w-9 h-9 border-bg-mid">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Content */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="scope" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="scope">Scope</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
              <TabsTrigger value="report">Report</TabsTrigger>
            </TabsList>

            <TabsContent value="scope" className="mt-0">
              <ScopeTab audit={audit} isDraft={isDraft} />
            </TabsContent>
            
            <TabsContent value="assignments" className="mt-0">
               <AssignmentsTab audit={audit} isDraft={isDraft} />
            </TabsContent>

            <TabsContent value="exceptions" className="mt-0">
               <ExceptionsTab audit={audit} isDraft={isDraft} />
            </TabsContent>

            <TabsContent value="interactions" className="mt-0">
               <Card className="flex flex-col items-center justify-center py-20 text-center">
                 <div className="w-16 h-16 bg-bg-warm dark:bg-[#1a0d35] rounded-full flex items-center justify-center mb-4 text-bg-muted">
                    <Users size={32} />
                 </div>
                 <h3 className="text-sm font-medium text-dark dark:text-bg-mid">Interactions Hub</h3>
                 <p className="text-xs text-bg-muted mt-1 max-w-[240px]">Direct client communications and clarification threads will appear here.</p>
               </Card>
            </TabsContent>

            <TabsContent value="report" className="mt-0">
               <ReportsTab 
                 auditId={audit.id} 
                 auditStatus={audit.status} 
                 auditName={audit.name} 
               />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel: Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-bg-muted mb-6">Audit Summary</h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-bg-muted">Overall Progress</span>
                  <span className="text-lg font-bold text-dark dark:text-white leading-none">{audit.completionPercentage || 0}%</span>
                </div>
                <Progress value={audit.completionPercentage || 0} className="h-2" />
              </div>

              <div className="h-px bg-bg-mid dark:bg-[#3d2a5a]" />

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-bg-warm dark:bg-[#1a0d35] flex items-center justify-center shrink-0">
                    <UserIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-bg-muted uppercase font-bold tracking-tight">Client Contact</p>
                    <p className="text-sm font-semibold text-dark dark:text-bg-mid">{audit.client?.fullName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-bg-warm dark:bg-[#1a0d35] flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-bg-muted uppercase font-bold tracking-tight">Business Units</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {audit.businessUnits?.map((bu: any) => (
                        <Badge key={bu.id} variant="secondary" className="text-[10px] px-2 py-0 h-5">{bu.name}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-bg-warm dark:bg-[#1a0d35] flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-bg-muted uppercase font-bold tracking-tight">Engagement Timeline</p>
                    <p className="text-sm font-semibold text-dark dark:text-bg-mid">
                      {audit.startDate ? format(new Date(audit.startDate), 'MMM d, yyyy') : 'TBD'} - 
                      {audit.expectedCompletionDate ? format(new Date(audit.expectedCompletionDate), 'MMM d, yyyy') : 'TBD'}
                    </p>
                    {audit.expectedCompletionDate && new Date(audit.expectedCompletionDate) < new Date() && (
                      <div className="flex items-center gap-1 text-destructive font-bold text-[10px] mt-1 bg-destructive/10 px-2 py-0.5 rounded-full w-fit">
                        <AlertTriangle size={10} /> OVERDUE
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-bg-warm dark:bg-[#1a0d35] flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-bg-muted uppercase font-bold tracking-tight">Audit Team</p>
                    <div className="flex -space-x-2 mt-1">
                      {audit.assignments?.map((as: any, i: number) => (
                        <div 
                          key={i} 
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-[#2d1f45] bg-bg-mid dark:bg-[#3d2a5a] flex items-center justify-center text-[10px] font-bold text-dark dark:text-white" 
                          title={as.auditor.fullName}
                        >
                          {as.auditor.fullName.charAt(0)}
                        </div>
                      ))}
                      {(audit.assignments?.length || 0) === 0 && (
                        <span className="text-xs text-bg-muted italic font-normal">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-primary/5 dark:bg-accent/5 border border-primary/10 dark:border-accent/10 shadow-none">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-accent flex items-center gap-2 mb-3">
              <Info size={14} />
              Quick Status
            </h4>
            <div className="space-y-4">
              <p className="text-xs text-dark/70 dark:text-bg-muted leading-relaxed">
                Management view for <strong>{audit.name}</strong>. Currently <strong>{audit.status.replace('_', ' ')}</strong>. 
                {isDraft ? "Complete the scope definition and auditor assignments to start." : "Monitor auditor progress and approve exceptions."}
              </p>
              <Button variant="secondary" size="sm" className="w-full justify-start h-8 px-3 text-[11px] font-bold bg-white dark:bg-[#1a0d35] shadow-sm">
                <Clock className="mr-2 h-3.5 w-3.5" /> VIEW AUDIT TRAIL
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuditDetail;
