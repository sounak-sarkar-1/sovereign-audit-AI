import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings, 
  Play, 
  Building2, 
  Users, 
  ChevronRight,
  Info,
  Clock,
  MoreVertical,
  AlertTriangle,
  History,
  User as UserIcon,
  Archive,
  MessageSquare,
  Save,
  X
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Card, 
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { auditService } from '@/services/auditService';
import { managerService } from '@/services/managerService';
import { AuditStatus } from '@/types/audit';
import { format } from 'date-fns';
import { toast } from 'sonner';
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
import AuditTrail from './AuditTrail';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

class TabErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <p className="font-semibold text-destructive">Something went wrong loading this tab.</p>
          <p className="text-xs mt-1">{this.state.error}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const AuditDetail = ({ editMode = false }: { editMode?: boolean }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showTrail, setShowTrail] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: audit, isLoading } = useQuery({
    queryKey: ['audit', id],
    queryFn: () => auditService.getAudit(id!),
    enabled: !!id,
  });

  const [isEditing, setIsEditing] = React.useState(editMode);
  const [formData, setFormData] = React.useState<any>(null);

  React.useEffect(() => {
    if (audit) {
      setFormData({
        name: audit.name,
        description: audit.description || '',
        startDate: audit.startDate ? new Date(audit.startDate) : undefined,
        expectedCompletionDate: audit.expectedCompletionDate ? new Date(audit.expectedCompletionDate) : undefined,
      });
    }
  }, [audit]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => managerService.updateAudit(id!, data),
    onSuccess: () => {
      toast.success('Audit updated successfully');
      queryClient.invalidateQueries({ queryKey: ['audit', id] });
      setIsEditing(false);
      navigate(`/manager/audits/${id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update audit');
    }
  });

  const handleSave = () => {
    if (!formData.name) {
      toast.error('Engagement name is required');
      return;
    }
    updateMutation.mutate(formData);
  };

  const archiveMutation = useMutation({
    mutationFn: (id: string) => managerService.archiveAudit(id),
    onSuccess: () => {
      toast.success('Audit archived successfully');
      queryClient.invalidateQueries({ queryKey: ['audit', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to archive audit');
    }
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => auditService.startAudit(id),
    onSuccess: () => {
      toast.success('Audit started successfully');
      queryClient.invalidateQueries({ queryKey: ['audit', id] });
    },
  });

  if (isLoading) return <div className="p-12 text-center">Loading audit details...</div>;
  if (!audit) return <div className="p-12 text-center">Audit not found</div>;

  const isDraft = audit.status === AuditStatus.DRAFT;
  const canStart = isDraft && (audit.assignments?.length || 0) > 0;
  const canArchive = audit.status === AuditStatus.CLOSED || audit.status === 'deleted' || audit.status === AuditStatus.ARCHIVED;

  const getStatusVariant = (status: AuditStatus) => {
    switch (status) {
      case 'draft': return 'draft';
      case 'in_progress': return 'inProgress';
      case 'under_manager_review': return 'underReview';
      case 'pending_client_review': return 'pendingClient';
      case 'closed': return 'closed';
      case 'reopened': return 'default';
      case 'archived': return 'secondary';
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
            {isEditing ? (
              <Input 
                value={formData?.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-2xl font-bold h-10 border-bg-mid min-w-[300px]"
              />
            ) : (
              <h1 className="text-2xl font-bold text-dark dark:text-white">{audit.name}</h1>
            )}
            <Badge variant={getStatusVariant(audit.status)} className="capitalize">
              {audit.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="rounded-full shadow-sm"
                onClick={() => {
                  setIsEditing(false);
                  navigate(`/manager/audits/${id}`);
                }}
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button 
                className="rounded-full bg-primary shadow-elevated"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" /> {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          ) : (
            <>
              {isDraft && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          className="rounded-full shadow-elevated"
                          disabled={!canStart || startMutation.isPending}
                          onClick={() => startMutation.mutate(id!)}
                          data-testid="start-audit-btn"
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

              {canArchive && audit.status !== AuditStatus.ARCHIVED && (
                <Button 
                    variant="outline" 
                    className="rounded-full border-bg-mid hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                    onClick={() => archiveMutation.mutate(id!)}
                    disabled={archiveMutation.isPending}
                    data-testid="archive-audit-btn"
                >
                    <Archive className="mr-2 h-4 w-4" /> Archive Engagement
                </Button>
              )}

              <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full h-9 px-3 border-bg-mid"
                    onClick={() => setIsEditing(true)}
                    data-testid="edit-audit-btn"
                >
                  <Settings className="mr-2 h-4 w-4" /> Edit Audit
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-9 h-9 border-bg-mid">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
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
               <TabErrorBoundary>
                 <ScopeTab audit={audit} isDraft={isDraft} />
               </TabErrorBoundary>
            </TabsContent>
            
            <TabsContent value="assignments" className="mt-0">
               <TabErrorBoundary>
                 <AssignmentsTab audit={audit} isDraft={isDraft} />
               </TabErrorBoundary>
            </TabsContent>

            <TabsContent value="exceptions" className="mt-0">
               <TabErrorBoundary>
                 <ExceptionsTab audit={audit} isDraft={isDraft} />
               </TabErrorBoundary>
            </TabsContent>

            <TabsContent value="interactions" className="mt-0">
                <TabErrorBoundary>
                  <Card className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                       <MessageSquare size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-dark">Interactions Hub</h3>
                      <p className="text-xs text-muted-foreground max-w-[280px]">Collaborate with the client and audit team in real-time.</p>
                    </div>
                    <Button 
                      className="rounded-full bg-primary hover:bg-primary/90 shadow-sm"
                      onClick={() => navigate(`/manager/chats/${id}`)}
                    >
                      Open Engagement Chat
                    </Button>
                  </Card>
                </TabErrorBoundary>
            </TabsContent>

            <TabsContent value="report" className="mt-0">
               <TabErrorBoundary>
                 <React.Suspense fallback={<div className="p-12 text-center">Loading reports module...</div>}>
                   <ReportsTab 
                     auditId={audit.id} 
                     auditStatus={audit.status} 
                     auditName={audit.name} 
                     completionPercentage={audit.completionPercentage}
                     incompleteMandatoryCount={audit.incompleteMandatoryCount}
                   />
                 </React.Suspense>
               </TabErrorBoundary>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel: Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 shadow-card border-none bg-white">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Audit Summary</h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Overall Progress</span>
                  <span className="text-lg font-bold text-dark leading-none">{audit.completionPercentage || 0}%</span>
                </div>
                <Progress value={audit.completionPercentage || 0} className="h-2 bg-muted/30" />
              </div>

              <div className="h-px bg-muted/20" />

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 text-primary">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Client Contact</p>
                    <p className="text-sm font-bold text-dark">{audit.client?.fullName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 text-primary">
                    <Info className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 w-full">
                    <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Description</Label>
                    {isEditing ? (
                      <Textarea 
                        value={formData?.description} 
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="text-xs h-20 border-bg-mid mt-1"
                        placeholder="Engagement context..."
                      />
                    ) : (
                      <p className="text-sm font-bold text-dark line-clamp-3">{audit.description || 'No description'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center shrink-0 text-accent">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Business Units</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {audit.businessUnits?.map((bu: any) => (
                        <Badge key={bu.id} variant="secondary" className="text-[10px] px-2 py-0 h-5 font-bold uppercase tracking-tight">{bu.name}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-orange-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 w-full">
                    <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Engagement Timeline</Label>
                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-2 mt-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-[11px] h-8 px-2 border-bg-mid">
                              <Clock className="mr-2 h-3.5 w-3.5" />
                              {formData?.startDate ? format(formData.startDate, "MMM d, y") : "Start"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData?.startDate}
                              onSelect={(date) => setFormData({ ...formData, startDate: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-[11px] h-8 px-2 border-bg-mid">
                              <Clock className="mr-2 h-3.5 w-3.5" />
                              {formData?.expectedCompletionDate ? format(formData.expectedCompletionDate, "MMM d, y") : "End"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData?.expectedCompletionDate}
                              onSelect={(date) => setFormData({ ...formData, expectedCompletionDate: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-dark">
                        {audit.startDate ? format(new Date(audit.startDate), 'MMM d, yyyy') : 'TBD'} - 
                        {audit.expectedCompletionDate ? format(new Date(audit.expectedCompletionDate), 'MMM d, yyyy') : 'TBD'}
                      </p>
                    )}
                    {!isEditing && audit.expectedCompletionDate && new Date(audit.expectedCompletionDate) < new Date() && (
                      <div className="flex items-center gap-1 text-red-600 font-black text-[10px] mt-1 bg-red-50 px-2 py-0.5 rounded-full w-fit uppercase tracking-widest">
                        <AlertTriangle size={10} /> OVERDUE
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Audit Team</p>
                    <div className="flex -space-x-2 mt-1">
                      {audit.assignments?.map((as: any, i: number) => (
                        <div 
                          key={i} 
                          className="w-8 h-8 rounded-full border-2 border-white bg-muted/20 flex items-center justify-center text-[10px] font-bold text-dark uppercase" 
                          title={as.auditor.fullName}
                        >
                          {as.auditor.fullName.charAt(0)}
                        </div>
                      ))}
                      {(audit.assignments?.length || 0) === 0 && (
                        <span className="text-[10px] text-muted-foreground italic font-bold">UNASSIGNED</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-muted/10 border-none shadow-none">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-3">
              <Info size={14} />
              Quick Status
            </h4>
            <div className="space-y-4">
              <p className="text-xs text-dark/70 leading-relaxed font-medium">
                Management view for <strong>{audit.name}</strong>. Currently <strong>{audit.status.replace('_', ' ')}</strong>. 
                {isDraft ? "Complete the scope definition and auditor assignments to start." : "Monitor auditor progress and approve exceptions."}
              </p>
              <Sheet open={showTrail} onOpenChange={setShowTrail}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start h-8 px-3 text-[10px] font-black uppercase tracking-widest bg-white shadow-sm hover:bg-muted/5 transition-colors border-muted/30">
                    <Clock className="mr-2 h-3.5 w-3.5" /> VIEW AUDIT TRAIL
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-3">
                       <History className="text-primary" /> Audit Activity Trail
                    </SheetTitle>
                    <SheetDescription className="text-xs font-medium">
                       Chronological log of all actions taken on this audit engagement.
                    </SheetDescription>
                  </SheetHeader>
                  <AuditTrail auditId={audit.id} />
                </SheetContent>
              </Sheet>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuditDetail;
