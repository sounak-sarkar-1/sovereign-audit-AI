import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  Calendar, 
  Building2, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  MoreVertical,
  MessageSquare,
  FileText,
  Users
} from 'lucide-react';


import { auditorService } from '@/services/auditorService';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

import ResponseDialog from './ResponseDialog';
import ExceptionDialog from './ExceptionDialog';
import LineItemCommentDialog from './LineItemCommentDialog';
import type { ScopeLineItemExtended } from '@/types/scope';



const AuditorWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeBuId, setActiveBuId] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<ScopeLineItemExtended | null>(null);
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [isExceptionOpen, setIsExceptionOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  // Queries
  const { data: audit, isLoading: isAuditLoading } = useQuery({
    queryKey: ['auditor-audit', id],
    queryFn: () => auditorService.getAuditDetail(id!),
    enabled: !!id,
  });

  const { data: scopeByBu, isLoading: isScopeLoading } = useQuery({
    queryKey: ['auditor-scope', id],
    queryFn: () => auditorService.getScope(id!),
    enabled: !!id,
  });

  React.useEffect(() => {
    if (scopeByBu && scopeByBu.length > 0 && !activeBuId) {
      setActiveBuId(scopeByBu[0].id);
    }
  }, [scopeByBu, activeBuId]);


  // Mutations
  const responseMutation = useMutation({
    mutationFn: (data: any) => auditorService.updateResponse(id!, selectedItem!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditor-scope', id] });
      queryClient.invalidateQueries({ queryKey: ['auditor-audit', id] });
      queryClient.invalidateQueries({ queryKey: ['auditor-audits'] });
      toast.success('Response saved successfully');
      setIsResponseOpen(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save response');
    }
  });

  const exceptionMutation = useMutation({
    mutationFn: (data: any) => auditorService.createException(id!, { ...data, lineItemId: selectedItem!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditor-scope', id] });
      queryClient.invalidateQueries({ queryKey: ['auditor-audit', id] });
      toast.success('Exception request raised successfully');
      setIsExceptionOpen(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to raise exception');
    }
  });

  if (isAuditLoading || isScopeLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  if (!audit) return <div className="p-12 text-center">Audit profile not found.</div>;


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_started': return <Badge variant="outline" className="text-muted-foreground rounded-full px-2 text-[10px] font-bold uppercase tracking-tight">Not Started</Badge>;
      case 'draft_saved': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-full px-2 text-[10px] font-bold uppercase tracking-tight">Draft Saved</Badge>;
      case 'submitted': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded-full px-2 text-[10px] font-bold uppercase tracking-tight">Submitted</Badge>;
      case 'exception_pending': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 rounded-full px-2 text-[10px] font-bold uppercase tracking-tight">Exc. Pending</Badge>;
      case 'exception_approved': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded-full px-2 text-[10px] font-bold uppercase tracking-tight">Exc. Approved</Badge>;
      case 'returned': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 rounded-full px-2 text-[10px] font-bold uppercase tracking-tight">Returned</Badge>;
      default: return <Badge variant="outline" className="rounded-full px-2 text-[10px] font-bold uppercase tracking-tight">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 hover:bg-transparent text-muted-foreground hover:text-dark mb-1 font-bold text-[10px] uppercase tracking-widest"
            onClick={() => navigate('/auditor/audits')}
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-dark">{audit.name}</h1>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full px-3 font-bold uppercase tracking-tight border-none">
              {audit.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="outline" 
             size="sm" 
             className="gap-2 rounded-full border-muted/30 shadow-sm font-bold text-[11px] uppercase tracking-tight"
             onClick={() => navigate(`/auditor/chats/${id}`)}
           >
             <MessageSquare size={16} className="text-primary" /> Engagement Chat
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Workspace (Left) */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={activeBuId} onValueChange={setActiveBuId} className="w-full">
            <div className="border-b border-muted/20">
              <TabsList className="bg-transparent h-12 w-full justify-start rounded-none p-0 overflow-x-auto scrollbar-none">
                {scopeByBu?.map((bu: any) => (
                  <TabsTrigger 
                    key={bu.id} 
                    value={bu.id}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 font-bold text-xs uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary transition-all"
                    data-testid="bu-tab"
                  >
                    {bu.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {scopeByBu?.map((bu: any) => (
              <TabsContent key={bu.id} value={bu.id} className="pt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {bu.items.map((item: ScopeLineItemExtended) => (
                    <Card key={item.id} className={cn(
                      "transition-all border-none shadow-card overflow-hidden",
                      item.status === 'submitted' ? "opacity-90" : 
                      item.status === 'draft_saved' ? "ring-1 ring-primary/20 shadow-elevated" : 
                      item.status === 'exception_pending' ? "ring-1 ring-amber-200" :
                      ""
                    )} data-testid="line-item-card">
                      <CardContent className="p-0">
                        <div className="flex items-stretch overflow-hidden">
                           <div className={cn(
                             "w-1.5 shrink-0",
                             item.status === 'submitted' ? "bg-emerald-500" : 
                             item.status === 'draft_saved' ? "bg-primary" : 
                             item.status === 'exception_pending' ? "bg-amber-500" :
                             "bg-muted/20"
                           )} />
                           <div className="flex-1 p-5 flex justify-between items-start gap-4 bg-white">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(item.status)}
                                  <h4 className="font-bold text-dark text-base tracking-tight">{item.name}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                                
                                {item.ownResponse && (
                                  <div className="mt-4 p-3 bg-muted/20 rounded-xl border border-dashed border-muted/40 text-[11px] font-medium text-dark/60 italic leading-relaxed">
                                    <span className="font-black uppercase tracking-widest text-[9px] block mb-1 text-primary/70 not-italic">Recent Finding Preview</span>
                                    {item.inputMethod === 'free_text' 
                                      ? `${item.ownResponse.responseText?.substring(0, 150)}...` 
                                      : `${item.options?.find(o => o.id === item.ownResponse?.selectedOptionId)?.optionText || 'Assurance response logic applied.'}`
                                    }
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-2">
                                <Button 
                                  size="sm" 
                                  variant={item.status === 'not_started' ? 'default' : 'outline'}
                                  disabled={item.status === 'submitted' || item.status === 'exception_pending'}
                                  onClick={() => { setSelectedItem(item); setIsResponseOpen(true); }}
                                  className="gap-2 rounded-full h-9 px-5 font-bold text-[10px] uppercase tracking-widest shadow-sm"
                                >
                                  <FileText size={14} /> 
                                  {item.status === 'not_started' ? 'Submit Assurance' : 'Edit Response'}
                                </Button>
                                
                                <div className="flex justify-end gap-1">
                                   <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary transition-colors"
                                      onClick={() => { setSelectedItem(item); setIsCommentOpen(true); }}
                                   >
                                      <MessageSquare size={16} />
                                   </Button>
                                   <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground">
                                          <MoreVertical size={16} />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="rounded-xl border-muted/20 shadow-elevated">
                                        <DropdownMenuItem 
                                          className="text-amber-600 font-bold text-xs"
                                          disabled={item.status === 'submitted' || item.status === 'exception_pending'}
                                          onClick={() => { setSelectedItem(item); setIsExceptionOpen(true); }}
                                        >
                                          <ShieldAlert size={14} className="mr-2" /> Raise Exception
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                   </DropdownMenu>
                                </div>
                              </div>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {bu.items.length === 0 && (
                    <Card className="p-16 text-center border-none shadow-none bg-muted/10 rounded-2xl">
                       <ShieldAlert size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                       <h3 className="text-sm font-bold text-dark">No Active Scope Items</h3>
                       <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">This business unit has no controls assigned to your profile for the current engagement.</p>
                    </Card>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Right Sidebar (Summary) */}
        <div className="space-y-6">
          <Card className="shadow-card border-none bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4 border-b">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                <CheckCircle2 size={16} />
                Engagement Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">My Completion</span>
                  <span className="text-xl font-bold text-primary leading-none">{audit.stats.completionPercent}%</span>
                </div>
                <Progress value={audit.stats.completionPercent} className="h-2 bg-muted/20" />
                <div className="flex justify-between items-center text-[9px] text-muted-foreground uppercase font-black tracking-tighter pt-1">
                  <span className="flex items-center gap-1"><FileText size={10} /> {audit.stats.submittedItems} / {audit.stats.totalItems} SUBMITTED</span>
                  <span className="flex items-center gap-1 text-amber-600"><ShieldAlert size={10} /> {audit.stats.pendingExceptions} ENGAGED EXC.</span>
                </div>
              </div>

              <div className="pt-4 border-t border-muted/10 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                   Team Progress
                   <Users size={12} className="opacity-50" />
                </p>
                <div className="space-y-4 overflow-y-auto max-h-[250px] pr-2 scrollbar-thin">
                  {audit.stats.buStats.map((bu: any) => (
                    <div key={bu.id} className="space-y-2">
                       <div className="flex items-center justify-between group">
                          <span className="text-[11px] font-bold text-dark truncate max-w-[140px] group-hover:text-primary transition-colors">{bu.name}</span>
                          <span className="text-[10px] font-black text-primary/60">{bu.coAuditorCompletion}%</span>
                       </div>
                       <Progress value={bu.coAuditorCompletion} className="h-1 bg-muted/10" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark text-white border-none rounded-2xl overflow-hidden shadow-elevated">
            <CardContent className="p-6 space-y-5 relative">
              <div className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-12">
                 <ShieldAlert size={120} />
              </div>
              <div className="space-y-5 relative">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-accent">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/50 uppercase font-black tracking-widest">Engagement Deadline</p>
                    <p className="text-sm font-bold">{format(new Date(audit.endDate), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-accent">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/50 uppercase font-black tracking-widest">Audit Client</p>
                    <p className="text-sm font-bold">{audit.clientName}</p>
                  </div>
                </div>

                <div className="pt-2">
                   <div className="bg-accent/20 border border-accent/20 rounded-xl p-3 flex gap-2">
                      <Clock size={14} className="text-accent shrink-0 mt-0.5" />
                      <p className="text-[10px] font-medium leading-tight text-white/80">
                         Engagement is active. All evidence must be uploaded 48hrs before the deadline for AI pre-validation.
                      </p>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <ResponseDialog 
        item={selectedItem}
        open={isResponseOpen}
        onOpenChange={setIsResponseOpen}
        onSubmit={responseMutation.mutate}
        isPending={responseMutation.isPending}
      />

      <ExceptionDialog 
        item={selectedItem}
        open={isExceptionOpen}
        onOpenChange={setIsExceptionOpen}
        onSubmit={exceptionMutation.mutate}
        isPending={exceptionMutation.isPending}
      />

      <LineItemCommentDialog 
        auditId={id!}
        item={selectedItem}
        open={isCommentOpen}
        onOpenChange={setIsCommentOpen}
      />
    </div>
  );
};

export default AuditorWorkspace;
