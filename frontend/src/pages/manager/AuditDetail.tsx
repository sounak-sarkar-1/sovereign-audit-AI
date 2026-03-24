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
  CardContent, 
  CardHeader, 
  CardTitle,
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
  const canStart = isDraft && (audit.assignments?.length || 0) > 0; // Simplified check

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            <span className="cursor-pointer hover:text-foreground" onClick={() => navigate('/manager/audits')}>Audits</span>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium">{audit.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{audit.name}</h1>
            <Badge variant={audit.status === AuditStatus.CLOSED ? "secondary" : "default"} className="capitalize">
              {audit.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDraft && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button 
                      className="bg-accent hover:bg-accent/90"
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
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="scope" className="w-full">
            <div className="flex justify-between items-center border-b pb-1">
              <TabsList className="bg-transparent h-12 w-full justify-start rounded-none border-b-0 p-0">
                <TabsTrigger 
                  value="scope" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6"
                >
                  Scope
                </TabsTrigger>
                <TabsTrigger 
                  value="assignments" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6"
                >
                  Assignments
                </TabsTrigger>
                <TabsTrigger 
                  value="exceptions" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6"
                >
                  Exceptions
                </TabsTrigger>
                <TabsTrigger 
                  value="interactions" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6"
                >
                  Interactions
                </TabsTrigger>
                <TabsTrigger 
                  value="report" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6"
                >
                  Report
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="scope" className="pt-6 space-y-4">
              <ScopeTab audit={audit} isDraft={isDraft} />
            </TabsContent>
            
            <TabsContent value="assignments" className="pt-6">
               <AssignmentsTab audit={audit} isDraft={isDraft} />
            </TabsContent>

            <TabsContent value="exceptions" className="pt-6">
               <ExceptionsTab audit={audit} isDraft={isDraft} />
            </TabsContent>

            <TabsContent value="interactions" className="pt-6">
               <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                Client communications placeholder
              </div>
            </TabsContent>

            <TabsContent value="report" className="pt-6">
               <ReportsTab 
                 auditId={audit.id} 
                 auditStatus={audit.status} 
                 auditName={audit.name} 
               />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel: Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audit Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{audit.completionPercentage || 0}%</span>
                </div>
                <Progress value={audit.completionPercentage || 0} className="h-2" />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <UserIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Client</p>
                    <p className="text-sm font-medium">{audit.client?.fullName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Business Units</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {audit.businessUnits?.map((bu: any) => (
                        <Badge key={bu.id} variant="secondary" className="text-[10px]">{bu.name}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Timeline</p>
                    <p className="text-sm font-medium">
                      {audit.startDate ? format(new Date(audit.startDate), 'MMM d, yyyy') : 'TBD'} - 
                      {audit.expectedCompletionDate ? format(new Date(audit.expectedCompletionDate), 'MMM d, yyyy') : 'TBD'}
                    </p>
                    {audit.expectedCompletionDate && new Date(audit.expectedCompletionDate) < new Date() && (
                      <div className="flex items-center gap-1 text-destructive font-medium text-[11px] mt-1">
                        <AlertTriangle size={12} /> Overdue engagement
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Team</p>
                    <div className="flex -space-x-2 mt-1">
                      {audit.assignments?.map((as: any, i: number) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[11px] font-medium" title={as.auditor.fullName}>
                          {as.auditor.fullName.charAt(0)}
                        </div>
                      ))}
                      {(audit.assignments?.length || 0) === 0 && (
                        <span className="text-sm text-muted-foreground italic font-normal">No auditors assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 font-semibold">
                <Info size={16} className="text-accent" />
                Quick Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                This audit is currently in <strong>{audit.status.replace('_', ' ')}</strong> status. 
                {isDraft ? "Complete the scope definition and auditor assignments to start the engagement." : "Track progress and monitor for any exceptions raised by the auditor team."}
              </p>
              <div className="pt-2">
                <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2 text-xs">
                  <Clock className="mr-2 h-3.5 w-3.5" /> View Audit Trail
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuditDetail;
